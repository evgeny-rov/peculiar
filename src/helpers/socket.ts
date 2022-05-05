import parseMessage from './parseMessage';

type SentMessageType = 'create' | 'connect' | 'key' | 'encrypted';
type ReceivedMessageType = 'created' | 'connected' | 'key' | 'encrypted';
export type IncomingMessage = [ReceivedMessageType, string];

const acceptedMessageTypes = ['created', 'connected', 'key', 'encrypted'] as ReceivedMessageType[];

type DeferredRequest = {
  promise: Promise<any>;
  resolve: (data: any) => void;
  reject: () => void;
};

type OrderListEntry = DeferredRequest & {
  type: ReceivedMessageType;
};

const defer = (): DeferredRequest => {
  const deferred = {} as DeferredRequest;

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
};

const createTimeoutPromise = (ms: number) => new Promise((_, rej) => setTimeout(rej, ms));
export class AppWebSocket extends WebSocket {
  private orderList: OrderListEntry[];
  private isServing: boolean;

  constructor(url: string) {
    super(url);
    this.orderList = [];
    this.isServing = false;
  }

  private startServing() {
    if (this.isServing) return;

    super.addEventListener('message', this.handleOrderMessage);
    this.isServing = true;
  }

  private stopServing() {
    super.removeEventListener('message', this.handleOrderMessage);
    this.isServing = false;
  }

  private terminate(reason: string) {
    this.stopServing();
    this.orderList.forEach(({ reject }) => reject());
    this.orderList = [];
    super.close(1000, reason);
  }

  private checkOrders(message: IncomingMessage) {
    const nextOrder = this.orderList[0];
    const doesFulfillOrder = nextOrder !== undefined && nextOrder.type === message[0];
    const isLastOrder = this.orderList.length === 1;

    if (doesFulfillOrder) {
      nextOrder.resolve(message);
      this.orderList.shift();
      isLastOrder && this.stopServing();
    } else {
      console.log(nextOrder, message);
      this.terminate('Received non-requested message');
    }
  }

  private handleOrderMessage(ev: MessageEvent) {
    const message = parseMessage(ev.data);
    const isValidMessageType = (acceptedMessageTypes as string[]).includes(message[0]);

    if (isValidMessageType) {
      this.checkOrders(message as IncomingMessage);
    } else {
      this.terminate('Received invalid message');
    }
  }

  send(type: SentMessageType, data = '') {
    super.send(`${type} ${data}`);
  }

  putOrder(...orderedMessages: ReceivedMessageType[]) {
    if (orderedMessages.length <= 0) return [];

    const orders: OrderListEntry[] = orderedMessages.map((type) => ({
      type,
      ...defer(),
    }));

    const waiters = orders.map(
      ({ promise }) =>
        (timeout?: number) =>
          timeout ? Promise.race([promise, createTimeoutPromise(timeout)]) : promise
    );

    this.orderList.push(...orders);
    this.startServing();

    return waiters;
  }

  receiveDirectly(callback: (data: string) => void) {
    this.stopServing();
    super.addEventListener('message', (ev) => callback(ev.data));
  }
}

export const fetchSocket = (url: string) =>
  new Promise<AppWebSocket>((res, rej) => {
    const socket = new AppWebSocket(url);

    if (socket.readyState === socket.OPEN) {
      res(socket);
      return;
    }

    socket.onopen = () => {
      res(socket);
    };

    socket.onerror = () => rej(new Error("Couldn't connect to the server"));
  });
