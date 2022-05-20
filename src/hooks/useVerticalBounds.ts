import { RefObject, useState, useRef, useEffect } from 'react';

const useVerticalBounds = <T extends Element>(
  options?: IntersectionObserverInit
): [RefObject<T>, RefObject<T>, boolean, boolean] => {
  const [isTopReached, setIsTopReached] = useState(false);
  const [isBtmReached, setisBtmReached] = useState(false);
  const topRef = useRef<T>(null);
  const btmRef = useRef<T>(null);

  const IntersectionObserverRef = useRef(
    new IntersectionObserver((entries) => {
      if (!topRef.current || !btmRef.current) return;

      entries.forEach((entry) => {
        if (entry.target.isSameNode(topRef.current)) {
          setIsTopReached(entry.isIntersecting);
        } else if (entry.target.isSameNode(btmRef.current)) {
          console.log('het btm');
          setisBtmReached(entry.isIntersecting);
        } else {
          return;
        }
      });
    }, options)
  );

  useEffect(() => {
    if (!topRef.current || !btmRef.current) return;
    const observer = IntersectionObserverRef.current;
    const topElement = topRef.current;
    const btmElement = btmRef.current;

    observer.observe(topElement);
    observer.observe(btmElement);

    return () => observer.disconnect();
  }, [topRef, btmRef]);

  return [topRef, btmRef, isTopReached, isBtmReached];
};

export default useVerticalBounds;
