import { useCallback, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import establishSession from '../core/secureSession';
import { useTranslation } from 'react-i18next';

import { ConnectionError } from '../core/secureSession';

export type ViewMessage = {
  id: string;
  own: boolean;
  plaintext: string;
};

type SessionStates =
  | 'initial'
  | 'establishing'
  | 'created'
  | 'error'
  | 'established'
  | 'terminated';

const useSecureChatSession = () => {
  const { t } = useTranslation();

  const sessionRef = useRef<Awaited<ReturnType<typeof establishSession>>>();
  const [state, setState] = useState<SessionStates>('initial');
  const [info, setInfo] = useState('');
  const [id, setId] = useState('');
  const [sessionHash, setSessionHash] = useState('');
  const [messages, setMessages] = useState<ViewMessage[]>([]);

  const handleCreated = useCallback(
    (sid: string) => {
      setState('created');
      setInfo(t('info_created'));
      setId(sid);
    },
    [t]
  );

  const handleClose = useCallback(
    (code: number) => {
      const reason = t([`close_codes.${code}` as any, 'error_connection_lost']);
      setInfo(reason);
      setState('terminated');
    },
    [t]
  );

  const handleMessage = useCallback((plaintext: string) => {
    setMessages((messages) => [...messages, { id: uuidv4(), own: false, plaintext }]);
  }, []);

  const send = useCallback((text: string) => {
    if (!sessionRef.current) return;
    sessionRef.current.send(text);
    setMessages((messages) => [...messages, { id: uuidv4(), own: true, plaintext: text }]);
  }, []);

  const terminate = useCallback(() => sessionRef.current?.close(), []);

  const establish = useCallback(
    async (sessionContext?: string) => {
      setState('establishing');
      setInfo(t('info_establishing'));

      try {
        const session = await establishSession({
          sessionContext,
          onCreated: handleCreated,
          onMessage: handleMessage,
          onClose: handleClose,
        });

        sessionRef.current = session;

        setState('established');
        setInfo(t('info_established'));
        setSessionHash(session.hash);
      } catch (e) {
        const isConnectionError = e instanceof ConnectionError;
        setInfo(isConnectionError ? t('error_server_unavailable') : t('error_establishing_failed'));
        setState('error');
      }
    },
    [handleClose, handleCreated, handleMessage, t]
  );

  return { state, info, id, hash: sessionHash, messages, send, establish, terminate };
};

export default useSecureChatSession;
