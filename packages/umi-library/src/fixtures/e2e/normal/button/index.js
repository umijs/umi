import React from 'react';
import './index.css';
import './b.less';

function bar(Component) {
  return Component;
}

export default function(props) {
  return (
    <button
      className={`g b`}
      style={{
        fontSize: props.size === 'large' ? 40 : 20,
      }}
    >
      { props.children }
    </button>
  );
}
