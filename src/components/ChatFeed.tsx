import useAdjustScroll from '../hooks/useAdjustScroll';
import useVerticalBounds from '../hooks/useVerticalBounds';
// import MessagesList from './MessagesList';

import type { ViewMessage } from '../hooks/useChat';

const ChatFeed = ({ messages }: { messages: ViewMessage[] }) => {
  const [topRef, btmRef, isTopReached, isBtmReached] = useVerticalBounds<HTMLDivElement>();
  const [feedRef, adjustScroll] = useAdjustScroll<HTMLDivElement>(messages, !isBtmReached);

  return (
    <div className="chat__feed" ref={feedRef}>
      <div className="scroll-trap scroll-trap_at_top" aria-hidden ref={topRef} />
      {/* <MessagesList messages={messages} /> */}
      <button
        className={`scroll-suggest ${!isBtmReached ? 'scroll-suggest_visible' : ''}`}
        onClick={() => adjustScroll()}
      >
        v
      </button>
      <div className="scroll-trap scroll-trap_at_btm" aria-hidden ref={btmRef} />
    </div>
  );
};

export default ChatFeed;
