import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
        <span className="caret">{'>_'}</span>
        <span className="txt-system txt-system_nonselectible txt-system_lowercase">
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
