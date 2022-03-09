import React from 'react';
import { Provider } from 'react-redux';
import { store } from './rematch/store';

const RematchProvider = (props) => <Provider store={store} {...props} />;

export function rootContainer(container, opts) {
  return React.createElement(RematchProvider, opts, container);
}
