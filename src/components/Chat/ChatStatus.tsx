import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useDelay from '../../hooks/useDelay';
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
        <VisualizedHash data={sessionHash} height={'1rem'} strokeWidth={2} color="#fff" />
        <div className="tooltip">
          <span className="tooltip__text">{t('tooltip_security')}</span>
        </div>
      </button>
    </header>
  );
};

export default ChatStatus;
