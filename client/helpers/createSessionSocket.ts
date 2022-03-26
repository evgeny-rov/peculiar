import parseMessage from './parseMessage';

export type ReceivedMessageType = 'created' | 'connected' | 'plaintext';
export type SentMessageType = 'create' | 'connect' | 'plaintext';
export type MessageData = string;

export type ReceivedMessage = [ReceivedMessageType, MessageData];
export type SendFunc = (type: SentMessageType, data: MessageData) => void;

export type SocketParams = {
  onMessage: (respond: SendFunc, message: ReceivedMessage) => any;
  onClose: (reason: string) => any;
};

export type SessionSocket = {
  createSession: () => void;
  connectToSession: (sid: string) => void;
  send: (type: SentMessageType, data: MessageData) => void;
  close: () => void;
};

const validCommands: Array<ReceivedMessageType> = ['created', 'connected', 'plaintext'];

const isReceivedMessageValid = (data: string[]): data is ReceivedMessage =>
  (validCommands as string[]).includes(data[0]);

const createSessionSocket = ({ onMessage, onClose }: SocketParams) =>
  new Promise<SessionSocket>((res, rej) => {
    const SERVER_URL = 'ws://localhost:8080/';
    const socket = new WebSocket(SERVER_URL);

    const send = (type: SentMessageType, data: MessageData = '') => {
      socket.send(`${type} ${data}`);
    };

    const close = () => socket.close();

    const createSession = () => send('create');
    const connectToSession = (sid: string) => send('connect', sid);

    const handleClose = (ev: CloseEvent) => onClose(ev.reason);

    const handleMessage = (ev: MessageEvent) => {
      const message = parseMessage(ev.data);

      isReceivedMessageValid(message)
        ? onMessage(send, message)
        : socket.close(1000, 'session closed, received incorrect or unknown message');
    };

    socket.onopen = () => {
      socket.onmessage = handleMessage;
      socket.onclose = handleClose;
      res({ createSession, connectToSession, send, close });
    };

    socket.onerror = rej;
  });

export default createSessionSocket;
