import runtimePlugin from './runtimePlugin/runtimePlugin';
export { runtimePlugin };

import dynamic from './dynamic/dynamic';
export { dynamic };

import {
  Link,
  NavLink,
  Prompt,
  Redirect,
  Route,
  Router,
  Switch,
  match,
  matchPath,
  withRouter,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
export {
  Link,
  NavLink,
  Prompt,
  Redirect,
  Route,
  Router,
  Switch,
  match,
  matchPath,
  withRouter,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
};

import {
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
} from 'history';
export { createBrowserHistory, createHashHistory, createMemoryHistory };

// @ts-ignore
export * from '@@/umiExports';
