import { useEffect, useRef } from 'react';

export default <T = any>(value: T): T => {
  const ref = useRef<T>();

  useEffect(
    () => {
      ref.current = value;
    },
    [value],
  );

  return ref.current ? ref.current : value;
};
