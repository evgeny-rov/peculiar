import type { WebSocket, RawData } from 'ws';

export interface Action {
  type: 'AUTH' | 'HANDSHAKE' | 'SECURED' | 'MESSAGE';
  body?: any;
}

interface Response extends Action {
  status: 'ok';
}

export const exchange = (target: WebSocket, action: Action) =>
  new Promise<Response>((res, rej) => {
    const handleResponse = (rawData: RawData) => {
      try {
        const data = JSON.parse(rawData.toString()) as Response;

        const isResponseStatusOk = data?.status === 'ok';
        const isMessageTypeValid = data?.type === action.type;
        const isBodyProvided = data?.body !== undefined;

        if (isResponseStatusOk && isMessageTypeValid && isBodyProvided) {
          res(data);
        } else {
          rej(new Error('exchange failed'));
        }
      } catch (e) {
        rej(e);
      }
    };

    target.send(JSON.stringify(action));
    target.once('message', handleResponse);
  });

export const createState = <T>(
  initialState: T
): { set: (nextState: T) => void; get: () => T } => {
  let state = initialState;

  return {
    set: (value) => {
      state = value;
    },
    get: () => state,
  };
};
