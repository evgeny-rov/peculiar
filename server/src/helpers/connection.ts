import type { WebSocket, RawData } from 'ws';
import { IncomingReport, OutgoingReport } from '../types/report';
import safeJsonParse from './safeJsonParse';

export const validateResponse = <ValidRes extends Record<string, string>>(
  validResponse: ValidRes,
  actualResponse: any
) => {
  const requiredKeyNames = Object.keys(validResponse) as Array<keyof ValidRes>;

  return requiredKeyNames.every(
    (key) => validResponse[key] === actualResponse[key]
  );
};

export const communicate = <
  Request extends Record<string, any>,
  ValidRes extends Record<string, any>
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
        rej(new Error('response is invalid'));
      }
    };

    participant.send(JSON.stringify(outgoingRequest));
    participant.once('message', handleResponse);
    participant.once('close', () => rej(new Error('connection closed')));
  });

export const tether = (participants: [WebSocket, WebSocket]) => {
  const [p1, p2] = participants;

  participants.forEach((prt) =>
    prt.send(JSON.stringify({ type: 'CONNECTED' }))
  );

  const disconnectMessage = 'party closed connection';

  p1.on('close', (code) => p2.close(code, disconnectMessage));
  p2.on('close', (code) => p1.close(code, disconnectMessage));

  p1.on('message', (data) => p2.send(data.toString()));
  p2.on('message', (data) => p1.send(data.toString()));
};

export const handshake = (ws: WebSocket, data: Record<string, any>) =>
  communicate<OutgoingReport, IncomingReport>(
    ws,
    { type: 'HANDSHAKE', body: data },
    { type: 'HANDSHAKE', status: 'ok' }
  );
