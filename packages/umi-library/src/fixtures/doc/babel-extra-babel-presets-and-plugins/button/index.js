import React from 'react';

const console = {
  log(...args) {
    return args.join('|');
  },
};

export default function() {
  return (
    <h1 className="foo">{ console.log('haha') }</h1>
  );
}
