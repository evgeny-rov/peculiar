import {
  decrypt,
  deriveSecretKey,
  encrypt,
  exportKey,
  generateKeyPair,
  getKeyFingerprint,
  importKey,
} from './crypto';
import { AppWebSocket, fetchSocket, IncomingMessage } from './socket';

type SessionParams = {
  onCreated: (sid: string) => void;
  onEstablished: (fingerprint: string) => void;
  onMessage: (plaintext: string, ciphertext: string) => void;
  onClose: (reason: string) => void;
  sid: string | null;
};

export type MessageData = string;
export type Session = {
  send: (data: MessageData) => Promise<void>;
  close: () => void;
};

const SERVER_URL = 'ws://localhost:8080/';

const createSecret = async (privateKey: CryptoKey, receivedKeyOffer: IncomingMessage) => {
  const [, data] = receivedKeyOffer;
  const receivedJwkJson = JSON.parse(data);
  const receivedJwk = await importKey(receivedJwkJson);
  const sharedSecret = await deriveSecretKey(privateKey, receivedJwk);

  return sharedSecret;
};

const handleEncryptedMessage = async (
  message: IncomingMessage,
  key: CryptoKey,
  onSuccess: (plaintext: string, ciphertext: string) => any,
  onAbort: (reason: string) => any
) => {
  const [, ciphertext] = message;

  try {
    const plaintext = await decrypt(ciphertext, key);
    onSuccess(plaintext, ciphertext);
  } catch (e) {
    if (e instanceof Error) {
      onAbort(e.message);
    }
  }
};

const sendEncrypted = async (socket: AppWebSocket, key: CryptoKey, data: MessageData) => {
  const encrypted = await encrypt(data, key);
  socket.send('encrypted', encrypted);
};

export const establishSession = async ({
  onCreated,
  onEstablished,
  onMessage,
  onClose,
  sid,
}: SessionParams): Promise<Session> => {
  const keyPair = await generateKeyPair();
  const myJwkPubKey = await exportKey(keyPair.publicKey);
  const socket = await fetchSocket(SERVER_URL);

  socket.onclose = (ev: any) => onClose(ev.reason);
  socket.onerror = () => onClose('Something went horribly wrong');

  const isInitiator = sid === null;

  const [createdOrder] = isInitiator ? socket.putOrder('created') : [];
  const [connectedOrder, keyOrder] = socket.putOrder('connected', 'key');

  if (isInitiator) {
    socket.send('create');
    const createdData = await createdOrder(10000);
    onCreated((createdData as IncomingMessage)[1]);
  } else {
    socket.send('connect', sid);
  }

  await connectedOrder();
  socket.send('key', JSON.stringify(myJwkPubKey));

  const keyOffer = await keyOrder(15000);
  const sharedSecret = await createSecret(keyPair.privateKey, keyOffer);
  const secretFingerprint = await getKeyFingerprint(sharedSecret);

  socket.listen('encrypted', (message) =>
    handleEncryptedMessage(message, sharedSecret, onMessage, onClose)
  );
  onEstablished(secretFingerprint);

  return {
    send: (data: string) => sendEncrypted(socket, sharedSecret, data),
    close: () => socket.close(),
  };
};
