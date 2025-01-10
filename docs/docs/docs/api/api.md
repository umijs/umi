---
order: 1
toc: content
---

# API

为方便查找，以下内容通过字母排序。

## umi

### createBrowserHistory

创建使用浏览器内置 `history` 来跟踪应用的 `BrowserHistory`。推荐在支持 HTML5 `history` 接口的 现代 Web 浏览器中使用。

类型定义如下：
```ts
function createBrowserHistory(options?: { window?: Window }) => BrowserHistory;
```

使用范例：
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

`createHashHistory` 返回一个 `HashHistory` 实例。`window` 默认为当前 `document` 的 `defaultView`。

`HashHistory` 与 `BrowserHistory` 的主要区别在于，`HashHistory` 将当前位置存储在 URL 的哈希部分中，这意味着它在路由切换时不会发送请求到服务器。如果您将站点托管在您无法完全控制服务器上，或者在只提供同单页面的 Electron 应用程序中，推荐使用 `HashHistory`。

使用范例：
```ts
// create a HashHistory
import { createHashHistory } from 'umi';
const history = createHashHistory();
```

### createMemoryHistory

`MemoryHistory` 不会在地址栏被操作或读取。它也非常适合测试和其他的渲染环境。

```ts
const history = createMemoryHistory(location)
```

### createSearchParams

包装 `new URLSearchParams(init)` 的工具函数，支持使用数组和对象创建

```ts
import { createSearchParams } from 'umi';


// 假设路径 http://a.com?foo=1&bar=2
createSearchParams(location.search);
createSearchParams("foo=1&bar=2");
createSearchParams("?foo=1&bar=2");

// 键值对对象
createSearchParams({ foo: 'bar', qux: 'qoo'}).toString()
// foo=bar&qux=qoo

// 键值元组数组
createSearchParams([["foo", "1"], ["bar", "2"]]).toString()
// foo=1&bar=2
```

[URLSearchParams 文档](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams)

### generatePath

使用给定的带参数的 path 和对应的 params 生成实际要访问的路由。

```ts
import { generatePath } from 'umi';

generatePath("/users/:id", { id: "42" }); // "/users/42"
generatePath("/files/:type/*", {
  type: "img",
  "*": "cat.jpg",
}); // "/files/img/cat.jpg"
```

### Helmet

即 [react-helmet-async](https://github.com/staylor/react-helmet-async) 提供的 Helmet 组件，用于在页面中动态配置 `head` 中的标签，例如 `title`。

> 注意：为了确保 SSR 时 Helmet 仍能正常工作，请务必使用 Umi 提供的 Helmet 而不是单独安装 react-helmet

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

和 history 相关的操作，用于获取当前路由信息、执行路由跳转、监听路由变更。

```ts
// 建议组件或 hooks 里用 useLocation 取
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

如果在 React 组件和 Hooks 之外获取当前路由信息。

```ts
// location 对象，包含 pathname、search 和 hash
window.location.pathname;
window.location.search;
window.location.hash;
```

命令式路由跳转。

```ts
import { history } from 'umi';

// 跳转到指定路由
history.push('/list');

// 带参数跳转到指定路由
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

// 跳转当前路径，并刷新 state
history.push({}, state)

// 跳转到上一个路由
history.back();
history.go(-1);
```

:::info{title=🚨}
注意：history.push 和 history.replace 需要使用 `state` 需将 `state` 作为这两个 API 的第二个参数传递
:::


路由监听。

```ts
import { history } from 'umi';

const unlisten = history.listen(({ location, action }) => {
  console.log(location.pathname);
});
unlisten();
```

### Link

`<Link>` 是 React 组件，是带路由跳转功能的 `<a>` 元素。

类型定义如下：

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

示例：

```tsx
import { Link } from 'umi';

function IndexPage({ user }) {
  return <Link to={user.id}>{user.name}</Link>;
}
```

`<Link to>` 支持相对路径跳转；`<Link reloadDocument>` 不做路由跳转，等同于 `<a href>` 的跳转行为。

若开启了 `prefetch` 则当用户将鼠标放到该组件上方时，Umi 就会自动开始进行跳转路由的组件 js 文件和数据预加载。（注：使用此功能请开启 `routePrefetch` 配置）

### matchPath

`matchPath` 可以将给定的路径以及一个已知的路由格式进行匹配，并且返回匹配结果。

类型定义如下：

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

示例：
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

`matchRoutes` 可以将给定的路径以及多个可能的路由选择进行匹配，并且返回匹配结果。

类型定义如下：

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

示例：

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

`<NavLink>` 是 `<Link>` 的特殊形态，他知道当前是否为路由激活状态。通常在导航菜单、面包屑、Tabs 中会使用，用于显示当前的选中状态。

类型定义如下：

```ts
declare function NavLink(props: LinkProps & {
  caseSensitive?: boolean;
  children?: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
  className?: string | ((props: { isActive: boolean }) => string | undefined);
  end?: boolean;
  style?: React.CSSProperties | ((props: { isActive: boolean }) => string | React.CSSProperties);
}): React.ReactElement;
```

下方示例分别用了 style、className 和 children 来渲染 active 状态。

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

`<Outlet>` 用于渲染父路由中渲染子路由。如果父路由被严格匹配，会渲染子路由中的 index 路由（如有）。

类型定义如下：

```ts
interface OutletProps {
  context?: unknown;
}
declare function Outlet(
  props: OutletProps
): React.ReactElement | null;
```

示例：

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

`Outlet` 组件的 `context` 可以使用 API `useOutletContext` 在子组件中获取。

### resolvePath

用于在客户端解析前端路由跳转路径。

类型定义如下：

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

示例：

```ts
// 同级相对跳转，返回 { pathname: '/parent/child', search: '', hash: '' }
resolvePath('child', '/parent');
resolvePath('./child', '/parent');
resolvePath('', '/parent/child');
resolvePath('.', '/parent/child');

// 祖先层级相对跳转，返回 { pathname: '/parent/sibling', search: '', hash: '' }
resolvePath('../sibling', '/parent/child');
resolvePath('../../parent/sibling', '/other/child');

// 绝对跳转，返回 { pathname: '/target', search: '', hash: '' }
resolvePath('/target', '/parent');
resolvePath('/target', '/parent/child');

// 携带 search 和 hash 跳转，返回 { pathname: '/params', search: '?a=b', hash: '#c' }
resolvePath('/params?a=b#c', '/prev');
```

### terminal

`terminal` 用于在开发阶段在浏览器向 node 终端输出日志的工具。

示例：
```ts
import {terminal} from 'umi';
// 下面三条命令会在 umi 启动终端上打出用不同颜色代表的日志
terminal.log('i am log level');
terminal.warn('i am warn level');
terminal.error('i am error level');
```
注意 `terminal` 只在环境变量 `NODE_ENV` 非 `production` 时生效；在 Umi 的构建产物中对应的日志调用函数不会有任何作用，所以可以不必删除调用 `terminal` 的代码。

### useAppData

`useAppData` 返回全局的应用数据。

类型定义如下：

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
注意：此处 API 可能还会调整。

### useLocation

`useLocation` 返回当前 location 对象。

类型定义如下：

```ts
declare function useLocation(): {
  pathname: string;
  search: string;
  state: unknown;
  key: Key;
};
```

一个场景是在 location change 时做一些 side effect 操作，比如 page view 统计。

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

`useMatch` 返回传入 path 的匹配信息；如果匹配失败将返回 `null`

类型定义如下：

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

示例：
```tsx
import { useMatch } from 'umi';

// when url = '/events/12'
const match = useMatch('/events/:eventId');
console.log(match?.pathname, match?.params.eventId);
// '/events/12 12'
```

### useNavigate

`useNavigate` 钩子函数返回一个可以控制跳转的函数；比如可以用在提交完表单后跳转到其他页面。

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

示例：

* 跳转路径
```ts
import { useNavigate } from 'umi';

let navigate = useNavigate();
navigate("../success", { replace: true });
```

* 返回上一页
```ts
import { useNavigate } from 'umi';

let navigate = useNavigate();
navigate(-1);
```

### useOutlet

`useOutlet` 返回当前匹配的子路由元素，`<Outlet>` 内部使用的就是此 hook 。

类型定义如下：
```ts
declare function useOutlet(): React.ReactElement | null;
```

示例：
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

`useOutletContext` 用于返回 `Outlet` 组件上挂载的 `context` 。

类型定义如下：
```ts
declare function useOutletContext<Context = unknown>(): Context;
```

示例：
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

`useParams` 钩子函数返回动态路由的匹配参数键值对对象；子路由中会集成父路由的动态参数。

类型定义如下：
```ts
declare function useParams<
  K extends string = string
>(): Readonly<Params<K>>;
```

示例：

```ts
import { useParams } from 'umi';

// 假设有路由配置  user/:uId/repo/:rId
// 当前路径       user/abc/repo/def
const params = useParams()
/* params
{ uId: 'abc', rId: 'def'}
*/
```

### useResolvedPath

`useResolvedPath` 根据当前路径将目标地址解析出完整的路由信息。

类型定义如下：
```ts
declare function useResolvedPath(to: To): Path;
```

示例：

```ts
import { useResolvedPath } from 'umi';

const path = useResolvedPath('docs')
/* path
{ pathname: '/a/new/page/docs', search: '', hash: '' }
*/
```

### useRouteData

`useRouteData` 返回当前匹配路由的数据的钩子函数。

类型定义如下：

```ts
declare function useRouteData(): {
  route: Route;
};
```
注意：此处 API 可能还会调整。

示例：
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

`useRoutes` 渲染路由的钩子函数，传入路由配置和可选参数 `location`, 即可得到渲染结果；如果没有匹配的路由，结果为 `null`。

类型定义如下：
```ts
declare function useRoutes(
  routes: RouteObject[],
  location?: Partial<Location> | string;
): React.ReactElement | null;
```

示例：

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

读取当前路由在路由配置里的 props 属性，你可以用此 hook 来获取路由配置中的额外信息。

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

注：同样适用于约定式路由。

### useSelectedRoutes

用于读取当前路径命中的所有路由信息。比如在 `layout` 布局中可以获取到当前命中的所有子路由信息，同时可以获取到在 `routes` 配置中的参数，这格外有用。

实例：

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

`useSearchParams` 用于读取和修改当前 URL 的 query string。类似 React 的 `useState`，其返回包含两个值的数组，当前 URL 的 search 参数和用于更新 search 参数的函数。

类型定义如下：

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

示例：
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

`withRouter` 参考 [react-router faq](https://reactrouter.com/docs/en/v6/getting-started/faq#what-happened-to-withrouter-i-need-it) 实现的版本, 仅实现了部分能力, 请参考类型定义按需使用, 建议迁移到 React Hook API。

类型定义如下:

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

示例：
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
