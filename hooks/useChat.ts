import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { establishSession } from '../helpers/session';

import type { Session } from '../helpers/session';

type ViewMessage = {
  own: boolean;
  plaintext: string;
  ciphertext?: string;
  timestamp?: number;
};

type RootState = {
  messages: ViewMessage[];
  isEstablished: boolean;
  status: string;
};

const initialState: RootState = {
  messages: [],
  isEstablished: false,
  status: 'pending',
};

const useChat = (sid: string): [RootState, (text: string) => void] => {
  const router = useRouter();
  const sessionRef = useRef<Session>();
  const [state, setState] = useState<RootState>(initialState);

  const handleCreated = useCallback((sid: string) => {
    router.replace(sid, sid, { shallow: true });
    setState((state) => ({ ...state, status: 'session created, you can now send your link' }));
  }, []);

  const handleEstablished = useCallback(() => {
    setState((state) => ({
      ...state,
      isEstablished: true,
      status: 'session established, messages encrypted',
    }));
  }, []);

  const handleClose = useCallback((reason: string) => {
    setState((state) => ({ ...state, isEstablished: false, status: reason }));
  }, []);

  const handleMessage = useCallback((plaintext: string, ciphertext: string) => {
    setState((state) => ({
      ...state,
      messages: [...state.messages, { own: false, plaintext, ciphertext }],
    }));
  }, []);

  const send = useCallback((text: string) => {
    if (!sessionRef.current) return;

    sessionRef.current.send(text);
    setState((state) => ({
      ...state,
      messages: [...state.messages, { own: true, plaintext: text }],
    }));
  }, []);

  useEffect(() => {
    establishSession({
      onCreated: handleCreated,
      onEstablished: handleEstablished,
      onMessage: handleMessage,
      onClose: handleClose,
      sid: sid === 'create' ? null : sid,
    }).then((session) => {
      sessionRef.current = session;
    });

    return () => sessionRef.current?.close();
  }, []);

  return [state, send];
};

export default useChat;
