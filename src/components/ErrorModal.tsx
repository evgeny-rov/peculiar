import { useTranslation } from 'react-i18next';
import Caret from './Caret';

const ErrorModal = ({ info, onAction }: { info: string; onAction: () => any }) => {
  const { t } = useTranslation();

  return (
    <main className="wrapper">
      <div>
        <Caret />
        <span className="txt-system txt-system_nonselectible">{info}</span>
      </div>
      <button className="btn btn_pulsating" onClick={onAction}>
        <span className="txt-system">{t('info_retry')}</span>
      </button>
    </main>
  );
};

export default ErrorModal;
