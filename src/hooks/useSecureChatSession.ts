import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import establishSession from '../core/secureSession';
import { useTranslation } from 'react-i18next';

import { ConnectionError } from '../core/secureSession';

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

const initialState: RootState = {
  messages: [],
  isEstablished: false,
  isClosed: false,
  sessionFingerprint: null,
  sessionId: null,
  info: '',
};

const useChat = (sid: string | null = null): [RootState, (text: string) => void] => {
  const { t } = useTranslation();
  const sessionRef = useRef<Awaited<ReturnType<typeof establishSession>>>();
  const [state, setState] = useState<RootState>({
    ...initialState,
    info: t('info_establishing'),
  });

  const handleCreated = (sid: string) => {
    setState((state) => ({
      ...state,
      sessionId: sid,
      info: t('info_created'),
    }));
  };

  const handleClose = useCallback(
    (code: number) => {
      const text = t([`close_codes.${code}` as any, 'error_connection_lost']);
      setState((state) => ({ ...state, isClosed: true, info: text }));
    },
    [t]
  );

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
      onMessage: handleMessage,
      onClose: handleClose,
      sid,
    })
      .then((session) => {
        sessionRef.current = session;
        setState((state) => ({
          ...state,
          isEstablished: true,
          sessionFingerprint: session.sharedKeyFingerprint,
          info: t('info_established'),
        }));
      })
      .catch((e: unknown) => {
        if (e instanceof ConnectionError) {
          setState((state) => ({ ...state, info: t('error_server_unavailable') }));
        } else {
          setState((state) => ({ ...state, info: t('error_establishing_failed') }));
        }
      });
    return () => sessionRef.current?.close();
  }, []);

  return [state, send];
};

export default useChat;
