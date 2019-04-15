import dva from 'dva';
import createLoading from 'dva-loading';
const router = require('./router').default;

const runtimeDva = window.g_plugins.mergeConfig('dva');
let app
if (!window.g_app) {
   // 类似单例模式，防止hmr的时候重复创建store 
   app = window.store || dva({
    history: window.g_history,
    <%= ExtendDvaConfig %>
    ...(runtimeDva.config || {}),
    initialState: window.__initialData__ 
  });
  <%= EnhanceApp %>
  window.g_app = app;
  app.use(createLoading());
  (runtimeDva.plugins || []).forEach(plugin => {
    app.use(plugin);
  });
  <%= RegisterPlugins %>
  <%= RegisterModels %>
  
} else {
  app = window.g_app
}
app.router(() => router())
app.start()
