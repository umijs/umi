{{{ polyfillImports }}}
{{#globalVariables}}
import history from './history';
{{/globalVariables}}
{{{ importsAhead }}}
import React from 'react';
import ReactDOM from 'react-dom';
import findRoute, { getUrlQuery } from '{{{ findRoutePath }}}';
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

// render
let clientRender = async () => {
  {{{ render }}}
};
const render = plugins.compose('render', { initialValue: clientRender });

const moduleBeforeRendererPromises = [];
// client render
if (__IS_BROWSER) {
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
let serverRender, ReactDOMServer;
if (!__IS_BROWSER) {
  serverRender = async (ctx = {}) => {
    // ctx.req.url may be `/bar?locale=en-US`
    const [pathname] = (ctx.req.url || '').split('?');
    const history = require('@tmp/history').default;
    history.push(ctx.req.url);
    let props = {};
    const activeRoute = findRoute(require('./router').routes, pathname) || false;
    if (activeRoute && activeRoute.component && activeRoute.component.getInitialProps) {
      const initialProps = plugins.apply('modifyInitialProps', {
        initialValue: {},
      });
      // patch query object
      const location = history.location ? { ...history.location, query: getUrlQuery(history.location.search) } : {};
      props = await activeRoute.component.getInitialProps({
        route: activeRoute,
        isServer: true,
        location,
        // only exist in server
        req: ctx.req || {},
        res: ctx.res || {},
        ...initialProps,
      });
      props = plugins.apply('initialProps', {
         initialValue: props,
      });
    } else {
      // message activeRoute or getInitialProps not found
      console.log(
        !activeRoute
          ? `${pathname} activeRoute not found`
          : `${pathname} activeRoute's getInitialProps function not found`
      );
    }
    const rootContainer = plugins.apply('rootContainer', {
      initialValue: React.createElement(require('./router').default, props),
    });
    const htmlTemplateMap = {
      {{{ htmlTemplateMap }}}
    };
    return {
      htmlElement: activeRoute && activeRoute.path ? htmlTemplateMap[activeRoute.path] : '',
      rootContainer,
      matchPath: activeRoute && activeRoute.path,
      g_initialData: props,
    };
  }
  // using project react-dom version
  // https://github.com/facebook/react/issues/13991
  ReactDOMServer = require('react-dom/server');
}

export { ReactDOMServer };
export default __IS_BROWSER ? null : serverRender;

{{{ code }}}

// hot module replacement
if (__IS_BROWSER && module.hot) {
  module.hot.accept('./router', () => {
    clientRender();
  });
}
