import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useDelay from '../hooks/useDelay';
import Caret from './Caret';

const CreatedStep = ({ sessionId, info }: { sessionId: string; info: string }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [delay] = useDelay();
  const sessionUrl = `${window.location.origin}/#${sessionId}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sessionUrl).then(() => setCopied(true));
      delay(() => setCopied(false), 1500);
    }
  };

  return (
    <main className="wrapper">
      <div>
        <Caret />
        <span className="txt-system txt-system_nonselectible">
          {copied ? t('url_copied') : info}
        </span>
      </div>
      <button className="btn btn_type_copy btn_pulsating" onClick={handleCopy}>
        <span className="txt-system">{sessionUrl}</span>
      </button>
    </main>
  );
};

export default CreatedStep;
