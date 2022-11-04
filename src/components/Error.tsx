import { useTranslation } from 'react-i18next';
import Caret from './Caret';

const Error = (props: { info: string; onRetry: () => void; onCreateNewSession: () => void }) => {
  const { t } = useTranslation();

  return (
    <main className="wrapper">
      <div>
        <Caret />
        <span className="txt-system txt-system_nonselectible">{props.info}</span>
      </div>
      <button className="btn btn_pulsating" onClick={props.onCreateNewSession}>
        <span className="txt-system">{t('action_new_session')}</span>
      </button>
      <button className="btn btn_pulsating" onClick={props.onRetry}>
        <span className="txt-system">{t('action_retry')}</span>
      </button>
    </main>
  );
};

export default Error;
