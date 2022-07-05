import { useTranslation } from 'react-i18next';
import Caret from './Caret';

export const WelcomeStep = ({ onAction }: { onAction: () => void }) => {
  const { t } = useTranslation();

  return (
    <button onClick={() => onAction()} className="btn btn_pulsating">
      <Caret />
      <span className="txt-system">{t('welcome_text')}</span>
    </button>
  );
};

export default WelcomeStep;
