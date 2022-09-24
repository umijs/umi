import { inject, observer } from 'mobx-react';
import React from 'react';
import '../style.less';

export default inject('hello')(
  observer(function HomePage(props) {
    console.log(props.hello.msg);
    return (
      <div className="container">
        <p className="title">UmiJS x Mobx x Decorators</p>
        <p className="display-count">{props.hello.msg}</p>
        <div>
          <button onClick={() => props.hello.sayHello()}>say</button>
        </div>
      </div>
    );
  }),
);
