import lodash from 'lodash';
import { formatMessage } from 'umi-plugin-react/locale';
import { ReactNode } from 'react';
import EventEmitter from 'events';
import { IUi, IRoute } from 'umi-types';
import history from '@tmp/history';
import { init as initSocket, send, callRemote, listenRemote } from './socket';
import TwoColumnPanel from './components/TwoColumnPanel';

let localeMessages = {};

// register event
if (!window.g_uiEventEmitter) {
  window.g_uiEventEmitter = new EventEmitter();
  // avoid oom
  window.g_uiEventEmitter.setMaxListeners(10);
}

// PluginAPI
class PluginAPI {
  public service: IUi.IService;
  public _: IUi.ILodash;
  callRemote: IUi.ICallRemove;
  listenRemote: IUi.IListenRemote;
  send: IUi.ISend;
  TwoColumnPanel: ReactNode;

  constructor(service: IUi.IService) {
    this.service = service;
    this.callRemote = callRemote;
    this.listenRemote = listenRemote;
    this.send = send;
    this._ = lodash;
    this.TwoColumnPanel = TwoColumnPanel;
  }

  showLogPanel: IUi.IShowLogPanel = () => {
    if (window.g_uiEventEmitter) {
      window.g_uiEventEmitter.emit('SHOW_LOG');
    }
  };
  hideLogPanel: IUi.IHideLogPanel = () => {
    if (window.g_uiEventEmitter) {
      window.g_uiEventEmitter.emit('HIDE_LOG');
    }
  };

  intl: IUi.IIntl = key => {
    const locale = window.g_lang;
    if (typeof key !== 'string') return '';
    if (key in (localeMessages[locale] || {})) {
      return formatMessage({
        id: key,
      });
    }
    return key;
  };

  notify: IUi.INotify = async payload => {
    const { title, message, subtitle, ...restPayload } = payload;

    // need intl text
    const intlParams = {
      title: this.intl(title),
      message: this.intl(message),
      subtitle: this.intl(subtitle),
    };

    try {
      await callRemote({
        type: '@@app/notify',
        payload: {
          ...intlParams,
          ...restPayload,
        },
      });
    } catch (e) {
      console.error('notify error', e);
    }
  };

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

  addPanel: IUi.IAddPanel = panel => {
    this.service.panels.push(panel);
  };

  addLocales: IUi.IAddLocales = locale => {
    const duplicateKeys = this.getDuplicateKeys(this.service.locales.concat(locale)) || [];
    if (duplicateKeys.length > 0) {
      const errorMsg = `Conflict locale keys found in ['${duplicateKeys.join("', '")}']`;
      // 不影响渲染主流程
      console.error(errorMsg);
      // document.getElementById('root').innerHTML = errorMsg;
      // throw new Error(errorMsg);
    }

    this.service.locales.push(locale);
  };
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

  // Project Manager
  else if (history.location.pathname.startsWith('/test')) {
    console.log('Test Only');
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
    localeMessages = service.locales.reduce((curr, acc) => {
      const localeGroup = Object.entries(acc);
      localeGroup.forEach(group => {
        const [lang, message] = group;
        curr[lang] = { ...curr[lang], ...message };
      });
      return curr;
    }, {});
    console.log('all message locales', localeMessages);
    return localeMessages;
  },
};
