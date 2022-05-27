import React from 'react';
import useSecureChatSession from '../../hooks/useSecureChatSession';
import ChatFeed from './ChatFeed';
import ChatInput from './ChatInput';
import ChatStatus from './ChatStatus';
import ChatLoading from './ChatLoading';
import ChatFeedPlaceholder from './ChatFeedPlaceholder';

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
      {chatState.messages.length > 0 ? (
        <ChatFeed messages={chatState.messages} />
      ) : (
        <ChatFeedPlaceholder />
      )}
      <ChatInput sendDisabled={chatState.isClosed} send={send} />
    </div>
  );
};

export default ChatSession;
