import fetchSocket from './fetchSocket';

const SERVER_URL = 'ws://localhost:8080/';

const fetchP2PSocket = () => fetchSocket(SERVER_URL);

const createSession = () => fetchP2PSocket;
const connectToSession = (sid: string) => send('connect', sid);