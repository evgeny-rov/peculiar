import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import getChidFromUrl from './getChidFromUrl';

export default (
  request: IncomingMessage,
  waitingRoomRef: Map<string, WebSocket>
) => {
  const reqChid = getChidFromUrl(request.url);

  if (reqChid !== null && !waitingRoomRef.has(reqChid)) {
    return false;
  }

  return true;
};
