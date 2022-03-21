import { WebSocket } from 'ws';
import { sendEstablishedMessage } from './messages';

export default (
  connectingParty: WebSocket,
  waitingParty: WebSocket | undefined
) =>
  new Promise((res, rej) => {
    if (waitingParty === undefined) {
      rej(Error("Couldn't establish connection"));
    } else {
      const parties = [connectingParty, waitingParty];

      parties.forEach((prt) => {
        prt.removeAllListeners();
        sendEstablishedMessage(prt);
      });

      const [p1, p2] = parties;

      const disconnectMessage = 'Party closed connection';

      p1.on('close', (code) => p2.close(code, disconnectMessage));
      p2.on('close', (code) => p1.close(code, disconnectMessage));

      p1.on('message', (data) => p2.send(data.toString()));
      p2.on('message', (data) => p1.send(data.toString()));

      res(parties);
    }
  });
