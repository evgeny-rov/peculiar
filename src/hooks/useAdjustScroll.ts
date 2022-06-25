import { RefObject, useRef, useEffect, useCallback } from 'react';

const useAdjustScroll = <T extends Element>(): [RefObject<T>, (smooth?: boolean) => void] => {
  const scrolledElementRef = useRef<T>(null);

  const adjust = useCallback((smooth = true) => {
    scrolledElementRef.current?.scrollTo({
      top: scrolledElementRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  const resizeObserverRef = useRef(new ResizeObserver(() => adjust()));

  useEffect(() => {
    if (!scrolledElementRef.current) return;
    const resizeObserver = resizeObserverRef.current;

    resizeObserver.observe(scrolledElementRef.current);
    adjust(false);

    return () => resizeObserver.disconnect();
  }, [adjust]);

  return [scrolledElementRef, adjust];
};

export default useAdjustScroll;
