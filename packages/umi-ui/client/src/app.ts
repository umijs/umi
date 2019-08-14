import React from 'react';
import ReactDOM from 'react-dom';
import EventEmitter from 'events';
import { IRoute } from 'umi-types';
import history from '@tmp/history';
import { init as initSocket, callRemote } from './socket';
import PluginAPI from './PluginAPI';

window.g_uiLocales = {};

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

  if (history.location.pathname.startsWith('/project/')) {
    console.log("It's Project Manager");
  }

  // Project Manager
  else if (history.location.pathname.startsWith('/test')) {
    console.log('Test Only');
  }

  // Project View
  else {
    ReactDOM.render(
      React.createElement(require('./pages/loading').default, {}),
      document.getElementById('loading'),
    );
    const { data } = await callRemote({ type: '@@project/list' });
    const props = {
      data,
    };
    if (data.currentProject) {
      try {
        await callRemote({
          type: '@@project/open',
          payload: { key: data.currentProject },
        });
        document.getElementById('loading').innerHTML = '';
      } catch (e) {
        props.error = e;
      }
      if (props.error) {
        ReactDOM.render(
          React.createElement(require('./pages/loading').default, props),
          document.getElementById('loading'),
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
    const messages = service.locales.reduce((curr, acc) => {
      const localeGroup = Object.entries(acc);
      localeGroup.forEach(group => {
        const [lang, message] = group;
        curr[lang] = { ...curr[lang], ...message };
      });
      return curr;
    }, {});
    window.g_uiLocales = messages;
    console.log('all message locales', window.g_uiLocales);
    return window.g_uiLocales;
  },
};
