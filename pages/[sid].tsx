import { NextPageContext } from 'next';
import { useState } from 'react';
import useChat from '../hooks/useChat';
import styles from '../styles/Home.module.css';

const Chat = ({ sid }: { sid: string }) => {
  const [state, send] = useChat(sid);
  const [messageText, setMessageText] = useState('');

  const handleSend = () => {
    const text = messageText.trim();

    if (text) {
      send(messageText);
      setMessageText('');
    }
  };

  return (
    <div className={styles.container}>
      <h1>welcome mf</h1>
      <h2>{state.status}</h2>
      <h2>messages:</h2>
      {state.messages.map((msg, idx) => {
        return (
          <p
            key={idx}
            style={{ color: msg.own ? 'black' : 'pink', textAlign: msg.own ? 'right' : 'left' }}
          >
            {msg.text}
          </p>
        );
      })}
      <input
        type="text"
        name="message"
        placeholder="message"
        onChange={(e) => setMessageText(e.target.value)}
        value={messageText}
      />
      <button disabled={!state.isConnected} onClick={handleSend}>
        send
      </button>
    </div>
  );
};

export async function getServerSideProps(ctx: NextPageContext) {
  return { props: { sid: ctx.query.sid } };
}

export default Chat;
