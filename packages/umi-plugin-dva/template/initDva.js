import dva from 'dva';
import createLoading from 'dva-loading';

const runtimeDva = window.g_plugins.mergeConfig('dva');
let app = dva({
  history: window.g_history,
  <%= ExtendDvaConfig %>
  ...(runtimeDva.config || {}),
});
<%= EnhanceApp %>
window.g_app = app;
app.use(createLoading());
(runtimeDva.plugins || []).forEach(plugin => {
  app.use(plugin);
});
<%= RegisterPlugins %>
<%= RegisterModels %>
