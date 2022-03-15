import { WebSocket } from 'ws';
import createState from '../helpers/createState';
import { transact, swap, tether } from '../helpers/transaction';

type Action = {
  type: 'AUTH' | 'HANDSHAKE' | 'SECURED' | 'MESSAGE';
  body?: any;
};

type Response = Action & {
  status: 'ok';
};

export interface Actor {
  data: string;
  ws: WebSocket;
}

export interface Chat {
  id: string;
  connect: (ws: WebSocket) => void;
}

const createActor = (connection: WebSocket, data: string): Actor => ({
  data,
  ws: connection,
});

const createChat = (id: string, onTerminate: (id: string) => void): Chat => {
  const actors = createState<Actor[]>([]);
  const isSealed = createState(false);

  const terminate = (reason: string, pendingConnections: WebSocket[] = []) => {
    pendingConnections.forEach((ws) => ws.close(1000, reason));
    actors.get().forEach((actor) => actor.ws.close(1000, reason));
    actors.set([]);
    onTerminate(id);
  };

  const coordinate = async () => {
    console.log(actors.get().length);
    if (
      actors.get().length !== 2 ||
      !actors.get().every((actor) => Boolean(actor.data))
    ) {
      console.log('not allowed');
      return;
    }

    const [actor1, actor2] = actors.get();
    try {
      await swap<Action, Response>({
        participants: [actor1, actor2],
        outgoingRequest: { type: 'HANDSHAKE' },
        validResponse: { type: 'HANDSHAKE', status: 'ok' },
      });

      actors
        .get()
        .forEach(({ ws }) => ws.send(JSON.stringify({ type: 'SECURED' })));

      tether([actor1.ws, actor2.ws]);
    } catch (e) {
      terminate('error on handshake');
    }
  };

  const connect = async (ws: WebSocket) => {
    if (isSealed.get()) {
      ws.close(1000, 'not allowed');
      return;
    }

    if (actors.get().length >= 1) {
      isSealed.set(true);
    }

    try {
      const response = await transact<Action, Response>(
        ws,
        { type: 'AUTH', body: { chatId: id } },
        { type: 'AUTH', status: 'ok' }
      );

      actors.set([...actors.get(), createActor(ws, response.body)]);
      coordinate();
    } catch (e) {
      if (e instanceof Error) {
        terminate(e.message, [ws]);
      } else {
        terminate('error on connection', [ws]);
      }
    }
  };

  return {
    id,
    connect,
  };
};

export default createChat;
