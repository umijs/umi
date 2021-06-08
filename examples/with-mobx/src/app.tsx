import React from 'react';
import { Provider } from 'mobx-react';
import createMobxStores from './stores/createMobxStores';

const stores = createMobxStores();

const MobxProvider = (props) => <Provider {...stores} {...props} />;

export function rootContainer(container, opts) {
  return React.createElement(MobxProvider, opts, container);
}
