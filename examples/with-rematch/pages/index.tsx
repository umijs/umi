import React from 'react';
import { selectCount } from '../rematch/models/counter';
import '../style.less';
import { useAppDispatch, useAppSelector } from '../rematch/hook';

export default function HomePage(props) {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();

  return (
    <div className="container">
      <p className="title">UmiJS x Rematch</p>
      <p className="display-count">{count}</p>
      <div>
        <button onClick={() => dispatch.counter.increment(1)}>+</button>
        <button onClick={() => dispatch.counter.decrement(1)}>-</button>
      </div>
    </div>
  );
}
