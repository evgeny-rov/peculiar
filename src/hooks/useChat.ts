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
  sessionFingerprint: string;
  status: string;
};

const initialState: RootState = {
  messages: [],
  isEstablished: false,
  sessionFingerprint: '',
  status: 'Establishing session...',
};

const useChat = (sid: string | null = null): [RootState, (text: string) => void] => {
  const sessionRef = useRef<Session>();
  const [state, setState] = useState<RootState>(initialState);

  const handleCreated = useCallback((sid: string) => {
    const chatUrl = window.location.href + sid;
    setState((state) => ({
      ...state,
      status: 'Session created, you can send this link: ' + chatUrl,
    }));
  }, []);

  const handleEstablished = useCallback((fingerprint: string) => {
    setState((state) => ({
      ...state,
      isEstablished: true,
      sessionFingerprint: fingerprint,
      status: 'Session established, messages encrypted',
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
      sid,
    })
      .then((session) => {
        sessionRef.current = session;
      })
      .catch((e) => {
        console.log(e);
        handleClose(e.toString());
      });

    return () => sessionRef.current?.close();
  }, []);

  return [state, send];
};

export default useChat;
