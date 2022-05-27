import { useState, useRef, useEffect, ChangeEvent } from 'react';

const ChatInput = ({
  send,
  sendDisabled,
}: {
  send: (text: string) => void;
  sendDisabled: boolean;
}) => {
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
        className="chat__input-text"
        placeholder="Type in your message..."
      />
      <button disabled={sendDisabled} name="send" className="chat__input-btn" onClick={handleSend}>
        {'>'}
      </button>
    </footer>
  );
};

export default ChatInput;
