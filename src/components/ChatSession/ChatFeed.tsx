import useAdjustScroll from '../../hooks/useAdjustScroll';
import useVerticalBounds from '../../hooks/useVerticalBounds';

import type { ViewMessage } from '../../hooks/useSecureChatSession';

const MessagesList = ({ messages }: { messages: ViewMessage[] }) => {
  return (
    <ul className="messages-list">
      {messages.map((msg, idx) => (
        <li key={idx} className={msg.own ? 'message message_type_distinct' : 'message'}>
          {msg.plaintext}
        </li>
      ))}
    </ul>
  );
};
const ChatFeed = ({ messages }: { messages: ViewMessage[] }) => {
  const [topRef, btmRef, isTopReached, isBtmReached] = useVerticalBounds<HTMLDivElement>();
  const [feedRef, adjustScroll] = useAdjustScroll<HTMLDivElement>(messages, !isBtmReached);

  return (
    <div className="chat__feed" ref={feedRef}>
      <div className="scroll-trap scroll-trap_at_top" aria-hidden ref={topRef} />
      <MessagesList messages={messages} />
      <button
        className={`btn-scroll-down ${!isBtmReached ? 'btn-scroll-down_visible' : ''}`}
        onClick={() => adjustScroll()}
      >
        v
      </button>
      <div className="scroll-trap scroll-trap_at_btm" aria-hidden ref={btmRef} />
    </div>
  );
};

export default ChatFeed;
