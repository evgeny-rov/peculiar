import React, { useEffect, useState } from 'react';
import useChat from './hooks/useChat';
import './styles/App.scss';

const getSessionIdFromPathname = (pathname: string) => {
  const [, sid] = pathname.split('/');

  if (sid.length > 0) return sid;

  return null;
};

const sessionId = getSessionIdFromPathname(window.location.pathname);

const StartAction = ({ onStart }: { onStart: () => void }) => {
  return (
    <button onClick={onStart} className="start-action">
      <span className="caret">{'>_'}</span>
      <span>start session</span>
    </button>
  );
};

const ChatSession = ({ sid }: { sid: string | null }) => {
  const [chatState, send] = useChat(sid);
  const [input, setInput] = useState('');

  const renderChat = () => {
    return (
      <>
        <div>
          {chatState.messages.map((message, idx) => {
            return (
              <span className="user-message" key={idx}>
                {message.plaintext}
              </span>
            );
          })}
        </div>
        <div className="user-input">
          <input
            className="user-input__text"
            type="text"
            name="message"
            id="message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="user-input__send"
            onClick={() => {
              send(input);
              setInput('');
            }}
          >
            send
          </button>
        </div>
      </>
    );
  };

  return (
    <div>
      <p>{chatState.status}</p>
      {chatState.isEstablished && renderChat()}
    </div>
  );
};

function App() {
  const [isInitialized, setisInitialized] = useState(sessionId !== null);

  const handleStartNewSession = () => {
    setisInitialized(true);
  };

  return (
    <div className="App">
      {isInitialized ? (
        <ChatSession sid={sessionId} />
      ) : (
        <StartAction onStart={handleStartNewSession} />
      )}
    </div>
  );
}

export default App;
