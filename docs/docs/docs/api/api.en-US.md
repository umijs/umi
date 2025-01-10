---
order: 1
toc: content
translated_at: '2024-03-17T10:47:17.550Z'
---

# API

For ease of search, the following content is sorted alphabetically.

## umi

### createBrowserHistory

Creates a `BrowserHistory` that uses the browser's built-in `history` to track application navigation. It is recommended for use in modern web browsers that support the HTML5 `history` API.

Type definition is as follows:
```ts
function createBrowserHistory(options?: { window?: Window }) => BrowserHistory;
```

Usage example:
```ts
// create a BrowserHistory
import { createBrowserHistory } from 'umi';
const history = createBrowserHistory();
// or a iframe BrowserHistory
import { createBrowserHistory } from 'umi';
const history = createBrowserHistory({
  window: iframe.contentWindow,
});
```
### createHashHistory

`createHashHistory` returns a `HashHistory` instance. The default `window` is the current document's `defaultView`.

The main difference between `HashHistory` and `BrowserHistory` is that `HashHistory` stores the current location in the hash part of the URL, which means it does not send a request to the server when switching routes. If you are hosting your site on a server that you cannot fully control, or in a single-page Electron application, `HashHistory` is recommended.

Usage example:
```ts
// create a HashHistory
import { createHashHistory } from 'umi';
const history = createHashHistory();
```

### createMemoryHistory

`MemoryHistory` is not operated or read from the address bar. It is also very suitable for testing and other rendering environments.

```ts
const history = createMemoryHistory(location)
```

### createSearchParams

A utility function that wraps `new URLSearchParams(init)`, supports creating with arrays and objects

```ts
import { createSearchParams } from 'umi';


// Assuming the path http://a.com?foo=1&bar=2
createSearchParams(location.search);
createSearchParams("foo=1&bar=2");
createSearchParams("?foo=1&bar=2");

// Key-value pair object
createSearchParams({ foo: 'bar', qux: 'qoo'}).toString()
// foo=bar&qux=qoo

// Key-value tuple array
createSearchParams([["foo", "1"], ["bar", "2"]]).toString()
// foo=1&bar=2
```

[URLSearchParams documentation](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams)

### generatePath

Generates the actual route to be accessed using the given path with parameters and the corresponding params.

```ts
import { generatePath } from 'umi';

generatePath("/users/:id", { id: "42" }); // "/users/42"
generatePath("/files/:type/*", {
  type: "img",
  "*": "cat.jpg",
}); // "/files/img/cat.jpg"
```

### Helmet

The Helmet component provided by [react-helmet-async](https://github.com/staylor/react-helmet-async), used to dynamically configure tags in the `head` of the page, such as the `title`.

> Note: To ensure Helmet still works during SSR, be sure to use the Helmet provided by Umi instead of installing react-helmet separately

```tsx
import { Helmet } from 'umi';

export default function Page() {
  return (
    <Helmet>
      <title>Hello World</title>
    </Helmet>
  );
}
```

### history

Operations related to history, used to obtain current route information, execute route jumps, and listen for route changes.

```ts
// Recommended to use useLocation in components or hooks
import { useLocation } from 'umi';
export default function Page() {
  let location = useLocation();
  return (
    <div>
     { location.pathname }
     { location.search }
     { location.hash }
    </div>
  );
}
```

To get the current route information outside of React components and Hooks.

```ts
// location object, contains pathname, search, and hash
window.location.pathname;
window.location.search;
window.location.hash;
```

Imperative route navigation.

```ts
import { history } from 'umi';

// Jump to a specific route
history.push('/list');

// Jump to a specific route with parameters
history.push('/list?a=b&c=d#anchor', state);
history.push({
    pathname: '/list',
    search: '?a=b&c=d',
    hash: 'anchor',
  },
  {
    some: 'state-data',
  }
);

// Jump to the current path and refresh state
history.push({}, state)

// Jump back to the previous route
history.back();
history.go(-1);
```

:::info{title=🚨}
Note: `history.push` and `history.replace` require using `state` as the second parameter passed to these two APIs
:::


Route listening.

```ts
import { history } from 'umi';

const unlisten = history.listen(({ location, action }) => {
  console.log(location.pathname);
});
unlisten();
```

### Link

`<Link>` is a React component, an `<a>` element with routing jump functionality.

Type definition is as follows:

```ts
declare function Link(props: {
  prefetch?: boolean | 'intent' | 'render' | 'viewport' | 'none';
  prefetchTimeout?: number;
  to: string | Partial<{ pathname: string; search: string; hash: string }>;
  replace?: boolean;
  state?: any;
  reloadDocument?: boolean;
}): React.ReactElement;
```

Example:

```tsx
import { Link } from 'umi';

function IndexPage({ user }) {
  return <Link to={user.id}>{user.name}</Link>;
}
```

`<Link to>` supports relative path navigation; `<Link reloadDocument>` does not do routing navigation and is equivalent to the jump behavior of `<a href>`.

If `prefetch` is enabled, then when the user hovers over the component, Umi will automatically start preloading the component js files and data for the routing jump. (Note: Use this feature when `routePrefetch` is enabled)

### matchPath

`matchPath` can match a given path with a known route format and return the match result.

Type definition is as follows:

```ts
declare function matchPath<ParamKey extends string = string>(
  pattern: PathPattern | string,
  pathname: string
): PathMatch<ParamKey> | null;
interface PathMatch<ParamKey extends string = string> {
  params: Params<ParamKey>;
  pathname: string;
  pattern: PathPattern;
}
interface PathPattern {
  path: string;
  caseSensitive?: boolean;
  end?: boolean;
}
```

Example:
```ts
import { matchPath } from 'umi';
const match = matchPath(
  { path: "/users/:id" },
  "/users/123",
);
// {
//   "params": { "id": "123" },
//   "pathname": "/users/123",
//   "pathnameBase": "/users/123",
//   "pattern": { "path": "/users/:id" }
// }
```
### matchRoutes

`matchRoutes` can match a given path with multiple potential route choices and return the match result.

Type definition is as follows:

```ts
declare function matchRoutes(
  routes: RouteObject[],
  location: Partial<Location> | string,
  basename?: string
): RouteMatch[] | null;
interface RouteMatch<ParamKey extends string = string> {
  params: Params<ParamKey>;
  pathname: string;
  route: RouteObject;
}
```

Example:

```ts
import { matchRoutes } from 'umi';
const match = matchRoutes(
  [
    {
      path: "/users/:id",
    },
    {
      path: "/users/:id/posts/:postId",
    },
  ],
  "/users/123/posts/456",
);
// [
//  {
//    "params": {
//      "id": "123",
//       "postId": "456"
//     },
//     "pathname": "/users/123/posts/456",
//     "pathnameBase": "/users/123/posts/456",
//     "route": {
//       "path": "/users/:id/posts/:postId"
//     }
//   }
// ]
```

### NavLink

`<NavLink>` is a special form of `<Link>`, aware of whether it is in an active routing state. Often used in navigation menus, breadcrumbs, Tabs to display the current selection status.

Type definition is as follows:

```ts
declare function NavLink(props: LinkProps & {
  caseSensitive?: boolean;
  children?: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
  className?: string | ((props: { isActive: boolean }) => string | undefined);
  end?: boolean;
  style?: React.CSSProperties | ((props: { isActive: boolean }) => string | React.CSSProperties);
}): React.ReactElement;
```

The examples below use style, className, and children to render the active state.

```ts
import { NavLink } from 'umi';

function Navs() {
  return <ul>
    <li><NavLink to="message" style={({ isActive }) => isActive ? { color: 'red' } : undefined}>Messages</NavLink></li>
    <li><NavLink to="tasks" className={({ isActive }) => isActive ? 'active' : undefined}>Tasks</NavLink></li>
    <li><NavLink to="blog">{({ isActive }) => <span className={isActive ? 'active' : undefined}>Blog</span>}</NavLink></li>
  </ul>;
}
```

### Outlet

`<Outlet>` is used to render child routes within a parent route. If the parent route is an exact match, it will render the index route of the child routes (if any).

Type definition is as follows:

```ts
interface OutletProps {
  context?: unknown;
}
declare function Outlet(
  props: OutletProps
): React.ReactElement | null;
```

Example:

```ts
import { Outlet } from 'umi';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Outlet />
    </div>
  );
}

function DashboardWithContext() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Outlet context={{ prop: 'a' }}/>
    </div>
  );
}
```

The `context` of the `Outlet` component can be retrieved in the child component using the API `useOutletContext`.

### resolvePath

Used to resolve front-end routing jump paths on the client side.

Type definition is as follows:

```ts
declare function resolvePath(
  to: Partial<Location> | string,
  fromPathname?: string
): {
  pathname: string;
  search: string;
  hash: string;
};
```

Example:

```ts
// Same-level relative jump, returns { pathname: '/parent/child', search: '', hash: '' }
resolvePath('child', '/parent');
resolvePath('./child', '/parent');
resolvePath('', '/parent/child');
resolvePath('.', '/parent/child');

// Ancestor level relative jump, returns { pathname: '/parent/sibling', search: '', hash: '' }
resolvePath('../sibling', '/parent/child');
resolvePath('../../parent/sibling', '/other/child');

// Absolute jump, returns { pathname: '/target', search: '', hash: '' }
resolvePath('/target', '/parent');
resolvePath('/target', '/parent/child');

// Jump with search and hash, returns { pathname: '/params', search: '?a=b', hash: '#c' }
resolvePath('/params?a=b#c', '/prev');
```

### terminal

`terminal` is a tool for logging messages from the browser to the node terminal during the development stage.

Example:
```ts
import {terminal} from 'umi';
// The following three commands will print logs in different colors on the umi startup terminal
terminal.log('i am log level');
terminal.warn('i am warn level');
terminal.error('i am error level');
```
Note that `terminal` only takes effect when the environment variable `NODE_ENV` is not `production`; the corresponding log call functions in Umi's build output will not have any effect, so you can leave the calls to `terminal` in your code.

### useAppData

`useAppData` returns global application data.

Type definition is as follows:

```ts
declare function useAppData(): {
  routes: Record<id, Route>;
  routeComponents: Record<id, Promise<React.ReactComponent>>;
  clientRoutes: ClientRoute[];
  pluginManager: any;
  rootElement: string;
  basename: string;
  clientLoaderData: { [routeKey: string]: any };
  preloadRoute: (to: string) => void;
};
```
Note: This API might still be adjusted.

### useLocation

`useLocation` returns the current location object.

Type definition is as follows:

```ts
declare function useLocation(): {
  pathname: string;
  search: string;
  state: unknown;
  key: Key;
};
```

One scenario is to perform some side effect operations when location changes, such as page view statistics.

```ts
import { useLocation } from 'umi';

function App() {
  const location = useLocation();
  React.useEffect(() => {
    ga('send', 'pageview');
  }, [location]);
  // ...
}
```

### useMatch

`useMatch` returns match information for the given path; if no match, it will return `null`

Type definition is as follows:

```ts
declare function useMatch(pattern: {
  path: string;
  caseSensitive?: boolean;
  end?: boolean;
} | string): {
  params: Record<string, string>;
  pathname: string;
  pattern: {
    path: string;
    caseSensitive?: boolean;
    end?: boolean;
  };
};
```

Example:
```tsx
import { useMatch } from 'umi';

// when url = '/events/12'
const match = useMatch('/events/:eventId');
console.log(match?.pathname, match?.params.eventId);
// '/events/12 12'
```

### useNavigate

`useNavigate` hook function returns a function that can control jumping; for example, it can be used after submitting a form to jump to another page.

```ts
declare function useNavigate(): NavigateFunction;

interface NavigateFunction {
  (
    to: To,
    options?: { replace?: boolean; state?: any }
  ): void;
  (delta: number): void;
}
```

Example:

* Jump to path
```ts
import { useNavigate } from 'umi';

let navigate = useNavigate();
navigate("../success", { replace: true });
```

* Go back to the previous page
```ts
import { useNavigate } from 'umi';

let navigate = useNavigate();
navigate(-1);
```

### useOutlet

`useOutlet` returns the child route element currently matched, used internally by the `<Outlet>`.

Type definition is as follows:
```ts
declare function useOutlet(): React.ReactElement | null;
```

Example:
```ts
import { useOutlet } from 'umi';

const Layout = ()=>{
  const outlet = useOutlet()

  return <div className="fancyLayout">
    {outlet}
  </div>
}
```

### useOutletContext

`useOutletContext` is used to return the `context` mounted on the `Outlet` component.

Type definition is as follows:
```ts
declare function useOutletContext<Context = unknown>(): Context;
```

Example:
```ts
import { useOutletContext, Outlet } from 'umi';

const Layout = () => {
  return <div className="fancyLayout">
    <Outlet context={{ prop: 'from Layout'}} />
  </div>
}

const SomeRouteComponentUnderLayout = () => {
  const layoutContext = useOutletContext();

  return JSON.stringify(layoutContext)   // {"prop":"from Layout"}
}
```

### useParams

The `useParams` hook function returns a read-only key-value pair object of dynamic route matching parameters; child routes will inherit dynamic parameters from parent routes.

Type definition is as follows:
```ts
declare function useParams<
  K extends string = string
>(): Readonly<Params<K>>;
```

Example:

```ts
import { useParams } from 'umi';

// Assuming a route configuration user/:uId/repo/:rId
// Current path       user/abc/repo/def
const params = useParams()
/* params
{ uId: 'abc', rId: 'def'}
*/
```

### useResolvedPath

`useResolvedPath` resolves the complete routing information for the target address based on the current path.

Type definition is as follows:
```ts
declare function useResolvedPath(to: To): Path;
```

Example:

```ts
import { useResolvedPath } from 'umi';

const path = useResolvedPath('docs')
/* path
{ pathname: '/a/new/page/docs', search: '', hash: '' }
*/
```

### useRouteData

`useRouteData` returns the route data of the currently matched route.

Type definition is as follows:

```ts
declare function useRouteData(): {
  route: Route;
};
```
Note: This API might still be adjusted.

Example:
```ts
import { useRouteData } from 'umi';

const route = useRouteData();
/* route
{
  route: {
    path: 'a/page',
    id: 'a/page/index',
    parentId: '@@/global-layout',
    file: 'a/page/index.tsx'
  }
}
*/
```

### useRoutes

`useRoutes` is a hook function to render routes, pass in route configuration and optional parameter `location` to get the rendering result; if there is no matched route, the result is `null`.

Type definition is as follows:
```ts
declare function useRoutes(
  routes: RouteObject[],
  location?: Partial<Location> | string;
): React.ReactElement | null;
```

Example:

```ts
import * as React from "react";
import { useRoutes } from "umi";

function App() {
  let element = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
      children: [
        {
          path: "messages",
          element: <DashboardMessages />,
        },
        { path: "tasks", element: <DashboardTasks /> },
      ],
    },
    { path: "team", element: <AboutPage /> },
  ]);

  return element;
}
```

### useRouteProps

Read the props attribute of the current route in the route configuration using this hook. You can use this hook to obtain additional information in the route configuration.

```ts
// .umirc.ts
routes: [
  {
    path: '/',
    custom_key: '1',
  }
]
```

```ts
import { useRouteProps } from 'umi'

export default function Page() {
  const routeProps = useRouteProps()

  // use `routeProps.custom_key`
} 
```

Note: Also applicable to convention-based routing.

### useSelectedRoutes

Used to read all the route information hit by the current path. For example, in a `layout`, it is possible to obtain information on all the subroutes hit, and also to obtain parameters configured in `routes`, which is very useful.

Example:

```tsx
// layouts/index.tsx

import { useSelectedRoutes } from 'umi'

export default function Layout() {
  const routes = useSelectedRoutes()
  const lastRoute = routes.at(-1)

  if (lastRoute?.pathname === '/some/path') {
    return <div>1 : <Outlet /></div>
  }

  if (
