import { decrypt, deriveSecretKey, encrypt, exportKey, generateKeyPair, importKey } from './crypto';
import fetchSocket from './fetchSocket';
import parseMessage from './parseMessage';

export type ServerAcceptedMessageType = 'create' | 'connect';
export type ServerResponseMessageType = 'created' | 'connected';

export type ClientAcceptedMessageType = ServerResponseMessageType | 'established' | 'text';
export type SessionMessageType = ServerResponseMessageType | 'encrypted' | 'key';

export type MessageData = string;

export type SessionSentMessageType = ServerAcceptedMessageType | 'encrypted' | 'key';
export type ReceivedMessage = [SessionMessageType, MessageData];
export type ClientMessage = [ClientAcceptedMessageType, MessageData];

export type SocketParams = {
  onMessage: (message: ClientMessage) => any;
  onClose: (reason: string) => any;
};

export type Session = {
  createSession: () => void;
  connectToSession: (sid: string) => void;
  send: (data: MessageData) => Promise<void>;
  close: () => void;
};

const validReceivedMessageTypes: SessionMessageType[] = [
  'created',
  'connected',
  'encrypted',
  'key',
];

const isDataValidMessage = (data: string[]): data is ReceivedMessage =>
  (validReceivedMessageTypes as string[]).includes(data[0]);

const createSecureSession = async ({ onMessage, onClose }: SocketParams): Promise<Session> => {
  const SERVER_URL = 'ws://localhost:8080/';
  const socket = await fetchSocket(SERVER_URL);
  const keyPair = await generateKeyPair();
  let sharedSecretKey: CryptoKey | null = null;

  const handleClose = (ev: CloseEvent) => {
    console.log('session received close:', ev.reason);
    onClose(ev.reason);
  };

  const send = (type: SessionSentMessageType, data: MessageData) => {
    console.log('session sending:', type, data);
    socket.send(`${type} ${data}`);
  };

  const sendEncrypted = async (data: MessageData) => {
    console.log('client sending plain:', data);
    if (!sharedSecretKey) {
      return;
    }

    const encrypted = await encrypt(data, sharedSecretKey);
    send('encrypted', encrypted);
    console.log('client sending encrypted:', encrypted);
  };

  const coordinate = async (data: string) => {
    console.log('coordinator: received message data:', data);
    const message = parseMessage(data);
    const isMessageValid = isDataValidMessage(message);

    if (!isMessageValid) {
      socket.close(1000, 'session closed, received incorrect or unknown message');
      return;
    }

    const [type] = message;

    switch (type) {
      case 'connected': {
        const jwk = await exportKey(keyPair.publicKey);
        send('key', JSON.stringify(jwk));
        onMessage(['connected', '']);
        break;
      }
      case 'key': {
        const [, data] = message;
        const jwkJson = JSON.parse(data);
        const jwk = await importKey(jwkJson);
        const derivedSecret = await deriveSecretKey(keyPair.privateKey, jwk);
        sharedSecretKey = derivedSecret;
        onMessage(['established', '']);
        break;
      }
      case 'encrypted': {
        console.log('encrypted block');
        if (sharedSecretKey) {
          const plaintext = await decrypt(message[1], sharedSecretKey);
          console.log(plaintext);
          onMessage(['text', plaintext]);
        }
        break;
      }
      default: {
        onMessage(message as ClientMessage);
        break;
      }
    }
  };

  const close = () => {
    socket.close();
  };

  const createSession = () => send('create', '');
  const connectToSession = (sid: string) => send('connect', sid);

  socket.onmessage = (ev) => coordinate(ev.data);
  socket.onclose = handleClose;

  return { createSession, connectToSession, send: sendEncrypted, close };
};

export default createSecureSession;
