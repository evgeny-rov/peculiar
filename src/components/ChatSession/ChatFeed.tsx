import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { throttle } from 'lodash';
import useAdjustScroll from '../../hooks/useAdjustScroll';

import type { ViewMessage } from '../../hooks/useSecureChatSession';

const MessagesList = ({ messages }: { messages: ViewMessage[] }) => {
  return (
    <ul className="messages-list">
      {messages.map((msg) => (
        <li key={msg.id} className={msg.own ? 'message message_own' : 'message'}>
          {msg.plaintext}
        </li>
      ))}
    </ul>
  );
};

const MESSAGES_CHUNK_SIZE = 30;

console.log(process.env);

const ChatFeed = ({ messages }: { messages: ViewMessage[] }) => {
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [numOfMsgsChunks, setNumOfMsgsChunks] = useState(1);
  const [feedRef, adjustScroll] = useAdjustScroll<HTMLDivElement>();
  const prevRecentMessageRef = useRef<ViewMessage>();

  useEffect(() => {
    if (messages.length <= 0) return;

    const recentMessage = messages[messages.length - 1];
    const hasNewMessage = recentMessage.id !== prevRecentMessageRef.current?.id;
    const isRecentMessageOwn = messages[messages.length - 1].own;

    const shouldAdjustScroll = (hasNewMessage && isRecentMessageOwn) || !isBrowsing;

    if (shouldAdjustScroll) adjustScroll();
    if (hasNewMessage) prevRecentMessageRef.current = recentMessage;
  }, [messages, isBrowsing, adjustScroll]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement, UIEvent>) => {
    const target = e.target as HTMLElement;
    const yFromTop = target.scrollTop;
    const yFromBtm = target.scrollHeight - yFromTop - target.clientHeight;

    if (yFromBtm >= yFromTop) {
      setNumOfMsgsChunks((chunks) => chunks + 1);
      setIsBrowsing(true);
    } else if (yFromBtm > 0) {
      setIsBrowsing(true);
    } else {
      setNumOfMsgsChunks(1);
      setIsBrowsing(false);
    }
  }, []);

  const shownMessages = useMemo(() => {
    return messages.slice(Math.max(messages.length - numOfMsgsChunks * MESSAGES_CHUNK_SIZE, 0));
  }, [messages, numOfMsgsChunks]);

  return (
    <main className="chat__feed" ref={feedRef} onScroll={throttle(handleScroll, 100)}>
      <MessagesList messages={shownMessages} />
      <button
        className={isBrowsing ? 'btn-scroll-down btn-scroll-down_visible' : 'btn-scroll-down'}
        onClick={() => adjustScroll()}
      >
        {'v'}
      </button>
    </main>
  );
};

export default ChatFeed;
