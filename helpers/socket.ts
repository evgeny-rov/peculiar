export const fetchSocket = (url: string) =>
  new Promise<WebSocket>((res, rej) => {
    const socket = new WebSocket(url);
    socket.onopen = () => {
      res(socket);
    };

    socket.onerror = () => rej(new Error("Couldn't connect to the server"));
  });

export const socketReceiveOnce = (socket: WebSocket, timeout?: number): Promise<string> =>
  new Promise((res, rej) => {
    const timeoutId = timeout ? setTimeout(() => rej(Error('timeout')), timeout) : null;

    const abortTimeout = () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
    };

    const handleReject = () => {
      rej(Error('Something went wrong'));
      abortTimeout();
    };

    const handleReceive = (ev: MessageEvent) => {
      abortTimeout();
      socket.removeEventListener('close', handleReject);
      socket.removeEventListener('error', handleReject);
      res(ev.data);
    };

    socket.addEventListener('message', handleReceive, { once: true });
    socket.addEventListener('error', handleReject, { once: true });
    socket.addEventListener('close', handleReject, { once: true });
  });
