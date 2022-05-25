import React from 'react';
import useSecureChatSession from '../../hooks/useSecureChatSession';
import ChatFeed from './ChatFeed';
import ChatInput from './ChatInput';
import ChatStatus from './ChatStatus';
import ChatLoading from './ChatLoading';

const ChatSession = ({ sid }: { sid: string | null }) => {
  const [chatState, send] = useSecureChatSession(sid);

  if (!chatState.isEstablished) {
    return <ChatLoading info={chatState.info} sessionId={chatState.sessionId} />;
  }

  return (
    <div className="chat">
      <ChatStatus
        info={chatState.info}
        fingerprint={chatState.sessionFingerprint}
        isClosed={chatState.isClosed}
      />
      <ChatFeed messages={chatState.messages} />
      <ChatInput send={send} />
    </div>
  );
};

export default ChatSession;
