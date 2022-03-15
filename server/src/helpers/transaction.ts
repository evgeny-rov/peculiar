import type { WebSocket, RawData } from 'ws';
// transaction considered succesfull if participant responds with the specified asked result

const safeJsonParse = (data: string) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
};

export const validateResponse = <ValidRes extends Record<string, string>>(
  validResponse: ValidRes,
  actualResponse: any
) => {
  const requiredKeyNames = Object.keys(validResponse) as Array<keyof ValidRes>;

  return requiredKeyNames.every(
    (key) => validResponse[key] === actualResponse[key]
  );
};

export const transact = <
  Request extends Record<string, string>,
  ValidRes extends Record<string, string>
>(
  participant: WebSocket,
  outgoingRequest: Request,
  validResponse: ValidRes
) =>
  new Promise<ValidRes>((res, rej) => {
    const handleResponse = (rawData: RawData) => {
      const parsedResponse = safeJsonParse(rawData.toString());

      if (validateResponse(validResponse, parsedResponse)) {
        res(parsedResponse);
      } else {
        rej(new Error('transaction failed due to invalid response'));
      }
    };

    participant.send(JSON.stringify(outgoingRequest));
    participant.once('message', handleResponse);
    participant.once('close', () =>
      rej(new Error('transaction failed due to closed connection'))
    );
  });

type SwapParameters<T, F> = {
  participants: [{ ws: WebSocket; data: any }, { ws: WebSocket; data: any }];
  outgoingRequest: T;
  validResponse: F;
};

export const swap = <
  Request extends Record<string, string>,
  ValidRes extends Record<string, string>
>(
  params: SwapParameters<Request, ValidRes>
) => {
  const { participants, outgoingRequest, validResponse } = params;

  const [p1, p2] = participants;

  const transaction1 = transact(
    p1.ws,
    { ...outgoingRequest, body: p2.data },
    validResponse
  );
  const transaction2 = transact(
    p2.ws,
    { ...outgoingRequest, body: p1.data },
    validResponse
  );

  return Promise.all([transaction1, transaction2]);
};

export const tether = (participants: [WebSocket, WebSocket]) => {
  const [p1, p2] = participants;

  p1.on('message', (data) => p2.send(data.toString()));
  p2.on('message', (data) => p1.send(data.toString()));
};
