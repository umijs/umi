import history from '@tmp/history';
import { init as initSocket, callRemote } from './socket';

// PluginAPI
class PluginAPI {
  constructor(service) {
    this.service = service;
  }

  addPanel(panel) {
    this.service.panels.push(panel);
  }
}

// Service for Plugin API
// eslint-disable-next-line no-multi-assign
const service = (window.g_service = {
  panels: [],
});

// Avoid scope problem
const geval = eval; // eslint-disable-line

export async function render(oldRender) {
  // Init Socket Connection
  try {
    await initSocket({
      onMessage({ type, payload }) {
        if (type === '@@core/log') {
          if (window.xterm) {
            window.xterm.writeln(`\x1b[90m[LOG]\x1b[0m ${payload}`);
          }
        }
      },
    });
    console.log('Init socket success');
  } catch (e) {
    console.error('Init socket failed', e);
  }

  // 不同路由在渲染前的初始化逻辑
  if (history.location.pathname === '/') {
    const { data } = await callRemote({ type: '@@project/list' });
    if (data.currentProject) {
      await callRemote({
        type: '@@project/open',
        payload: { key: data.currentProject },
      });
      history.replace('/dashboard');
    } else {
      history.replace('/project/select');
    }
    window.location.reload();
    return;
  }

  // Project Manager
  else if (history.location.pathname.startsWith('/project/')) {
    console.log("It's Project Manager");
  }

  // Project View
  else {
    const { data } = await callRemote({ type: '@@project/list' });
    if (data.currentProject) {
      document.getElementById('root').innerHTML = '正在打开项目...';
      await callRemote({
        type: '@@project/open',
        payload: { key: data.currentProject },
      });
      // history.replace('/dashboard');

      // Get script and style from server, and run
      const { script } = await callRemote({ type: '@@project/getExtraAssets' });
      try {
        geval(`;(function(window){;${script}\n})(window);`);
      } catch (e) {
        console.error(`Error occurs while executing script from plugins`);
        console.error(e);
      }

      // Init the plugins
      window.g_uiPlugins.forEach(uiPlugin => {
        uiPlugin(new PluginAPI(service));
      });
    } else {
      history.replace('/project/select');
    }
  }

  // Do render
  oldRender();
}

export function patchRoutes(routes) {
  service.panels.forEach(panel => {
    routes[0].routes.unshift({
      exact: true,
      ...panel,
    });
  });
}
