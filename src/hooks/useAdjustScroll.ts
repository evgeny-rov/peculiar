import { RefObject, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import type { ViewMessage } from './useSecureChatSession';

const useAdjustScroll = <T extends Element>(
  messages: ViewMessage[],
  strict: boolean
): [RefObject<T>, (smooth?: boolean) => void] => {
  const scrolledElementRef = useRef<T>(null);
  const strictModeRef = useRef(strict);

  const adjust = useCallback((smooth = true) => {
    scrolledElementRef.current?.scrollTo({
      top: scrolledElementRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  const resizeObserverRef = useRef(new ResizeObserver(() => adjust()));

  useLayoutEffect(() => {
    if (!scrolledElementRef.current) return;
    const resizeObserver = resizeObserverRef.current;

    resizeObserver.observe(scrolledElementRef.current);

    console.log('adjusting initial scroll position');
    adjust(false);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    strictModeRef.current = strict;
  }, [strict]);

  useEffect(() => {
    const isLastMessageOwn = messages[messages.length - 1]?.own;
    const isInStrictMode = strictModeRef.current;

    if (isInStrictMode && !isLastMessageOwn) return;

    adjust();
  }, [messages, adjust]);

  return [scrolledElementRef, adjust];
};

export default useAdjustScroll;
