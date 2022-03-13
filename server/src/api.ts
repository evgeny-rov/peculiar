import { WebSocketServer } from 'ws';
import uuid from './helpers/uuid';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.once('message', () => {
    console.log('got message');
    ws.send('i listen only once');
  });
});
