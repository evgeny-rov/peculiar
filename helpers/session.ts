import {
  decrypt,
  deriveSecretKey,
  encrypt,
  exportKey,
  generateKeyPair,
  getKeyFingerprint,
  importKey,
} from './crypto';
import parseMessage from './parseMessage';
import { fetchSocket, socketReceiveOnce } from './socket';

export type ServerAcceptedMessageType = 'create' | 'connect';
export type ServerResponseMessageType = 'created' | 'connected';

export type SessionMessageType = ServerResponseMessageType | 'encrypted' | 'key';
export type MessageData = string;

export type SessionSentMessageType = ServerAcceptedMessageType | 'encrypted' | 'key';
export type ReceivedMessage = [SessionMessageType, MessageData];

export type Session = {
  send: (data: MessageData) => Promise<void>;
  close: () => void;
};

type SessionParams = {
  onCreated: (sid: string) => void;
  onEstablished: (fingerprint: string) => void;
  onMessage: (plaintext: string, ciphertext: string) => void;
  onClose: (reason: string) => void;
  sid: string | null;
};

const SERVER_URL = 'ws://localhost:8080/';

const expectMessage = async (socket: WebSocket, expectedType: string, timeout?: number) => {
  const response = await socketReceiveOnce(socket, timeout);
  const message = parseMessage(response);
  const [actualType] = message;

  if (expectedType !== actualType) {
    throw Error('Received unexpected message');
  }

  return message;
};

const sendPlain = (socket: WebSocket, type: SessionSentMessageType, data = '') => {
  socket.send(`${type} ${data}`);
};

const sendEncrypted = async (socket: WebSocket, key: CryptoKey, data: MessageData) => {
  const encrypted = await encrypt(data, key);
  socket.send(`encrypted ${encrypted}`);
};

const exchangeKeys = async (socket: WebSocket, keyPair: CryptoKeyPair) => {
  const myJwk = await exportKey(keyPair.publicKey);
  const keyOffer = expectMessage(socket, 'key', 10000);

  sendPlain(socket, 'key', JSON.stringify(myJwk));

  const [, data] = await keyOffer;
  const receivedJwkJson = JSON.parse(data);
  const receivedJwk = await importKey(receivedJwkJson);
  const sharedSecret = await deriveSecretKey(keyPair.privateKey, receivedJwk);

  return sharedSecret;
};

const handleMessage = async (
  data: string,
  key: CryptoKey,
  onSuccess: (plaintext: string, ciphertext: string) => any,
  onAbort: (reason: string) => any
) => {
  const message = parseMessage(data);
  const [type, ciphertext] = message;

  if (type !== 'encrypted') onAbort('Received incorrect message');

  try {
    const plaintext = await decrypt(ciphertext, key);
    onSuccess(plaintext, ciphertext);
  } catch (e) {
    if (e instanceof Error) {
      onAbort(e.message);
    }
  }
};

export const establishSession = async ({
  onCreated,
  onEstablished,
  onMessage,
  onClose,
  sid,
}: SessionParams): Promise<Session> => {
  const keyPair = await generateKeyPair();
  const socket = await fetchSocket(SERVER_URL);

  const isInitiator = sid === null;

  if (isInitiator) {
    sendPlain(socket, 'create');
    const createdMessage = await expectMessage(socket, 'created', 10000);
    onCreated(createdMessage[1]);
  } else {
    sendPlain(socket, 'connect', sid);
  }

  await expectMessage(socket, 'connected');
  const sharedSecret = await exchangeKeys(socket, keyPair);
  const secretFingerprint = await getKeyFingerprint(sharedSecret);

  socket.onmessage = (ev) => handleMessage(ev.data, sharedSecret, onMessage, onClose);
  socket.onclose = (ev) => onClose(ev.reason);
  socket.onerror = () => onClose('Something went wrong');
  onEstablished(secretFingerprint);

  return {
    send: (data: string) => sendEncrypted(socket, sharedSecret, data),
    close: () => socket.close(),
  };
};
