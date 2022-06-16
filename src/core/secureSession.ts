import defer from '../helpers/defer';
import * as crypto from './crypto';

type ReceivedMessageType = 'created' | 'connected' | 'key' | 'encrypted';
export type IncomingMessage = [ReceivedMessageType, string];

export class ConnectionError extends Error {}

type SessionParams = {
  sid: string | null;
  onCreated: (sid: string) => any;
  onMessage: (plaintext: string, ciphertext: string) => any;
  onClose: (code: number) => any;
};

const errorMessagesByCloseCode = {
  4100: 'Received unexpected message',
  4101: 'Message decryption failed',
  4102: 'Message encryption failed',
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

  socket.onclose = () =>
    promises.forEach(({ reject }) => reject(Error(errorMessagesByCloseCode[4100])));

  socket.onmessage = ({ data }) => {
    const message = parseMessage(data);
    const isInExpectedOrder = order[orderState] === message[0];

    if (isInExpectedOrder) {
      promises[orderState].resolve(message[1]);
      orderState++;
    } else {
      socket.close(4100, errorMessagesByCloseCode[4100]);
    }
  };

  for (const { promise } of promises) yield promise;
}

const createSecret = async (privateKey: CryptoKey, receivedKeyOffer: string) => {
  const receivedJwk = JSON.parse(receivedKeyOffer);
  const receivedKey = await crypto.importKey(receivedJwk);
  const sharedSecret = await crypto.deriveSecretKey(privateKey, receivedKey);
  return sharedSecret;
};

const establishSession = async ({ sid, onCreated, onMessage, onClose }: SessionParams) => {
  const keyPair = await crypto.generateKeyPair();
  const ownExportedPubKey = await crypto.exportKey(keyPair.publicKey);
  const socket = await fetchSocket(SERVER_URL);

  const isInitiator = !sid;
  const receiver = strictReceiver(
    socket,
    isInitiator ? ['created', 'connected', 'key'] : ['connected', 'key']
  );

  if (isInitiator) {
    socket.send(serializeMessage('create'));
    const createdResponse = await receiver.next().value;
    onCreated(createdResponse);
  } else {
    socket.send(serializeMessage('connect', sid));
  }

  await receiver.next().value;
  socket.send(serializeMessage('key', JSON.stringify(ownExportedPubKey)));

  const keyOffer = await receiver.next().value;
  const sharedKey = await createSecret(keyPair.privateKey, keyOffer);
  const sharedKeyFingerprint = await crypto.getKeyFingerprint(sharedKey);

  socket.onclose = (ev) => onClose(ev.code);
  socket.onmessage = async ({ data }) => {
    try {
      const message = parseMessage(data);
      const [, rawCipher] = message;
      const cipher = crypto.parseCipher(rawCipher);

      const plaintext = await crypto.decrypt(cipher, sharedKey);
      const ciphertextFingerprint = await crypto.getFingerprint(cipher.text);

      onMessage(plaintext, ciphertextFingerprint);
    } catch {
      socket.close(4101, errorMessagesByCloseCode[4101]);
    }
  };

  const send = async (data: string) => {
    try {
      const cipher = await crypto.encrypt(data, sharedKey);
      const ciphertextFingerprint = await crypto.getFingerprint(cipher.text);
      const serializedCipher = crypto.serializeCipher(cipher);

      socket.send(serializeMessage('encrypted', serializedCipher));
      return ciphertextFingerprint;
    } catch {
      socket.close(4102, errorMessagesByCloseCode[4102]);
      return '';
    }
  };

  return { sharedKeyFingerprint, send, close: () => socket.close() };
};

export default establishSession;
