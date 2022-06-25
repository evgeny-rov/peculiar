import React from 'react';
import ChatFeed from './ChatFeed';
import ChatInput from './ChatInput';
import ChatStatus from './ChatStatus';
import ChatFeedPlaceholder from './ChatFeedPlaceholder';
import type { ViewMessage } from '../../hooks/useSecureChatSession';

interface Props {
  isLive: boolean;
  messages: ViewMessage[];
  info: string;
  fingerprint: string;
  send: (text: string) => unknown;
}

const Chat = ({ isLive, messages, fingerprint, info, send }: Props) => {
  return (
    <div className="chat">
      <ChatStatus info={info} fingerprint={fingerprint} isConnected={isLive} />
      {messages.length > 0 ? <ChatFeed messages={messages} /> : <ChatFeedPlaceholder />}
      <ChatInput restricted={!isLive} send={send} />
    </div>
  );
};

export default Chat;
