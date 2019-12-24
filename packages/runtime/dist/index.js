'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var reactRouterDom = require('react-router-dom');
var umiExports = require('@@/umiExports');

function runtimePlugin() {}

function dynamic() {}

Object.keys(umiExports).forEach(function(k) {
  if (k !== 'default')
    Object.defineProperty(exports, k, {
      enumerable: true,
      get: function() {
        return umiExports[k];
      },
    });
});
Object.defineProperty(exports, 'Link', {
  enumerable: true,
  get: function() {
    return reactRouterDom.Link;
  },
});
Object.defineProperty(exports, 'NavLink', {
  enumerable: true,
  get: function() {
    return reactRouterDom.NavLink;
  },
});
Object.defineProperty(exports, 'Prompt', {
  enumerable: true,
  get: function() {
    return reactRouterDom.Prompt;
  },
});
Object.defineProperty(exports, 'Redirect', {
  enumerable: true,
  get: function() {
    return reactRouterDom.Redirect;
  },
});
Object.defineProperty(exports, 'Route', {
  enumerable: true,
  get: function() {
    return reactRouterDom.Route;
  },
});
Object.defineProperty(exports, 'Router', {
  enumerable: true,
  get: function() {
    return reactRouterDom.Router;
  },
});
Object.defineProperty(exports, 'Switch', {
  enumerable: true,
  get: function() {
    return reactRouterDom.Switch;
  },
});
Object.defineProperty(exports, 'match', {
  enumerable: true,
  get: function() {
    return reactRouterDom.match;
  },
});
Object.defineProperty(exports, 'matchPath', {
  enumerable: true,
  get: function() {
    return reactRouterDom.matchPath;
  },
});
Object.defineProperty(exports, 'useHistory', {
  enumerable: true,
  get: function() {
    return reactRouterDom.useHistory;
  },
});
Object.defineProperty(exports, 'useLocation', {
  enumerable: true,
  get: function() {
    return reactRouterDom.useLocation;
  },
});
Object.defineProperty(exports, 'useParams', {
  enumerable: true,
  get: function() {
    return reactRouterDom.useParams;
  },
});
Object.defineProperty(exports, 'useRouteMatch', {
  enumerable: true,
  get: function() {
    return reactRouterDom.useRouteMatch;
  },
});
Object.defineProperty(exports, 'withRouter', {
  enumerable: true,
  get: function() {
    return reactRouterDom.withRouter;
  },
});
exports.dynamic = dynamic;
exports.runtimePlugin = runtimePlugin;
