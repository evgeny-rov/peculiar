import { NextRouter, useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import createSessionSocket from '../helpers/session';

import type { ClientAcceptedMessageType, ClientMessage, Session } from '../helpers/session';

type ViewMessage = {
  own: boolean;
  text: string;
  timestamp?: number;
};

type RootState = {
  messages: ViewMessage[];
  isConnected: boolean;
  isSecured: boolean;
  status: string;
};

type ActionTypes = ClientAcceptedMessageType | 'sent' | 'close';
type Action = [ActionTypes, string];

type ReducersTable = Record<ActionTypes, (state: RootState, action: Action) => RootState>;

type SideEffectResolversParams = {
  message: ClientMessage;
  router: NextRouter;
};
type SideEffectResolversTable = Record<
  ClientAcceptedMessageType,
  (params: SideEffectResolversParams) => void
>;

const stateReducers: ReducersTable = {
  created: (state) => {
    return { ...state, status: 'session created, you can now send your link' };
  },
  connected: (state) => {
    return { ...state, isConnected: true, status: 'your sidekick has joined the session' };
  },
  text: (state, action) => {
    return { ...state, messages: [...state.messages, { own: false, text: action[1] }] };
  },
  sent: (state, action) => {
    return { ...state, messages: [...state.messages, { own: true, text: action[1] }] };
  },
  close: (state, action) => {
    return { ...state, isConnected: false, status: action[1] };
  },
  established: (state, action) => {
    return { ...state, isSecured: true };
  },
};

const sideEffectsResolvers: SideEffectResolversTable = {
  created: ({ message: [, sid], router }) => {
    router.replace(sid, sid, { shallow: true });
  },
  connected: () => null,
  text: () => null,
  established: () => null,
};

const initialState: RootState = {
  messages: [],
  isConnected: false,
  isSecured: false,
  status: 'pending',
};

const useChat = (chid: string): [RootState, (text: string) => void] => {
  const router = useRouter();
  const sessionRef = useRef<Session>();
  const [state, setState] = useState<RootState>(initialState);

  const handleStateUpdate = useCallback((action: Action) => {
    const [actionType] = action;
    setState((state) => stateReducers[actionType](state, action));
  }, []);

  const handleClose = useCallback((reason: string) => {
    handleStateUpdate(['close', reason]);
  }, []);

  const handleReceive = useCallback((message: ClientMessage) => {
    sideEffectsResolvers[message[0]]({ message, router });
    handleStateUpdate(message);
  }, []);

  const send = useCallback((text: string) => {
    if (!sessionRef.current) return;

    sessionRef.current.send(text);
    handleStateUpdate(['sent', text]);
  }, []);

  useEffect(() => {
    createSessionSocket({ onMessage: handleReceive, onClose: handleClose }).then((socket) => {
      sessionRef.current = socket;
      chid === 'create' ? socket.createSession() : socket.connectToSession(chid);
    });

    return () => sessionRef.current?.close();
  }, []);

  return [state, send];
};

export default useChat;
