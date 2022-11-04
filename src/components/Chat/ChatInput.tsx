import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

const ChatInput = ({ send, disabled }: { send: (text: string) => void; disabled: boolean }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    areaRef.current!.style.height = 'auto';
    areaRef.current!.style.height = areaRef.current!.scrollHeight + 'px';
  }, [text]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSend = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    send(trimmedText);
    setText('');
    areaRef.current && areaRef.current.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <footer className="chat__input">
      <textarea
        value={text}
        ref={areaRef}
        rows={1}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        name="message"
        disabled={disabled}
        className="chat__input-text"
        placeholder={t('input_placeholder')}
      />
      <button disabled={disabled} name="send" className="chat__input-btn" onClick={handleSend}>
        &raquo;
      </button>
    </footer>
  );
};

export default ChatInput;
