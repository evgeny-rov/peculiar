import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useDelay from '../../hooks/useDelay';
import Loading from '../Loading';
import VisualizedHash from '../VisualizedHash';

const ChatStatus = ({
  info,
  isConnected,
  sessionHash,
}: {
  info: string;
  isConnected: boolean;
  sessionHash: string;
}) => {
  const { t } = useTranslation();
  const [isFullHashVisible, setIsFullHashVisible] = useState(false);
  const [delay, abortDelay] = useDelay();

  const showFullHash = useCallback(() => {
    setIsFullHashVisible(true);
    delay(() => setIsFullHashVisible(false), 10000);
  }, []);

  const hideFullHash = useCallback(() => {
    abortDelay();
    setIsFullHashVisible(false);
  }, []);

  if (!sessionHash)
    return (
      <header className="chat__status">
        <span className="txt-system txt-system_dimmed">{t('info_establishing')}</span>
        <Loading bars={8} width="2rem" strokeWidth={4} color="#aaa" />
      </header>
    );

  return (
    <header className="chat__status">
      <div className="chat__status-info">
        <span className={isConnected ? 'status-light' : 'status-light status-light_inactive'} />
        {isFullHashVisible ? (
          <span className="chat__status-fp-text">{sessionHash}</span>
        ) : (
          <span className="txt-system txt-system_dimmed">{info}</span>
        )}
      </div>
      <button onClick={isFullHashVisible ? hideFullHash : showFullHash} className="btn-status">
        <VisualizedHash data={sessionHash} width="2rem" strokeWidth={4} color="#aaa" />
        <div className="tooltip">
          <span className="tooltip__text">{t('tooltip_security')}</span>
        </div>
      </button>
    </header>
  );
};

export default ChatStatus;
