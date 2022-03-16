import { WebSocketServer, WebSocket } from 'ws';
import url from 'url';

import uuid from './helpers/uuid';
import { tether, handshake } from './helpers/connection';

const wss = new WebSocketServer({ port: 8080 });

const waitingRoom = new Map<string, WebSocket>();

wss.on('connection', async (ws, req) => {
  const { pathname } = url.parse(req.url ?? '', true);
  const [, providedChatId] = (pathname ?? '').split('/');

  const partner = waitingRoom.get(providedChatId);

  if (providedChatId && !partner) {
    ws.close(1000, 'you smell like fish');
  }

  try {
    const chatId = providedChatId || uuid();
    await handshake(ws, { chatId });

    if (partner) {
      tether([partner, ws]);
      waitingRoom.delete(chatId);
    } else {
      waitingRoom.set(chatId, ws);
      ws.on('close', () => waitingRoom.delete(chatId));
    }
  } catch (e) {
    ws.close(1000, String(e));
  }
});
