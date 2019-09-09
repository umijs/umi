import React from 'react';
import ReactDOM from 'react-dom';
import debug from 'debug';
import 'antd/dist/antd.less';
import EventEmitter from 'events';
import get from 'lodash/get';
import { IRoute } from 'umi-types';
import history from '@tmp/history';
import { init as initSocket, callRemote } from './socket';
import PluginAPI from './PluginAPI';

const _debug = debug('umiui');

window.g_uiLocales = {};
// TODO pluginAPI add debug('plugin:${key}') for developer
window.g_uiDebug = _debug.extend('BaseUI');
const _log = window.g_uiDebug.extend('init');

// register event
if (!window.g_uiEventEmitter) {
  window.g_uiEventEmitter = new EventEmitter();
  // avoid oom
  window.g_uiEventEmitter.setMaxListeners(20);
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
    _log('Init socket success');
  } catch (e) {
    console.error('Init socket failed', e);
  }
  ReactDOM.render(
    React.createElement(require('./pages/loading').default, {}),
    document.getElementById('root'),
  );

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

  if (history.location.pathname.startsWith('/project/')) {
    // console.log("It's Project Manager");
  }

  // Project Manager
  else if (history.location.pathname.startsWith('/test')) {
    _log('Test Only');
  }

  // Project View
  else {
    const { data } = await callRemote({ type: '@@project/list' });
    const props = {
      data,
    };
    if (data.currentProject) {
      const currentProject = {
        key: data.currentProject,
        ...get(data, `projectsByKey.${data.currentProject}`, {}),
      };
      _log('apps data', data);
      window.g_uiCurrentProject =
        {
          ...currentProject,
          key: data.currentProject,
        } || {};
      _log('window.g_uiCurrentProject', window.g_uiCurrentProject);
      // types 和 api 上先不透露
      window.g_uiProjects = data.projectsByKey || {};
      try {
        await callRemote({
          type: '@@project/open',
          payload: { key: data.currentProject },
        });
      } catch (e) {
        props.error = e;
      }
      if (props.error) {
        ReactDOM.render(
          React.createElement(require('./pages/loading').default, props),
          document.getElementById('root'),
        );
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
        uiPlugin(new PluginAPI(service, currentProject));
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
    window.g_uiLocales = messages;
    _log('locale messages', window.g_uiLocales);
    return window.g_uiLocales;
  },
};

// for ga analyse
export const onRouteChange = params => {
  const { location } = params;
  const { pathname } = location;
  if (window.gtag && pathname) {
    window.gtag('config', 'UA-145890626-1', {
      page_path: pathname,
    });
  }
};
