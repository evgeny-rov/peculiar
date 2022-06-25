import defer from '../helpers/defer';
import * as crypto from './crypto';

type ReceivedMessageType = 'created' | 'connected' | 'key' | 'encrypted';
export type IncomingMessage = [ReceivedMessageType, string];

export class ConnectionError extends Error {}

type SessionParams = {
  sessionContext?: string;
  onCreated: (sid: string) => any;
  onMessage: (plaintext: string) => any;
  onClose: (code: number) => any;
};

const errorMessagesByCloseCode = {
  4100: 'Received unexpected message',
  4101: 'Message decryption failed',
  4102: 'Message encryption failed',
  4103: 'Session verification failed',
} as const;

const SERVER_URL = 'ws://one-to-one-relay.herokuapp.com/';

export const fetchSocket = (url: string) =>
  new Promise<WebSocket>((res, rej) => {
    const socket = new WebSocket(url);

    if (socket.readyState === socket.OPEN) {
      res(socket);
    } else {
      socket.onopen = () => {
        res(socket);
      };

      socket.onerror = () => rej(new ConnectionError("Couldn't connect to the server"));
    }
  });

const parseMessage = (data: string) => {
  const messageType = data.split(' ', 1)[0];
  const args = data.slice(messageType.length + 1);
  return [messageType, args];
};

const serializeMessage = (...data: [string, ...string[]]) => data.join(' ');

function* strictReceiver(socket: WebSocket, order: ReceivedMessageType[]) {
  let orderState = 0;
  const promises = order.map((type) => ({ ...defer(), type }));

  const abandonListeners = () => {
    socket.onclose = null;
    socket.onmessage = null;
  };

  socket.onclose = () => {
    abandonListeners();
    promises[orderState]?.reject(Error(errorMessagesByCloseCode[4100]));
  };

  socket.onmessage = ({ data }) => {
    const message = parseMessage(data);
    const isInExpectedOrder = order[orderState] === message[0];

    if (isInExpectedOrder) {
      promises[orderState].resolve(message[1]);
      ++orderState >= order.length && abandonListeners();
    } else {
      socket.close(4100, errorMessagesByCloseCode[4100]);
    }
  };

  for (const { promise } of promises) yield promise;
}

const computeSessionHash = (initiatorPubKey: string, guestPubKey: string, sessionId: string) =>
  crypto.computeHash(initiatorPubKey + guestPubKey + sessionId);

const createSession = async (socket: WebSocket, onSuccess: (response: string) => any) => {
  const keyPair = await crypto.generateKeyPair();
  const ownExportedPubKey = await crypto.exportKey(keyPair.publicKey);
  const receiver = strictReceiver(socket, ['created', 'connected', 'key']);

  socket.send(serializeMessage('create'));
  const createdResponse = (await receiver.next().value) as string;

  const initiatorHash = await crypto.computeHash(ownExportedPubKey + createdResponse);
  onSuccess(initiatorHash + createdResponse);

  await receiver.next().value;
  socket.send(serializeMessage('key', ownExportedPubKey));

  const receivedKeyOffer = (await receiver.next().value) as string;
  const receivedKey = await crypto.importKey(receivedKeyOffer);
  const sharedSecret = await crypto.deriveSecretKey(keyPair.privateKey, receivedKey);

  const sessionHash = await computeSessionHash(
    ownExportedPubKey,
    receivedKeyOffer,
    createdResponse
  );

  return { key: sharedSecret, sessionHash };
};

const joinSession = async (socket: WebSocket, serializedSessionOffer: string) => {
  const [receivedInitiatorHash, sessionId] = serializedSessionOffer.match(/.{1,64}/g) || [];
  const keyPair = await crypto.generateKeyPair();
  const ownExportedPubKey = await crypto.exportKey(keyPair.publicKey);
  const receiver = strictReceiver(socket, ['connected', 'key']);

  socket.send(serializeMessage('connect', sessionId));
  await receiver.next().value;

  const receivedKeyOffer = (await receiver.next().value) as string;

  const computedInitiatorHash = await crypto.computeHash(receivedKeyOffer + sessionId);

  if (computedInitiatorHash !== receivedInitiatorHash) {
    socket.close(4103, errorMessagesByCloseCode[4103]);
    throw Error(errorMessagesByCloseCode[4103]);
  }

  socket.send(serializeMessage('key', ownExportedPubKey));
  const receivedKey = await crypto.importKey(receivedKeyOffer);
  const sharedSecret = await crypto.deriveSecretKey(keyPair.privateKey, receivedKey);

  const sessionHash = await computeSessionHash(receivedKeyOffer, ownExportedPubKey, sessionId);

  return { key: sharedSecret, sessionHash };
};

const establishSession = async ({
  sessionContext,
  onCreated,
  onMessage,
  onClose,
}: SessionParams) => {
  const socket = await fetchSocket(SERVER_URL);

  const { key, sessionHash } = sessionContext
    ? await joinSession(socket, sessionContext)
    : await createSession(socket, onCreated);

  socket.onclose = (ev) => onClose(ev.code);
  socket.onmessage = async ({ data }) => {
    try {
      const message = parseMessage(data);
      const [, serializedCipher] = message;
      const cipher = crypto.parseCipher(serializedCipher);
      const plaintext = await crypto.decrypt(cipher, key);

      onMessage(plaintext);
    } catch {
      socket.close(4101, errorMessagesByCloseCode[4101]);
    }
  };

  const send = async (data: string) => {
    try {
      const cipher = await crypto.encrypt(data, key);
      const serializedCipher = crypto.serializeCipher(cipher);

      socket.send(serializeMessage('encrypted', serializedCipher));
    } catch {
      socket.close(4102, errorMessagesByCloseCode[4102]);
    }
  };

  return { hash: sessionHash, send, close: () => socket.close() };
};

export default establishSession;
