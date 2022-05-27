import useAdjustScroll from '../../hooks/useAdjustScroll';
import useVerticalBounds from '../../hooks/useVerticalBounds';

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
const ChatFeed = ({ messages }: { messages: ViewMessage[] }) => {
  const [topRef, btmRef, isTopReached, isBtmReached] = useVerticalBounds<HTMLDivElement>();
  const [feedRef, adjustScroll] = useAdjustScroll<HTMLDivElement>(messages, !isBtmReached);

  return (
    <main className="chat__feed" ref={feedRef}>
      <div className="scroll-trap scroll-trap_at_top" aria-hidden ref={topRef} />
      <MessagesList messages={messages} />
      <button
        className={
          !isBtmReached
            ? 'btn-scroll-down btn-scroll-down_visible'
            : 'btn-scroll-down btn-scroll-down_hidden'
        }
        onClick={() => adjustScroll()}
      >
        v
      </button>
      <div className="scroll-trap scroll-trap_at_btm" aria-hidden ref={btmRef} />
    </main>
  );
};

export default ChatFeed;
