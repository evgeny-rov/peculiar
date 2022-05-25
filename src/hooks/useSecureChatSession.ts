import { useCallback, useEffect, useRef, useState } from 'react';
import { establishSession } from '../core/session';
import type { Session } from '../core/session';

export type ViewMessage = {
  own: boolean;
  plaintext: string;
  ciphertext?: string;
  timestamp?: number;
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
