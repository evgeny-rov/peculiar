import { useRef, useEffect, useCallback } from 'react';

const useDelay = (): [(f: Function, delay: number) => any, Function] => {
  const timeoutRef = useRef<number>();

  useEffect(() => {
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
  }, []);

  const delay = useCallback((f: Function, delay: number) => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(f, delay);
  }, []);

  const abort = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  return [delay, abort];
};

export default useDelay;
