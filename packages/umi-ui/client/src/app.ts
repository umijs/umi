import history from '@tmp/history';
import { init as initSocket, send, callRemote, listenRemote } from './socket';
import { ILocale, IService, ICallRemove, IPanel, IListenRemote, ISend } from './typings';

// PluginAPI
class PluginAPI {
  public callRemote: ICallRemove;
  public service: IService;
  public listenRemote: IListenRemote;
  public send: ISend;

  constructor(service: IService) {
    this.service = service;
    this.callRemote = callRemote;
    this.listenRemote = listenRemote;
    this.send = send;
  }

  public addPanel(panel: IPanel) {
    this.service.panels.push(panel);
  }

  public addLocale(locale: ILocale) {
    this.service.locales.push(locale);
  }
}
// for developer use api.*
export type IApi = InstanceType<typeof PluginAPI>;

// Service for Plugin API
// eslint-disable-next-line no-multi-assign
const service = (window.g_service = {
  panels: [],
  locales: [],
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
      try {
        await callRemote({
          type: '@@project/open',
          payload: { key: data.currentProject },
        });
      } catch (e) {
        document.getElementById('root').innerHTML = `打开项目失败...\n后端消息：${e.message}`;
        return;
      }

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

export const locale = {
  messages: () => {
    const msg = service.locales.reduce((curr, acc) => {
      const localeGroup = Object.entries(acc);
      localeGroup.forEach(group => {
        const [lang, message] = group;
        curr[lang] = { ...curr[lang], ...message };
      });
      return curr;
    }, {});
    console.log('all message locales', msg);
    return msg;
  },
};
