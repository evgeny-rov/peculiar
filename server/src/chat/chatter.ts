import type { WebSocket } from 'ws';

export enum ChatterState {
  Initial,
  Authenticated,
}

export interface Chatter {
  connection: WebSocket;
  id: string;
  chatId: string;
  state: ChatterState;
}

const createChatter = (ws: WebSocket): Chatter => {};
