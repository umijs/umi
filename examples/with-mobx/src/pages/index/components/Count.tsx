import React from 'react';
import type { FC, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import CountModel from '@/stores/count';

interface CountProps {
  count?: CountModel;
}

const Count: FC<CountProps> = ({ count }) => {
  return (
    <div>
      <div>Count: {count?.count}</div>
      <br />
      <div>
        <button
          onClick={() => {
            count?.increase();
          }}
        >
          Increase
        </button>
        <button
          onClick={() => {
            count?.decrease();
          }}
        >
          Decrease
        </button>
      </div>
    </div>
  );
};

export default inject('count')(observer(Count));
