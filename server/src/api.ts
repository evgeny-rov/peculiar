import { WebSocketServer, WebSocket } from 'ws';
import url from 'url';

import createChat from './chat/chat';
import type { Chat } from './chat/chat';
import uuid from './helpers/uuid';

const wss = new WebSocketServer({ port: 8080 });

const chatRooms = new Map<string, Chat>();

const handleTerminate = (id: string) => {
  chatRooms.delete(id);
  console.log('termination event', chatRooms.get(id));
};

const handleCreateNewChat = (ws: WebSocket) => {
  const id = uuid();
  const chat = createChat(id, handleTerminate);
  chatRooms.set(id, chat);
  chat.connect(ws);
};

wss.on('connection', (ws, req) => {
  const { pathname } = url.parse(req.url ?? '', true);
  const [, chatId] = (pathname ?? '').split('/');

  const chat = chatRooms.get(chatId);

  if (chat) {
    chat.connect(ws);
  } else if (!chatId) {
    handleCreateNewChat(ws);
  } else {
    ws.close();
  }
});
