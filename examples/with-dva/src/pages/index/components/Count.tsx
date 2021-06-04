import React from 'react';
import type { FC } from 'react';
import { connect, Dispatch } from 'umi';

interface CountProps {
  count: number;
  dispatch: Dispatch;
}

const Count: FC<CountProps> = ({ dispatch, count }) => {
  return (
    <div>
      <div>Count: {count}</div>
      <br />
      <div>
        <button
          onClick={() => {
            dispatch?.({ type: 'count/increase' });
          }}
        >
          Increase
        </button>
        <button
          onClick={() => {
            dispatch?.({ type: 'count/decrease' });
          }}
        >
          Decrease
        </button>
      </div>
    </div>
  );
};

export default connect(({ count }: { count: number }) => ({ count }))(Count);
