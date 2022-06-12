import { useTranslation } from 'react-i18next';

export const Welcome = ({ onAction }: { onAction: () => void }) => {
  const { t } = useTranslation();

  return (
    <button onClick={onAction} className="btn-txt btn-txt_pulsating">
      <span className="caret">{'>_'}</span>
      <span className="txt-system">{t('welcome_text')}</span>
    </button>
  );
};

export default Welcome;
