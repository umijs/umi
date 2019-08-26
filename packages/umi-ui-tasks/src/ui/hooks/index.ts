import { useRef, useEffect } from 'react';

export * from './tasks';
export * from './terminal';

export const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(
    () => {
      ref.current = value;
    },
    [value],
  );
  return ref.current;
};
