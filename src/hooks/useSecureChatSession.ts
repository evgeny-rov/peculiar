import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { establishSession } from '../core/session';
import type { Session } from '../core/session';

export type ViewMessage = {
  id: string;
  own: boolean;
  plaintext: string;
  fingerprint: string;
};

export type RootState = {
  isEstablished: boolean;
  isClosed: boolean;
  info: string;
  sessionFingerprint: string | null;
  sessionId: string | null;
  messages: ViewMessage[];
};

const createInitialState = (): RootState => ({
  messages: [],
  isEstablished: false,
  isClosed: false,
  sessionFingerprint: null,
  sessionId: null,
  info: 'Establishing session...',
});

const useChat = (sid: string | null = null): [RootState, (text: string) => void] => {
  const sessionRef = useRef<Session>();
  const [state, setState] = useState<RootState>(createInitialState());

  const handleCreated = (sid: string) => {
    setState((state) => ({
      ...state,
      sessionId: sid,
      info: 'Session created, you can now share session url',
    }));
  };

  const handleEstablished = useCallback((fingerprint: string) => {
    setState((state) => ({
      ...state,
      isEstablished: true,
      sessionFingerprint: fingerprint,
      info: 'Messages encrypted',
    }));
  }, []);

  const handleClose = useCallback((reason: string) => {
    setState((state) => ({ ...state, isClosed: true, info: reason }));
  }, []);

  const handleMessage = useCallback((plaintext: string, fingerprint: string) => {
    setState((state) => ({
      ...state,
      messages: [...state.messages, { id: uuidv4(), own: false, plaintext, fingerprint }],
    }));
  }, []);

  const send = useCallback(async (text: string) => {
    if (!sessionRef.current) return;

    const fingerprint = await sessionRef.current.send(text);

    setState((state) => ({
      ...state,
      messages: [...state.messages, { id: uuidv4(), own: true, plaintext: text, fingerprint }],
    }));
  }, []);

  useEffect(() => {
    establishSession({
      onCreated: handleCreated,
      onEstablished: handleEstablished,
      onMessage: handleMessage,
      onClose: handleClose,
      sid,
    })
      .then((session) => {
        sessionRef.current = session;
      })
      .catch((e) => {
        handleClose(e.message);
      });
    return () => sessionRef.current?.close();
  }, []);

  return [state, send];
};

export default useChat;
