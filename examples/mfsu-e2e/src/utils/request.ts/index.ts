import { useState } from 'react';

export function useCount(beg: number) {
  const [count, setCount] = useState<number>(beg);
  return {
    count,
    setCount,
  };
}
