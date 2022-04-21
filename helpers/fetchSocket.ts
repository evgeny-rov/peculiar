const fetchSocket = (url: string) =>
  new Promise<WebSocket>((res, rej) => {
    const socket = new WebSocket(url);
    socket.onopen = () => {
      res(socket);
    };

    socket.onerror = rej;
  });

export default fetchSocket;
