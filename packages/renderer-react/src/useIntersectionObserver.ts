import React from 'react';

export function useIntersectionObserver<T extends Element>(
  ref: React.RefObject<T>,
  callback: (entry: IntersectionObserverEntry | undefined) => void,
  intersectionObserverOptions: IntersectionObserverInit = {},
  options: { disabled?: boolean } = {},
): IntersectionObserver | null {
  // check if IntersectionObserver is available
  if (typeof IntersectionObserver !== 'function') return null;

  const isIntersectionObserverAvailable = React.useRef(
    typeof IntersectionObserver === 'function',
  );
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  React.useEffect(() => {
    if (
      !ref.current ||
      !isIntersectionObserverAvailable.current ||
      options.disabled
    ) {
      return;
    }
    observerRef.current = new IntersectionObserver(([entry]) => {
      callback(entry);
    }, intersectionObserverOptions);
    observerRef.current.observe(ref.current);
    return () => {
      observerRef.current?.disconnect();
    };
  }, [callback, intersectionObserverOptions, options.disabled, ref]);
  return observerRef.current;
}
