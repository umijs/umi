import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';

const ReduxProvider = (props) => <Provider store={store} {...props} />;

export function rootContainer(container, opts) {
  return React.createElement(ReduxProvider, opts, container);
}
