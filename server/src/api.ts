import { WebSocketServer, WebSocket, RawData } from 'ws';
import uuid from './uuid';

type CommandName = 'create' | 'connect';
type Command = [CommandName, string];

const waitingRoom = new Map<string, WebSocket>();
const wss = new WebSocketServer({ port: 8080 });

const validCommands = ['create', 'connect'];

const isCommandValid = (data: string[]): data is Command =>
  validCommands.includes(data[0]);

const cleanup = (id: string) => waitingRoom.delete(id);

const handleClose = (
  reason: string,
  ...clients: [WebSocket, ...WebSocket[]]
) => {
  clients.forEach((ws) => ws.close(1000, reason));
};

const commandResolvers: Record<
  CommandName,
  (ws: WebSocket, command: Command) => void
> = {
  create: (ws) => {
    const id = uuid();
    waitingRoom.set(id, ws);
    ws.on('close', () => cleanup(id));
    ws.send(`created ${id}`);
  },
  connect: (ws, command) => {
    const [, id] = command;
    const peer = waitingRoom.get(id);

    if (peer) {
      cleanup(id);
      const peers = [ws, peer];

      peers.forEach((p, idx, arr) => {
        const nextPeer = arr[(idx + 1) % arr.length];

        p.on('close', () => handleClose('Peer closed connection', nextPeer));
        p.on('message', (data) => nextPeer.send(data.toString()));
        p.send('connected');
      });
    } else {
      handleClose('Not found', ws);
    }
  },
};

const handleConnection = (ws: WebSocket) => {
  const TIMEOUT_AFTER = 30000;
  const timerId = setTimeout(() => handleClose('Timed out', ws), TIMEOUT_AFTER);

  const handleMessage = (rawData: RawData) => {
    clearTimeout(timerId);

    const command = rawData.toString().split(' ');

    if (isCommandValid(command)) {
      const [commandName] = command;
      commandResolvers[commandName](ws, command);
    } else {
      handleClose('Unknown command', ws);
    }
  };

  ws.once('message', handleMessage);
};

wss.on('connection', handleConnection);
