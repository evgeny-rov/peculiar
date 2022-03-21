import { WebSocket, MessageEvent } from 'ws';
import safeJsonParse from '../helpers/safeJsonParse';

type validator = (actual: Record<string, any>) => boolean;

export default (
  ws: WebSocket,
  message: Record<string, any>,
  validate: validator,
  timeoutAfter = 10000
) =>
  new Promise((res, rej) => {
    const listenersRefs: Array<['close' | 'message', (event?: any) => void]> =
      [];
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const clearListeners = () => {
      if (timerId !== null) clearTimeout(timerId);
      listenersRefs.forEach(([type, handler]) =>
        ws.removeEventListener(type as any, handler)
      );
    };

    const handleResolve = (data: Object) => {
      clearListeners();
      res(data);
    };

    const handleReject = (error: Error) => {
      clearListeners();
      rej(error);
    };

    const handleResponse = (event: MessageEvent) => {
      const parsedResponse = safeJsonParse(event.data.toString());

      if (validate(parsedResponse)) {
        handleResolve(parsedResponse);
      } else {
        handleReject(Error('Response is invalid'));
      }
    };

    const handleClose = () => {
      handleReject(Error('Connection closed'));
    };

    listenersRefs.push(['message', handleResponse]);
    listenersRefs.push(['close', handleClose]);

    listenersRefs.forEach(([type, handler]) =>
      ws.addEventListener(type as any, handler)
    );

    timerId = setTimeout(
      () => handleReject(Error('No response - timed out')),
      timeoutAfter
    );

    ws.send(JSON.stringify(message));
  });
