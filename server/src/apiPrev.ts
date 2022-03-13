import { IncomingMessage, createServer } from 'http';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import url from 'url';

interface Conversation {
  id: string;
  numOfParticipants: number;
  participants: WebSocket[];
  isEstablished: boolean;
  // eslint-disable-next-line no-unused-vars
  connect: (participant: WebSocket) => void;
}

const server = createServer();
const wss = new WebSocketServer({ noServer: true });

const conversations = new Map<string, Conversation>();

const createConversation = (id: string): Conversation => {
  const participants: Conversation['participants'] = [];
  let numOfParticipants = 0;
  let isEstablished = false;

  const relay = (data: RawData) => {
    participants.forEach((participant) => participant.send(data.toString()));
  };

  const delegate = (data: RawData, participant: WebSocket) => {
    const requestData = JSON.parse(data.toString());

    if (requestData.type === 'meta') {
      const metaData = {
        type: 'meta',
        message: 'hello stranger',
        conversationId: id,
        numOfParticipants,
      };

      participant.send(JSON.stringify(metaData));
    } else {
      relay(data);
    }
  };

  const connect: Conversation['connect'] = (participant) => {
    if (numOfParticipants >= 2) {
      participant.close();
      return false;
    }

    numOfParticipants += 1;

    participants.push(participant);

    participant.on('message', (data) => delegate(data, participant));
    participant.send(JSON.stringify({ message: 'hello stranger' }));

    return true;
  };

  return {
    get id() {
      return id;
    },
    get numOfParticipants() {
      return numOfParticipants;
    },
    get participants() {
      return participants;
    },
    get isEstablished() {
      return isEstablished;
    },
    connect,
  };
};

const handleConnection = async (
  ws: WebSocket,
  _: IncomingMessage,
  conversation: Conversation | undefined
) => {
  if (conversation) {
    conversation.connect(ws);
  } else {
    const newConversationId = uuidv4();
    const newConversation = createConversation(newConversationId);
    newConversation.connect(ws);
    conversations.set(newConversationId, newConversation);
  }
};

wss.on('connection', handleConnection);

server.on('upgrade', (request, socket, head) => {
  const { query } = url.parse(request.url ?? '', true);
  const conversationId = query?.conversationId;

  const conversation = conversations.get(String(conversationId));

  if (conversationId && !conversation) {
    socket.write('HTTP/1.1 404\r\n\r\n');
    socket.destroy();
  } else {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, conversation);
    });
  }
});

server.listen(8080);
