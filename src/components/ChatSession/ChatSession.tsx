import React from 'react';
import useSecureChatSession from '../../hooks/useSecureChatSession';
import ChatFeed from './ChatFeed';
import ChatInput from './ChatInput';
import ChatStatus from './ChatStatus';
import ConnectionProgress from './ChatLoading';

const ChatSession = ({ sid }: { sid: string | null }) => {
  const [chatState, send] = useSecureChatSession(sid);

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
