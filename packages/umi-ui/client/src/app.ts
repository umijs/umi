import lodash from 'lodash';
import { IUi, IRoute } from 'umi-types';
import history from '@tmp/history';
import { init as initSocket, send, callRemote, listenRemote } from './socket';

// PluginAPI
class PluginAPI {
  public service: IUi.IService;
  /** lodash */
  readonly _: typeof lodash;
  /** react component context */
  callRemote: IUi.ICallRemove;
  listenRemote: IUi.IListenRemote;
  send: IUi.ISend;

  constructor(service: IUi.IService) {
    this.service = service;
    this.callRemote = callRemote;
    this.listenRemote = listenRemote;
    this.send = send;
    this._ = lodash;
  }

  getContext() {
    return window.g_uiContext;
  }

  private getDuplicateKeys(locales: IUi.ILocale[]): string[] {
    if (!Array.isArray(locales)) return [];
    const allLocaleKeys = locales.reduce(
      (curr, acc) => {
        // { key: value, key2, value }
        const localeObj = Object.values(acc).reduce(
          (c, locale) => ({
            ...c,
            ...locale,
          }),
          {},
        );
        const localeKeys = Object.keys(localeObj);
        return curr.concat(localeKeys);
      },
      [] as string[],
    );

    const _seen = new Set();
    const _store: string[] = [];
    return allLocaleKeys.filter(
      item => _seen.size === _seen.add(item).size && !_store.includes(item) && _store.push(item),
    );
  }

  public addPanel(panel: IUi.IPanel) {
    this.service.panels.push(panel);
  }

  public addLocales(locale: IUi.ILocale) {
    const duplicateKeys = this.getDuplicateKeys(this.service.locales.concat(locale)) || [];
    if (duplicateKeys.length > 0) {
      const errorMsg = `Conflict locale keys found in ['${duplicateKeys.join("', '")}']`;
      // 不影响渲染主流程
      console.error(errorMsg);
      // document.getElementById('root').innerHTML = errorMsg;
      // throw new Error(errorMsg);
    }

    this.service.locales.push(locale);
  }
}

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

export function patchRoutes(routes: IRoute[]) {
  const dashboardIndex = routes.findIndex(route => route.key === 'dashboard');
  if (dashboardIndex > -1) {
    service.panels.forEach(panel => {
      console.log('panel', panel);
      routes[dashboardIndex].routes.unshift({
        exact: true,
        ...panel,
      });
    });
  }
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
