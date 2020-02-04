import { useRef, useEffect, useState } from 'react';

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

export const useInit = dep => {
  const [init, setInit] = useState(false);
  useEffect(
    () => {
      if (init || Object.keys(dep).length === 0) {
        return;
      }
      setInit(true);
    },
    [dep],
  );
  return [init];
};
