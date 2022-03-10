import React from 'react';
import { StoreContainer } from '../unstated';
import '../style.less';

export default function HomePage(props) {
  const {
    counterState: count,
    counterActions: { increment, decrement },
  } = StoreContainer.useContainer();

  return (
    <div className="container">
      <p className="title">UmiJS x unstated</p>
      <p className="display-count">{count}</p>
      <div>
        <button onClick={() => increment()}>+</button>
        <button onClick={() => decrement()}>-</button>
      </div>
    </div>
  );
}
