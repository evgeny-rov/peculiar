import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Caret from './Caret';

const CreatedStep = ({ sessionId, info }: { sessionId: string; info: string }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const sessionUrl = `${window.location.origin}/${sessionId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionUrl).then(() => setCopied(true));
  };

  return (
    <main className="wrapper">
      <div>
        <Caret />
        <span className="txt-system txt-system_nonselectible">
          {copied ? t('url_copied') : info}
        </span>
      </div>
      <button
        className="btn-txt btn-txt_type_copy btn-txt_pulsating"
        onClick={handleCopy}
        onPointerLeave={() => setCopied(false)}
      >
        <span className="txt-system">{sessionUrl}</span>
      </button>
    </main>
  );
};

export default CreatedStep;
