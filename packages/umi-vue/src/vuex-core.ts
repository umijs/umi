import Vuex from 'vuex';

interface IApp {
  _store: any;
  registerConfig: any;
}

export class App<IApp> {
  _store: any;
  registerConfig: any;

  constructor(config) {
    const { Vue } = config;
    if (!Vue) {
      console.error('[umi vue] global Vue为undefined');
    }
    Vue.use(Vuex);
    this._store = new Vuex.Store({ ...config });
    this.registerConfig = config.registerConfig;
  }

  model(model) {
    return this._store.registerModule(
      model.namespace,
      {
        namespaced: true,
        ...model,
      },
      this.registerConfig,
    );
  }

  unmodel(model) {
    return this._store.unregisterModule(model.namespace, this.registerConfig);
  }
}

export function create(config) {
  return new App(config);
}
