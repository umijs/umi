import dva from 'dva';
import createLoading from 'dva-loading';
import history from '@tmp/history';

const plugins = require('umi/_runtimePlugin');
const runtimeDva = plugins.mergeConfig('dva');
let app = dva({
  history,
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
