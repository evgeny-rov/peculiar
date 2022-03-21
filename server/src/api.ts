import 'dotenv/config';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import getChidFromUrl from './helpers/getChidFromUrl';

import uuid from './helpers/uuid';
import validateRequest from './helpers/validateRequest';
import { sendEnsuredChidMessage } from './communication/messages';
import establishConnection from './communication/establishConnection';

const waitingRoom = new Map<string, WebSocket>();

const PORT = 8080;
const server = createServer();
const wss = new WebSocketServer({ noServer: true });

const cleanup = (chid: string) => () => {
  waitingRoom.delete(chid);
};

const handleError = (e: Error, ws: WebSocket) => {
  if (ws.readyState === ws.OPEN) {
    ws.close(1000, e.message);
  }
};

wss.on('connection', async (ws, req) => {
  try {
    const chid = getChidFromUrl(req.url);

    if (chid) {
      await establishConnection(ws, waitingRoom.get(chid));
      cleanup(chid);
    } else {
      const newChid = uuid();
      await sendEnsuredChidMessage(ws, newChid);
      waitingRoom.set(newChid, ws);
      ws.on('close', () => cleanup(newChid));
    }
  } catch (e) {
    if (e instanceof Error) handleError(e, ws);
  }
});

server.on('upgrade', (request, socket, head) => {
  const isRequestValid = validateRequest(request, waitingRoom);

  if (isRequestValid) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT);
