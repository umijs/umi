import _umiDynamic from 'umi/dynamic';
import { types } from 'mobx-state-tree';

const cached = {};

function registerStore(stores = []) {
  stores.map(store => {
    const { name, path } = store;
    if (!cached[key]) {
      types.model('RootStore', {
        [name]: types.optional(require(`${path}`).default, {}),
      });
      cached[key] = 1;
    }
  });
}
export default function dynamic(config) {
  const { stores, component: resolveComponent } = config;
  return _umiDynamic({
    loader: async function() {
      registerStore(stores);
      return () => resolveComponent();
    },
  });
}
