import { Message } from 'umi';

# API

For easy reference, the following content is sorted alphabetically.

## umi

### createBrowserHistory

Create a `BrowserHistory` that uses the browser's built-in `history` to track the application. It's recommended to use this in modern web browsers that support the HTML5 `history` interface.

Type definition:
```ts
function createBrowserHistory(options?: { window?: Window }) => BrowserHistory;
```

Usage example:
```ts
// create a BrowserHistory
import { createBrowserHistory } from 'umi';
const history = createBrowserHistory();
// or an iframe BrowserHistory
import { createBrowserHistory } from 'umi';
const history = createBrowserHistory({
  window: iframe.contentWindow,
});
```

### createHashHistory

`createHashHistory` returns a `HashHistory` instance. The `window` defaults to the `defaultView` of the current `document`.

The main difference between `HashHistory` and `BrowserHistory` is that `HashHistory` stores the current location in the hash portion of the URL, which means it won't send requests to the server when the route changes. If your site is hosted on a server you don't have full control over, or in single-page Electron applications, it's recommended to use `HashHistory`.

Usage example:
```ts
// create a HashHistory
import { createHashHistory } from 'umi';
const history = createHashHistory();
```

### createMemoryHistory

`MemoryHistory` doesn't manipulate or read from the address bar. It's also great for testing and other rendering environments.

```ts
const history = createMemoryHistory(location)
```

### createSearchParams

A utility function that wraps `new URLSearchParams(init)`, supporting arrays and objects for creation.

```ts
import { createSearchParams } from 'umi';


// Assume the path is http://a.com?foo=1&bar=2
createSearchParams(location.search);
createSearchParams("foo=1&bar=2");
createSearchParams("?foo=1&bar=2");

// Key-value object
createSearchParams({ foo: 'bar', qux: 'qoo'}).toString()
// foo=bar&qux=qoo

// Key-value tuple array
createSearchParams([["foo", "1"], ["bar", "2"]]).toString()
// foo=1&bar=2
```

[URLSearchParams documentation](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams)

{
/*

### dynamic

TODO: SUPPORT
*/
}

### generatePath

Generate the actual route to be accessed using the given parameterized path and corresponding params.

```ts
import { generatePath } from 'umi';

generatePath("/users/:id", { id: "42" }); // "/users/42"
generatePath("/files/:type/*", {
  type: "img",
  "*": "cat.jpg",
}); // "/files/img/cat.jpg"
```

### Helmet

The `Helmet` component provided by [react-helmet-async](https://github.com/staylor/react-helmet-async) is used to dynamically configure tags in the `head` section of the page, such as `title`.

> Note: To ensure Helmet works correctly during SSR, be sure to use the Helmet provided by Umi instead of separately installing react-helmet.

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

Operations related to history, used to get current route information, perform route navigation, and listen for route changes.

```ts
// Recommended to use useLocation inside components or hooks
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

If you need to get current route information outside of React components and hooks:

```ts
// location object containing pathname, search, and hash
window.location.pathname;
window.location.search;
window.location.hash;
```

Imperative route navigation:

```ts
import { history } from 'umi';

// Navigate to a specific route
history.push('/list');

// Navigate to a specific route with parameters
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

// Navigate to the current path and refresh state
history.push({}, state)

// Navigate back to the previous route
history.back();
history.go(-1);
```

<Message emoji="🚨">
Note: When using history.push and history.replace, if you need to use `state`, make sure to pass `state` as the second argument to these two APIs.
</Message>


Route listening:

```ts
import { history } from 'umi';

const unlisten = history.listen(({ location, action }) => {
  console.log(location.pathname);
});
unlisten();
```

### Link

The `<Link>` component is a React component that provides routing functionality similar to an `<a>` element.

Type definition:

```ts
declare function Link(props: {
  prefetch?: boolean;
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

The `<Link to>` supports relative path navigation; `<Link reloadDocument>` doesn't perform route navigation and behaves similarly to `<a href>`.

If `prefetch` is enabled, Umi will automatically start preloading the component's JS file and data for the route when the user hovers over the component.

### matchPath

`matchPath` matches the given path with a known route format and returns the matching result.

Type definition:

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

`matchRoutes` matches the given path with multiple possible route selections and returns the matching result.

Type definition:
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

`<NavLink>` is a special form of `<Link>` that knows whether it's in an active route state. It's often used in navigation menus, breadcrumbs, and tabs to indicate the current selection.

Type definition:

```ts
declare function NavLink(props: LinkProps & {
  caseSensitive?: boolean;
  children?: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
  className?: string | ((props: { isActive: boolean }) => string | undefined);
  end?: boolean;
  style?: React.CSSProperties | ((props: { isActive: boolean }) => string | React.CSSProperties);
}): React.ReactElement;
```

Examples using style, className, and children to render the active state:

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

`<Outlet>` is used to render child routes within a parent route. If the parent route is strictly matched, it renders the index route of the child routes if available.

Type definition:

```ts
interface OutletProps {
  context?: unknown;
}
declare function Outlet(
  props: OutletProps
): React.ReactElement | null;
```

Examples:

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

The `context` of the `Outlet` component can be obtained in child components using the `useOutletContext` API.

### resolvePath

Used to resolve front-end route paths on the client side.

Type definition:

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
// Relative navigation at the same level, returns { pathname: '/parent/child', search: '', hash: '' }
resolvePath('child', '/parent');
resolvePath('./child', '/parent');
resolvePath('', '/parent/child');
resolvePath('.', '/parent/child');

// Relative navigation to an ancestor level, returns { pathname: '/parent/sibling', search: '', hash: '' }
resolvePath('../sibling', '/parent/child');
resolvePath('../../parent/sibling', '/other/child');

// Absolute navigation, returns { pathname: '/target', search: '', hash: '' }
resolvePath('/target', '/parent');
resolvePath('/target', '/parent/child');

// Navigation with search and hash, returns { pathname: '/params', search: '?a=b', hash: '#c' }
resolvePath('/params?a=b#c', '/prev');
```

### terminal

`terminal` is a tool for outputting logs from the browser to the node terminal during development.

Example:
```ts
import { terminal } from 'umi';
// The following three commands will print logs to the terminal with different colors representing different log levels
terminal.log('i am log level');
terminal.warn('i am warn level');
terminal.error('i am error level');
```
Note: `terminal` only works when the `NODE_ENV` environment variable is not set to `production`. In Umi's build artifacts, the corresponding log calls will have no effect, so you don't need to remove the `terminal` calls from your code.

### useAppData

`useAppData` returns the global application data.

Type definition:

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
Note: This API might be subject to change.

### useLocation

`useLocation` returns the current location object.

Type definition:
```ts
declare function useLocation(): {
  pathname: string;
  search: string;
  state: unknown;
  key: Key;
};
```

One scenario is to perform side effects when the location changes, such as tracking page views.

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

`useMatch` returns the matching information for the given path; it returns `null` if there's no match.

Type definition:

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

The `useNavigate` hook function returns a function that can be used to control navigation. It can be used, for example, to navigate to a different page after submitting a form.

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

Examples:

* Navigate to a specific path:
```ts
import { useNavigate } from 'umi';

let navigate = useNavigate();
navigate("../success", { replace: true });
```

* Go back to the previous page:
```ts
import { useNavigate } from 'umi';

let navigate = useNavigate();
navigate(-1);
```

### useOutlet

`useOutlet` returns the currently matched child route element. This is what `<Outlet>` internally uses.

Type definition:
```ts
declare function useOutlet(): React.ReactElement | null;
```

Example:
```ts
import { useOutlet } from 'umi';

const Layout = () => {
  const outlet = useOutlet()

  return <div className="fancyLayout">
    {outlet}
  </div>
}
```

### useOutletContext

`useOutletContext` is used to retrieve the `context` attached to the `Outlet` component in child components.

Type definition:
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

`useParams` hook function returns a key-value object of matched dynamic route parameters; child routes inherit parent route's dynamic parameters.

Type definition:
```ts
declare function useParams<
  K extends string = string
>(): Readonly<Params<K>>;
```

Example:

```ts
import { useParams } from 'umi';

// Assuming the route configuration is user/:uId/repo/:rId
// and the current path is user/abc/repo/def
const params = useParams()
/* params
{ uId: 'abc', rId: 'def'}
*/
```

### useResolvedPath

`useResolvedPath` resolves the target route path based on the current path.

Type definition:
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

`useRouteData` is a hook function that returns data of the currently matched route.

Type definition:

```ts
declare function useRouteData(): {
  route: Route;
};
```
Note: This API might be subject to change.

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

`useRoutes` is a hook function to render routes. It takes route configuration and an optional `location` parameter and returns the rendering result. If there are no matched routes, it returns `null`.

Type definition:
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

`useRouteProps` is used to read the `props` property from the route configuration. You can use this hook to access additional information defined in the route configuration.

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

Note: This also works with conventional routes.

### useSelectedRoutes

`useSelectedRoutes` is used to read information about all matched routes for the current path. For example, it can be used in the `layout` component to obtain information about all child routes matched, along with any parameters defined in the `routes` configuration, which can be quite useful.

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

  if (lastRoute?.extraProp) {
    return <div>2 : <Outlet /></div>
  }

  return <Outlet />
}
```

### useSearchParams

`useSearchParams` is used to read and modify the query string of the current URL. Similar to React's `useState`, it returns an array containing two values: the current search parameters and a function to update the search parameters.

Type definition:

```ts
declare function useSearchParams(defaultInit?: URLSearchParamsInit): [
  URLSearchParams,
  (
    nextInit?: URLSearchParamsInit,
    navigateOpts?: : { replace?: boolean; state?: any }
  ) => void
];

type URLSearchParamsInit =
  | string
  | ParamKeyValuePair[]
  | Record<string, string | string[]>
  | URLSearchParams;
```

Example:
```ts
import React from 'react';
import { useSearchParams } from 'umi';

function App() {
  let [searchParams, setSearchParams] = useSearchParams();
  function handleSubmit(event) {
    event.preventDefault();
    setSearchParams(serializeFormQuery(event.target));
  }
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### withRouter

`withRouter` is an implementation of the [react-router faq](https://reactrouter.com/docs/en/v6/getting-started/faq#what-happened-to-withrouter-i-need-it), which only implements part of its capabilities. Please refer to the type definitions for usage details. It's recommended to migrate to React Hook API.

Type definition:

```ts
export interface RouteComponentProps<T = ReturnType<typeof useParams>> {
  history: {
    back: () => void;
    goBack: () => void;
    location: ReturnType<typeof useLocation>;
    push: (url: string, state?: any) => void;
  };
  location: ReturnType<typeof useLocation>;
  match: {
    params: T;
  };
  params: T;
  navigate: ReturnType<typeof useNavigate>;
}
```

Example:
```tsx
import React from 'react';
import { withRouter } from 'umi';

class HelloWorld extends React.Component<any> {
  render() {
    return (
      <div>
        Hello World {this.props.location.pathname}
        <h2>params: {JSON.stringify(this.props.match.params)}</h2>
        <button
          onClick={() => {
            this.props.history.push('/users');
          }}
        >
          To Users
        </button>
      </div>
    );
  }
}

export default withRouter(HelloWorld);
```
