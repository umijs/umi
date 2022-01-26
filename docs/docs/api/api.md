# API

为方便查找，以下内容通过字母排序。

## umi

### createBrowserHistory
### createHashHistory
### createMemoryHistory
### createSearchParams
### dynamic

TODO: SUPPORT

### history

和 history 相关的操作，用于获取当前路由信息、执行路由跳转、监听路由变更。

获取当前路由信息。

```js
import { history } from 'umi';

// // history 栈里的实体个数
history.length;

// 当前 history 跳转的 action，有 PUSH、REPLACE 和 POP 三种类型
history.action;

// location 对象，包含 pathname、search 和 hash
history.location.pathname;
history.location.search;
history.location.hash;
```

命令式路由跳转。

```js
import { history } from 'umi';

// 跳转到指定路由
history.push('/list');

// 带参数跳转到指定路由
history.push('/list?a=b');
history.push({
  pathname: '/list',
  query: {
    a: 'b',
  },
});

// 跳转到上一个路由
history.goBack();
```

路由监听。

```js
import { history } from 'umi';

const unlisten = history.listen((location, action) => {
  console.log(location.pathname);
});
unlisten();
```

### Link

`<Link>` 是 React 组件，是带路由跳转功能的 `<a>` 元素。

类型定义如下。

```ts
declare function Link(props: {
  to: string | Partial<{ pathname: string; search: string; hash: string; }>,
  replace?: boolean;
  state?: boolean;
  reloadDocument?: boolean;
}): React.ReactElement;
```

比如：

```js
import { Link } from 'umi';

function IndexPage({ user }) {
  return <Link to={user.id}>{user.name}</Link>;
}
```

`<Link to>` 支持相对路径跳转；`<Link reloadDocument>` 不做路由跳转，等同于 `<a href>` 的跳转行为。

### matchPath
### matchRoutes
### NavLink

`<NavLink>` 是 `<Link>` 的特殊形态，他知道当前是否为路由激活状态。通常在导航菜单、面包屑、Tabs 中会使用，用于显示当前的选中状态。

类型定义如下。

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

```js
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

示例，

```js
import { Outlet } from 'umi';

function Dashboard() {
  return <div><h1>Dashboard</h1><Outlet /></div>;
}
```

### renderClient
### useAppData

`useAppData` 返回全局的应用数据。

类型定义如下。

```ts
declare function useAppData(): {
  routes: Record<id, Route>;
  routeComponents: Record<id, Promise<React.ReactComponent>>;
  clientRoutes: ClientRoute[];
  pluginManager: any;
  rootElement: string;
  basename: string;
};
```

注意：此处 API 可能还会调整。

### useLocation

`useLocation` 返回当前 location 对象。

类型定义如下。

```ts
declare function useLocation(): {
  pathname: string;
  search: string;
  state: unknown;
  key: Key;
};
```

一个场景是在 location change 时做一些 side effect 操作，比如 page view 统计。

```js
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
### useNavigate
### useOutlet

`useOutlet` 返回当前匹配的子路由元素，`<Outlet>` 内部使用的就是此 hook 。

### useParams
### useResolvedPath
### useRouteData
### useRoutes
### useSearchParams
