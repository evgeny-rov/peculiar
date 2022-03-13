import uuid from '../helpers/uuid';
import { Chatter, ChatterState } from './chatter';

enum ChatStates {
  Initial,
  Paired,
  Secured,
  Closed,
}

interface Chat {
  id: string;
  state: ChatStates;
  chatters: Chatter[];
}

const useState = <T>(
  initialState: T
): { state: T; setState: (nextState: T) => void } => {
  let state = initialState;

  const setter = (nextState: T) => {
    state = nextState;
  };

  return {
    get state() {
      return state;
    },
    setState: setter,
  };
};

const createChat = (): Chat => {
  const { state, setState } = useState<number>(ChatStates.Initial);
  const id = uuid();
  const chatters: Chatter[] = [];

  const updateState = () => {
    switch (state) {
      case ChatStates.Initial: {
        if (
          chatters.every(
            (chatter) => chatter.state === ChatterState.Authenticated
          )
        ) {
          setState(ChatStates.Initial + 1);
        }
        break;
      }
      default: {
        console.log('default orchestrator');
      }
    }
  };

  const connect = (ws: WebSocket) => {
    const newChatter = createChatter(ws, id, updateState);
    chatters.push(newChatter);
  };
};
