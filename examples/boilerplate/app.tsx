import React from 'react';

export function rootContainer(container: any, opts: any) {
  return React.createElement(Foo, opts, container);
}

export function innerProvider(container: any) {
  return React.createElement(Foo, { title: 'innerProvider' }, container);
}

export function i18nProvider(container: any) {
  return React.createElement(Foo, { title: 'i18nProvider' }, container);
}

export function dataflowProvider(container: any) {
  return React.createElement(Foo, { title: 'dataflowProvider' }, container);
}

export function outerProvider(container: any) {
  return React.createElement(Foo, { title: 'outerProvider' }, container);
}

export function onRouteChange({ location, action }: any) {
  console.log('onRouteChange', location, action);
}

function Foo(props: any) {
  return (
    <div>
      <h1>{props.title || 'Foo'}</h1>
      {props.children}
    </div>
  );
}
