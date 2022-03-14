import { WebSocket } from 'ws';
import uuid from '../helpers/uuid';
import { createState, exchange } from './helpers';

export interface Actor {
  pk: string;
  ws: WebSocket;
}

export interface Chat {
  id: string;
  connect: (ws: WebSocket) => void;
}

const createActor = (connection: WebSocket, pk: string) => ({
  pk,
  ws: connection,
});

const createChat = (): Chat => {
  const id = uuid();
  const actors = createState<Actor[]>([]);
  const isSealed = createState(false);

  const coordinate = () => {
    if (actors.get().length === 2 && actors.get().every((c) => c.pk)) {
      const [actor1, actor2] = actors.get();

      const hand1 = exchange(actor1.ws, {
        type: 'HANDSHAKE',
        body: actor2.pk,
      });
      const hand2 = exchange(actor2.ws, {
        type: 'HANDSHAKE',
        body: actor1.pk,
      });

      Promise.all([hand1, hand2])
        .then(() => {
          actors
            .get()
            .forEach(({ ws }) => ws.send(JSON.stringify({ type: 'SECURED' })));
          actor1.ws.on('message', (rawData) =>
            actor2.ws.send(rawData.toString())
          );
          actor2.ws.on('message', (rawData) =>
            actor1.ws.send(rawData.toString())
          );
        })
        .catch((e) => {
          console.log('error on handshake', e);
          // terminate
        });
    }
  };

  const connect = (ws: WebSocket) => {
    if (isSealed.get()) {
      ws.close();
      return;
    }

    if (actors.get().length >= 1) {
      isSealed.set(true);
    }

    exchange(ws, { type: 'AUTH', body: { chatId: id } })
      .then((response) => {
        isSealed.set(true);
        actors.set([...actors.get(), createActor(ws, response.body)]);
        coordinate();
      })
      .catch((e) => {
        console.log('error on connection', e);
      });
  };

  return {
    id,
    connect,
  };
};

export default createChat;
