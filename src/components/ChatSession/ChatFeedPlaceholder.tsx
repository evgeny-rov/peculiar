import { useTranslation } from 'react-i18next';

const ChatFeedPlaceholder = () => {
  const { t } = useTranslation();

  return (
    <main className="feed-placeholder">
      <span className="txt-system txt-system_dimmed">{t('feed_placeholder')}</span>
    </main>
  );
};

export default ChatFeedPlaceholder;
