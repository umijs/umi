import React from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import {
  decrementAction,
  incrementAction,
  selectCount,
} from '../redux/reducer/counterSlice';
import '../style.less';

export default function HomePage() {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();

  return (
    <div className="container">
      <p className="title">UmiJS x Redux</p>
      <p className="display-count">{count}</p>
      <div>
        <button onClick={() => dispatch(incrementAction())}>+</button>
        <button onClick={() => dispatch(decrementAction())}>-</button>
      </div>
    </div>
  );
}
