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
  const { matchRoutes } = require('react-router-config');
  const { StaticRouter } = require('react-router')
  const { parsePath } = require('history');
  // don't remove, use stringify html map
  const stringify = require('serialize-javascript');
  const router = require('./router');

  /**
   * Get Component initialProps function data
   * convert Component props
   * @param pathname
   * @param props
   */
  const getInitialProps = (pathname, props) => {
    const { routes } = router;
    const initialProps = plugins.apply('modifyInitialProps', {
      initialValue: {},
    });
    const branch = matchRoutes(routes, pathname) || false;
    const promises = branch.map(({ route }) => {
      if (route.component && route.component.getInitialProps) {
        return route.component.getInitialProps({
          isServer: true,
          ...props,
          ...initialProps,
        });
      }
      return Promise.resolve({});
    });

    return Promise.all(promises);
  }

  serverRender = async (ctx = {}) => {
    // ctx.req.url may be `/bar?locale=en-US`
    const [pathname] = (ctx.req.url || '').split('?');
    const location = parsePath(ctx.req.url);
    const activeRoute = findRoute(router.routes, pathname) || {};
    // omit component
    const { component, ...restRoute } = activeRoute;
    const context = {};
    const dataArr = await getInitialProps(pathname, {
        route: restRoute,
        // only exist in server
        req: ctx.req || {},
        res: ctx.res || {},
        context,
        location,
    });
    // reduce all match component getInitialProps
    // in the same object key
    // page data key will override layout key
    let props = Array.isArray(dataArr) ? dataArr.reduce((acc, curr) => ({
      ...acc,
      ...curr,
    }), {}) : {};
    // please use return, avoid return all model
    props = plugins.apply('initialProps', {
      initialValue: props,
    });

    const App = React.createElement(StaticRouter, {
      location: ctx.req.url,
      context,
    }, React.createElement(router.default, props));

    // render rootContainer for htmlTemplateMap
    const rootContainer = plugins.apply('rootContainer', {
      initialValue: App,
    });
    const htmlTemplateMap = {
      {{{ htmlTemplateMap }}}
    };
    const matchPath = activeRoute.path;
    return {
      htmlElement: matchPath ? htmlTemplateMap[matchPath] : '',
      rootContainer,
      matchPath,
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
