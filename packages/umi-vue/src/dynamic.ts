declare var window: Window;
interface Window {
  g_app: any;
}

const cached = {};
const registerModel = model => {
  if (!cached[model.namespace]) {
    window.g_app.model(model);
    cached[model.namespace] = 1;
  }
};

export default config => {
  const { models: resolveModels, component: resolveComponent } = config;
  const models = typeof resolveModels === 'function' ? resolveModels() : [];
  const component = resolveComponent();
  return () =>
    new Promise(resolve => {
      Promise.all([...models, component]).then(ret => {
        if (!models || !models.length) {
          return resolve(ret[0]);
        } else {
          const len = models.length;
          ret.slice(0, len).forEach(m => {
            registerModel(m.default);
          });
          resolve(ret[len]);
        }
      });
    });
};
