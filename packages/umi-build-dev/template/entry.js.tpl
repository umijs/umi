{{{ polyfillImports }}}
{{#globalVariables}}
import './history';
{{/globalVariables}}
{{{ importsAhead }}}
import React from 'react';
import ReactDOM from 'react-dom';
{{{ imports }}}

// runtime plugins
const plugins = require('umi/_runtimePlugin');
{{#globalVariables}}
window.g_plugins = plugins;
{{/globalVariables}}
plugins.init({
  validKeys: [{{#validKeys}}'{{{ . }}}',{{/validKeys}}],
});
{{#plugins}}
plugins.use(require('{{{ . }}}'));
{{/plugins}}

{{{ codeAhead }}}

// utils
function findRoute(routes, path) {
  let activeRoute;
  routes.map(route => {
    if (route.routes) {
      activeRoute = findRoute(route.routes, path);
    } else if (require('react-router-dom').matchPath(path, route)) {
      activeRoute = route;
    }
  });
  return activeRoute;
}

// render
let clientRender = async () => {
  {{{ render }}}
};
const render = plugins.compose('render', { initialValue: clientRender });

// client render
if (__IS_BROWSER) {
  const moduleBeforeRendererPromises = [];
  {{# moduleBeforeRenderer }}
  if (typeof {{ specifier }} === 'function') {
    const promiseOf{{ specifier }} = {{ specifier }}();
    if (promiseOf{{ specifier }} && promiseOf{{ specifier }}.then) {
      moduleBeforeRendererPromises.push(promiseOf{{ specifier }});
    }
  }
  {{/ moduleBeforeRenderer }}

  Promise.all(moduleBeforeRendererPromises).then(() => {
    render();
  }).catch((err) => {
    window.console && window.console.error(err);
  });
}

// export server render
let serverRender;
if (!__IS_BROWSER) {
  serverRender = async (ctx) => {
    const pathname = ctx.req.url;
    let props = {};
    const activeRoute = findRoute(require('./router').routes, pathname) || false;
    props = activeRoute && activeRoute.component.getInitialProps ? await activeRoute.component.getInitialProps() : {};
    const rootContainer = plugins.apply('rootContainer', {
      initialValue: React.createElement(require('./router'), props),
    });
    return rootContainer;
  }
}
export default __IS_BROWSER ? null : serverRender;

{{{ code }}}

// hot module replacement
if (__IS_BROWSER && module.hot) {
  module.hot.accept('./router', () => {
    clientRender();
  });
}
