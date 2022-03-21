import { WebSocket } from 'ws';
import createValidator from '../helpers/createValidator';
import exchange from './exchange';

type Message = {
  type: 'CHID' | 'ESTABLISHED';
  body?: any;
  status?: string;
};

export const sendEnsuredChidMessage = (ws: WebSocket, chid: string) => {
  const message: Message = { type: 'CHID', body: chid };
  const expectedResponse: Message = { type: 'CHID', status: 'ok' };

  const responseValidator = createValidator(expectedResponse);

  return exchange(ws, message, responseValidator);
};

export const sendEstablishedMessage = (ws: WebSocket) => {
  const message: Message = { type: 'ESTABLISHED' };

  ws.send(JSON.stringify(message));
};
