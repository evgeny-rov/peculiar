import defer, { DeferredRequest } from '../helpers/defer';
import parseMessage from '../helpers/parseMessage';
import createPromiseWithTimeout from '../helpers/promiseWithTimeout';

type SentMessageType = 'create' | 'connect' | 'key' | 'encrypted';
type ReceivedMessageType = 'created' | 'connected' | 'key' | 'encrypted';
export type IncomingMessage = [ReceivedMessageType, string];

type ListenerCallback = (message: IncomingMessage) => void;

type OrderListEntry = DeferredRequest & {
  type: ReceivedMessageType;
};

export class SocketError extends Error {}

const allowedMessages = ['created', 'connected', 'key', 'encrypted'] as ReceivedMessageType[];
export class AppWebSocket extends WebSocket {
  private orderList: OrderListEntry[];
  private listeners: Array<[ReceivedMessageType, ListenerCallback]>;

  constructor(url: string) {
    super(url);
    this.orderList = [];
    this.listeners = [];
    super.addEventListener('message', this.handleMessage);
  }

  private abandonOrders(reason: string) {
    this.orderList.forEach(({ reject }) => reject(new SocketError(reason)));
    this.orderList = [];
  }

  private terminate(reason: string) {
    this.abandonOrders(reason);
    super.close(1000, reason);
  }

  private checkOrders(message: IncomingMessage) {
    const nextOrder = this.orderList[0];
    const doesFulfillOrder = nextOrder !== undefined && nextOrder.type === message[0];

    if (doesFulfillOrder) {
      nextOrder.resolve(message);
      this.orderList.shift();
    } else {
      this.abandonOrders('Received non-requested message');
    }
  }

  private checkListeners(message: IncomingMessage) {
    const appropiateListeners = this.listeners.filter(([type]) => type === message[0]);
    appropiateListeners.forEach(([, cb]) => cb(message));
  }

  private handleMessage(ev: MessageEvent) {
    const message = parseMessage(ev.data);
    const isValidMessageType = (allowedMessages as string[]).includes(message[0]);

    if (isValidMessageType) {
      this.checkOrders(message as IncomingMessage);
      this.checkListeners(message as IncomingMessage);
    } else {
      this.terminate('Received invalid message');
    }
  }

  send(type: SentMessageType, data = '') {
    super.send(`${type} ${data}`);
  }

  listen(type: ReceivedMessageType, cb: ListenerCallback) {
    this.listeners.push([type, cb]);
  }

  putOrder(...orderedMessages: ReceivedMessageType[]) {
    if (orderedMessages.length <= 0) return [];

    const orders: OrderListEntry[] = orderedMessages.map((type) => ({
      type,
      ...defer(),
    }));

    const waiters = orders.map(
      ({ promise }) =>
        (timeoutAfter?: number) =>
          timeoutAfter ? createPromiseWithTimeout(promise, 'No response', timeoutAfter) : promise
    );

    this.orderList.push(...orders);
    return waiters;
  }
}

export const fetchSocket = (url: string) =>
  new Promise<AppWebSocket>((res, rej) => {
    const socket = new AppWebSocket(url);

    if (socket.readyState === socket.OPEN) {
      res(socket);
    } else {
      socket.onopen = () => {
        res(socket);
      };

      socket.onerror = () => rej(new SocketError("Couldn't connect to the server"));
    }
  });
