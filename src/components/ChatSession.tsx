import React from 'react';
import useChat from '../hooks/useChat';
import ChatFeed from './ChatFeed';
import ChatInput from './ChatInput';
import ChatStatus from './ChatStatus';
import ConnectionProgress from './ConnectionProgress';

const ChatSession = ({ sid }: { sid: string | null }) => {
  const [chatState, send] = useChat(sid);

  if (!chatState.isEstablished) {
    return <ConnectionProgress info={chatState.info} sessionId={chatState.sessionId} />;
  }

  return (
    <div className="chat">
      <ChatStatus info={chatState.info} />
      <ChatFeed messages={chatState.messages} />
      <ChatInput send={send} />
    </div>
  );
};

export default ChatSession;
