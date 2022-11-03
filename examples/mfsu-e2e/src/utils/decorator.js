import React from 'react';

export class Test extends React.Component {
  constructor() {}

  @withTimestamp
  render() {
    return <div>test</div>;
  }
}

function withTimestamp(target, name, descriptor) {
  const original = descriptor.value;
  if (typeof original === 'function') {
    descriptor.value = function (...args) {
      try {
        console.log(`start: ${Date.now()}`);
        const result = original.apply(this, args);
        console.log(`end: ${Date.now()}`);
        return result;
      } catch (e) {
        console.log(`Error: ${e}`);
        throw e;
      }
    };
  }
  return descriptor;
}
