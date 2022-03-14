import { WebSocketServer } from 'ws';
import url from 'url';

import createChat from './chat/chat';
import type { Chat } from './chat/chat';

const wss = new WebSocketServer({ port: 8080 });

const chatRooms = new Map<string, Chat>();

wss.on('connection', (ws, req) => {
  const { pathname } = url.parse(req.url ?? '', true);
  const [, chatId] = (pathname ?? '').split('/');

  const chat = chatRooms.get(chatId);

  if (chat) {
    chat.connect(ws);
  } else if (!chatId) {
    const newChat = createChat();
    chatRooms.set(newChat.id, newChat);
    newChat.connect(ws);
  } else {
    ws.close();
  }
});
