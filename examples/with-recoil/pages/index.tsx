import React from 'react';
import { useCounterState, useCounterAction } from '../recoil/counter';
import '../style.less';

export default function HomePage(props) {
  const [count] = useCounterState();
  const { increment, decrement } = useCounterAction();

  return (
    <div className="container">
      <p className="title">UmiJS x Recoil</p>
      <p className="display-count">{count}</p>
      <div>
        <button onClick={() => increment()}>+</button>
        <button onClick={() => decrement()}>-</button>
      </div>
    </div>
  );
}
