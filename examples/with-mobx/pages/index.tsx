import { inject, observer } from 'mobx-react';
import React from 'react';
import '../style.less';

export default inject('counter')(
  observer(function HomePage(props) {
    return (
      <div className="container">
        <p className="title">UmiJS x Mobx</p>
        <p className="display-count">{props.counter.count}</p>
        <div>
          <button onClick={() => props.counter.increase()}>+</button>
          <button onClick={() => props.counter.decrease()}>-</button>
        </div>
      </div>
    );
  }),
);
