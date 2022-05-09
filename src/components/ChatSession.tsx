import React, { useState } from 'react';
import useChat, { RootState } from '../hooks/useChat';

const ChatBox = ({ state, send }: { state: RootState; send: (text: string) => void }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput) {
      send(trimmedInput);
      setInput('');
    }
  };

  return (
    <div className="chatbox">
      <div className="chatbox__status">
        <span className="chatbox__fingerprint">session fingerprint:</span>
        <span className="chatbox__fingerprint">
          {state.sessionFingerprint &&
            state.sessionFingerprint.replace(/(?<=^(?:.{2})+)(?!$)/g, ':')}
        </span>
      </div>
      <div className="chatbox__messages">
        {state.messages.map((message, idx) => {
          return (
            <div
              className={
                message.own ? 'chatbox__message chatbox__message--type-own' : 'chatbox__message'
              }
              key={idx}
            >
              <span>{message.plaintext}</span>
            </div>
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
          enterKeyHint="send"
          onKeyUp={(ev) => ev.key === 'Enter' && handleSend()}
        />
        <button className="user-input__send" onClick={handleSend}>
          send
        </button>
      </div>
    </div>
  );
};

const EstablishingProgress = ({ info, sessionId }: { info: string; sessionId: string | null }) => {
  console.log(window.location);
  console.log(sessionId);

  return (
    <>
      <div>
        <span className="caret">{'>_'}</span>
        <span className="status-info">{info}</span>
      </div>
      {sessionId && <p>{`${window.location.origin}/${sessionId}`}</p>}
    </>
  );
};

const ChatSession = ({ sid }: { sid: string | null }) => {
  const [chatState, send] = useChat(sid);

  return chatState.isEstablished ? (
    <ChatBox state={chatState} send={send} />
  ) : (
    <EstablishingProgress info={chatState.info} sessionId={chatState.sessionId} />
  );
};

export default ChatSession;
