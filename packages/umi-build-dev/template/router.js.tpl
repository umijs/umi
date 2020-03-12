{{{ importsAhead }}}
import React from 'react';
import { Router as DefaultRouter, Route, Switch, StaticRouter } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/lib/renderRoutes';
import { createHistory } from '@tmp/history';
{{{ imports }}}

const Router = {{{ RouterRootComponent }}};

const routes = {{{ routes }}};
{{#globalVariables}}
window.g_routes = routes;
{{/globalVariables}}
const plugins = require('umi/_runtimePlugin');
plugins.applyForEach('patchRoutes', { initialValue: routes });

export { routes };

export default class RouterWrapper extends React.Component {

  history = createHistory();

  unListen() {}

  constructor(props) {
    super(props);

    // route change handler
    function routeChangeHandler(location, action) {
      plugins.applyForEach('onRouteChange', {
        initialValue: {
          routes,
          location,
          action,
        },
      });
    }
    this.unListen = this.history.listen(routeChangeHandler);
    // dva 中 history.listen 会初始执行一次
    // 这里排除掉 dva 的场景，可以避免 onRouteChange 在启用 dva 后的初始加载时被多执行一次
    const isDva = this.history.listen.toString().indexOf('callback(history.location, history.action)') > -1;
    if (!isDva) {
      routeChangeHandler(this.history.location);
    }
  }

  componentWillUnmount() {
    this.unListen();
    this.history = null;
  }

  render() {
    const props = this.props || {};
    const history = this.history;
    return (
      {{{ routerContent }}}
    );
  }
}
