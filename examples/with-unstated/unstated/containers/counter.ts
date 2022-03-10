import { useState } from 'react';

export function CounterContainer(initialState = 0) {
  let [count, setCount] = useState(initialState);
  let decrement = () => setCount(count - 1);
  let increment = () => setCount(count + 1);
  return { counterState: count, counterActions: { decrement, increment } };
}
