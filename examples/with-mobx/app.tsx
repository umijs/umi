import React from 'react';
import { Provider } from 'mobx-react';
import stores from './stores';

const MobxProvider = (props) => <Provider {...stores} {...props} />;

export function rootContainer(container, opts) {
  return React.createElement(MobxProvider, opts, container);
}
