import useAdjustScroll from '../../hooks/useAdjustScroll';
import useVerticalBounds from '../../hooks/useVerticalBounds';

import type { ViewMessage } from '../../hooks/useSecureChatSession';

const MessagesList = ({ messages }: { messages: ViewMessage[] }) => {
  return (
    <ul className="messages-list">
      {messages.map((msg, idx) => (
        <li key={msg.ciphertext} className={msg.own ? 'message message_type_distinct' : 'message'}>
          {msg.plaintext}
        </li>
      ))}
    </ul>
  );
};
const ChatFeed = ({ messages }: { messages: ViewMessage[] }) => {
  const [topRef, btmRef, isTopReached, isBtmReached] = useVerticalBounds<HTMLDivElement>();
  const [feedRef, adjustScroll] = useAdjustScroll<HTMLDivElement>(messages, !isBtmReached);

  if (messages.length === 0) {
    return (
      <main className="placeholder">
        <span className="txt-system txt-system_dimmed">No messages, write something...</span>
      </main>
    );
  }

  return (
    <main className="chat__feed" ref={feedRef}>
      <div className="scroll-trap scroll-trap_at_top" aria-hidden ref={topRef} />
      <MessagesList messages={messages} />
      <button
        className={`btn-scroll-down ${!isBtmReached ? 'btn-scroll-down_visible' : ''}`}
        onClick={() => adjustScroll()}
      >
        v
      </button>
      <div className="scroll-trap scroll-trap_at_btm" aria-hidden ref={btmRef} />
    </main>
  );
};

export default ChatFeed;
