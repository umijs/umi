{{{ polyfillImports }}}
{{{ importsAhead }}}
import '@tmp/initHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { findRoute } from 'umi-utils'
{{{ imports }}}
// runtime plugins
window.g_plugins = require('umi/_runtimePlugin');
window.g_plugins.init({
  validKeys: [{{#validKeys}}'{{{ . }}}',{{/validKeys}}],
});
{{#plugins}}
window.g_plugins.use(require('{{{ . }}}'));
{{/plugins}}

{{{ codeAhead }}}
const router = require('./router').default;

// render
const serverRender = async (ctx) => {
  const pathname = ctx.req.url;
  let props = {}
  const activeRoute = findRoute(window.g_routes, pathname) || false;
  props = activeRoute && activeRoute.component.getInitialProps ? await activeRoute.component.getInitialProps() : {};
  const rootContainer = window.g_plugins.apply('rootContainer', {
    initialValue: React.createElement(router, props),
  });
  return rootContainer
}

const clientRender = async () => {
  {{{ render }}}
};
const render = window.g_plugins.compose('render', { initialValue: clientRender });

const moduleBeforeRendererPromises = [];
{{# moduleBeforeRenderer }}
if (typeof {{ specifier }} === 'function') {
  const promiseOf{{ specifier }} = {{ specifier }}();
  if (promiseOf{{ specifier }} && promiseOf{{ specifier }}.then) {
    moduleBeforeRendererPromises.push(promiseOf{{ specifier }});
  }
}
{{/ moduleBeforeRenderer }}

{{{ code }}}

if (module.hot) {
  module.hot.accept()
}

export default __isBrowser__ ?  Promise.all(moduleBeforeRendererPromises).then(() => {
    render();
  }).catch((err) => {
    window.console && window.console.error(err);
  }) : serverRender
  