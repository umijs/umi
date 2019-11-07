import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.less';
import get from 'lodash/get';
import { IRoute } from 'umi-types';
import history from '@tmp/history';
import querystring from 'querystring';
import { getLocale } from '@/utils';
import { init as initSocket, callRemote } from './socket';
import { setCurrentProject, clearCurrentProject } from '@/services/project';
import debug from '@/debug';
import proxyConsole from './proxyConsole';
import PluginAPI from './PluginAPI';

// TODO pluginAPI add debug('plugin:${key}') for developer
const _log = debug.extend('init');

// Service for Plugin API
// eslint-disable-next-line no-multi-assign
const service = (window.g_service = {
  panels: [],
  locales: [],
  configSections: [],
  basicUI: {},
  dashboard: [],
});

// Avoid scope problem
const geval = eval; // eslint-disable-line

const initBasicUI = async () => {
  const { script: basicUIScript } = await callRemote({ type: '@@project/getBasicAssets' });
  if (basicUIScript) {
    geval(`;(function(window){;${basicUIScript}\n})(window);`);
    // Init the baseUI
    window.g_uiBasicUI.forEach(basicUI => {
      // only readable
      basicUI(Object.freeze(new PluginAPI(service)));
    });
  }
};

const initUIPlugin = async (initOpts = {}) => {
  const { currentProject } = initOpts;
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
    // only readable
    uiPlugin(Object.freeze(new PluginAPI(service, currentProject)));
  });
};

export async function render(oldRender) {
  // mini 模式下允许通过加 key 的参数打开
  // 比如: ?mini&key=xxx
  const { search = '' } = window.location;
  const qs = querystring.parse(search.slice(1));
  const miniKey = qs.key || null;
  const isMini = 'mini' in qs;

  // proxy console.* in mini
  proxyConsole(!!isMini);

  // mini open not in project
  // redirect full version
  if (isMini && window.self === window.parent) {
    const { mini, key, ...restProps } = qs;
    const query = querystring.stringify(restProps);
    history.push(`${history.location.pathname}${query ? `?${query}` : ''}`);
    window.location.reload();
    return false;
  }

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
    _log('Init socket success');
  } catch (e) {
    console.error('Init socket failed', e);
  }
  ReactDOM.render(
    React.createElement(require('./pages/loading').default, {}),
    document.getElementById('root'),
  );
  await initBasicUI();
  const { data } = await callRemote({ type: '@@project/list' });
  const props = {
    data,
  };
  const key = isMini ? miniKey : data.currentProject;

  if (key) {
    // 在 callRemote 里使用
    window.g_currentProject = key;
    const currentProject = {
      key,
      ...get(data, `projectsByKey.${key}`, {}),
    };
    _log('apps data', data);
    window.g_uiCurrentProject =
      {
        ...currentProject,
        key,
      } || {};
    _log('window.g_uiCurrentProject', window.g_uiCurrentProject);
    // types 和 api 上先不透露
    window.g_uiProjects = data.projectsByKey || {};
    try {
      await callRemote({
        type: '@@project/open',
        payload: { key },
      });
      if (!isMini) {
        await setCurrentProject({
          key,
        });
      }
    } catch (e) {
      props.error = e;
    }
    if (props.error) {
      history.replace(`/error?key=${key}`);
      ReactDOM.render(
        React.createElement(require('./pages/loading').default, props),
        document.getElementById('root'),
      );
      await clearCurrentProject();
      return false;
    }

    await initUIPlugin({
      currentProject,
    });
  } else {
    history.replace('/project/select');
  }
  // Do render
  oldRender();
}

export function patchRoutes(routes: IRoute[]) {
  const dashboardIndex = routes.findIndex(route => route.key === 'dashboard');
  if (dashboardIndex > -1) {
    service.panels.forEach(panel => {
      _log('panel', panel);
      routes[dashboardIndex].routes.unshift({
        exact: true,
        ...panel,
      });
    });
  }
}

export const locale = {
  messages: () => {
    const messages = service.locales.reduce((curr, acc) => {
      const localeGroup = Object.entries(acc);
      localeGroup.forEach(group => {
        const [lang, message] = group;
        curr[lang] = { ...curr[lang], ...message };
      });
      return curr;
    }, {});
    _log('locale messages', messages);
    return messages;
  },
  default: getLocale,
};

// for ga analyse
export const onRouteChange = params => {
  const { location } = params;
  const { pathname, search = '' } = location;
  if (window.gtag && pathname) {
    const isMini = search.indexOf('mini') > -1 ? '?mini' : '';
    window.gtag('config', 'UA-145890626-1', {
      page_path: `${pathname}${isMini}`,
    });
  }
};
