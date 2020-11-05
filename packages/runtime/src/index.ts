export {
  Link,
  NavLink,
  Prompt,
  Redirect,
  Route,
  Router,
  StaticRouter,
  MemoryRouter,
  Switch,
  matchPath,
  withRouter,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
export { __RouterContext } from 'react-router';

export {
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
} from '@umijs/history';
export type { MemoryHistory } from '@umijs/history';

export { default as Plugin, ApplyPluginsType } from './Plugin/Plugin';
export { default as dynamic } from './dynamic/dynamic';
