import React from 'react';

export function rootContainer(container: any, opts: any) {
  return React.createElement(Foo, opts, container);
}

function Foo(props: any) {
  return (
    <div>
      <h1>Foo</h1>
      {props.children}
    </div>
  );
}
