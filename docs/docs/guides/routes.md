import { Message } from 'umi';

# 路由

在 Umi 应用是[单页应用](https://en.wikipedia.org/wiki/Single-page_application)，页面地址的跳转都是在浏览器端完成的，不会重新请求服务端获取 html，html 只在应用初始化时加载一次。所有页面由不同的组件构成，页面的切换其实就是不同组件的切换，你只需要在配置中把不同的路由路径和对应的组件关联上。

## 路由类型配置

请参考 [history](../api/config#history) 配置。

## 配置路由

在配置文件中通过 `routes` 进行配置，格式为路由信息的数组。

比如：

```ts
// .umirc.ts
export default {
  routes: [
    { path: '/', component: 'index' },
    { path: '/user', component: 'user' },
  ],
}
```

Umi 4 默认按页拆包，从而有更快的页面加载速度，由于加载过程是异步的，所以往往你需要编写 [`loading.tsx`](./directory-structure#loadingtsxjsx) 来给项目添加加载样式，提升体验。

<Message emoji="💡">
你可以在 Chrome Devtools > 网络 Tab 中将网络设置成低速，然后切换路由查看加载组件是否生效。
</Message>

### path

* Type: `string`

`path` 只支持两种占位符配置，第一种是动态参数 `:id` 的形式，第二种是 `*` 通配符，通配符只能出现路由字符串的最后。

✅ 以下是目前***支持***的路由路径配置形式：

```txt
/groups
/groups/admin
/users/:id
/users/:id/messages
/files/*
/files/:id/*
```

❌ 以下是目前***不支持***的路由路径配置形式：
```txt
/users/:id?
/tweets/:id(\d+)
/files/*/cat.jpg
/files-*
```

### component

* Type: `string`

配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 `src/pages` 开始寻找。

如果指向 `src` 目录的文件，可以用 `@`，比如 `component: '@/layouts/basic'`，推荐使用 `@` 组织路由文件位置。

### routes

配置子路由，通常在需要为多个路径增加 layout 组件时使用。

比如：

```js
export default {
  routes: [
    { path: '/login', component: 'login' },
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/list', component: 'list' },
        { path: '/admin', component: 'admin' },
      ],
    }, 
  ],
}
```

在全局布局 `src/layouts/index` 中，通过 `<Outlet/>` 来渲染子路由：

```tsx
import { Outlet } from 'umi'

export default function Page() {
  return (
    <div style={{ padding: 20 }}> 
      <Outlet/> 
    </div>
  )
}
```

这样，访问 `/list` 和 `/admin` 就会带上 `src/layouts/index` 这个 layout 组件。

### redirect

* Type: `string`

配置路由跳转。

比如：

```js
export default {
  routes: [
    { path: '/', redirect: '/list' },
    { path: '/list', component: 'list' },
  ],
}
```

访问 `/` 会跳转到 `/list`，并由 `src/pages/list` 文件进行渲染。

### wrappers

* Type: `string[]`

配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。
比如，可以用于路由级别的权限校验：

```js
export default {
  routes: [
    { path: '/user', component: 'user',
      wrappers: [
        '@/wrappers/auth',
      ],
    },
    { path: '/login', component: 'login' },
  ]
}
```

然后在 `src/wrappers/auth` 中，

```jsx
import { Navigate, Outlet } from 'umi'

export default (props) => {
  const { isLogin } = useAuth();
  if (isLogin) {
    return <Outlet />;
  } else{
    return <Navigate to="/login" />;
  }
}
```

这样，访问 `/user`，就通过 `auth` 组件做权限校验，如果通过，渲染 `src/pages/user`，否则跳转到 `/login`。


<Message emoji="🚨">
`wrappers` 中的每个组件会给当前的路由组件增加一层嵌套路由，如果你希望路由结构不发生变化，推荐使用高阶组件。先在高阶组件中实现 wrapper 中的逻辑，然后使用该高阶组件装饰对应的路由组件。
</Message>

举例：

```jsx
// src/hocs/withAuth.tsx
import { Navigate } from 'umi'

const withAuth = (Component) => ()=>{
  const { isLogin } = useAuth();
  if (isLogin) {
    return <Component />;
  } else{
    return <Navigate to="/login" />;
  }
}
```

```jsx
// src/pages/user.tsx

const TheOldPage = ()=>{
  // ...
}

export default withAuth(TheOldPage)
```

## 约定式路由

除配置式路由外，Umi 也支持约定式路由。约定式路由也叫文件路由，就是不需要手写配置，文件系统即路由，通过目录和文件及其命名分析出路由配置。

**如果没有 routes 配置，Umi 会进入约定式路由模式**，然后分析 `src/pages` 目录拿到路由配置。

比如以下文件结构：

```bash
.
  └── pages
    ├── index.tsx
    └── users.tsx
```

会得到以下路由配置，

```js
[
  { path: '/', component: '@/pages/index' },
  { path: '/users', component: '@/pages/users' },
]
```

### 动态路由

约定，带 `$` 前缀的目录或文件为动态路由。若 `$` 后不指定参数名，则代表 `*` 通配，比如以下目录结构：

比如：

* `src/pages/users/$id.tsx` 会成为 `/users/:id`
* `src/pages/users/$id/settings.tsx` 会成为 `/users/:id/settings`

举个完整的例子，比如以下文件结构，

```
+ pages/
  + foo/
    - $slug.tsx
  + $bar/
    - $.tsx
  - index.tsx
```

会生成路由配置如下：

```javascript
[
  { path: '/', component: '@/pages/index.tsx' },
  { path: '/foo/:slug', component: '@/pages/foo/$slug.tsx' },
  { path: '/:bar/*', component: '@/pages/$bar/$.tsx' },
];
```

## layout 布局

### 全局布局

无论是约定还是配置式路由，`layouts/index.tsx` 总是被默认加载为全局布局，当你需要添加全局 layout 时，请优先考虑使用该文件。

注意嵌套子路由使用 `<Outlet />` 展示，一个 layout 的最简实例：

```tsx
// layouts/index.tsx

import { Outlet } from 'umi'

export default function Layout() {
  return <Outlet />
}
```

通过路径判断，可以实现在一个全局布局中分情况展示不同布局：

```js
import { useLocation, Outlet } from 'umi';

export default function() {
  const location = useLocation();
  if (location.pathname === '/login') {
    return <SimpleLayout><Outlet /></SimpleLayout>
  }

  // 使用 `useAppData` / `useSelectedRoutes` 可以获得更多路由信息
  // const { clientRoutes } = useAppData()
  // const routes = useSelectedRoutes()

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
```

### 约定式路由的布局

约定式路由可使用 `layouts/index.tsx` 添加全局布局。

### 配置式路由的布局

配置式路由除了使用 `layouts/index.tsx` 作为全局布局外，还可以：

1. 通过定义 `wrappers` 来实现多层嵌套布局。

2. 通过 `layout: false` 来关闭全局布局。

从而你可以自由组合任意页面的布局，一个实例：

```ts
// .umirc.ts
export default {
  routes: [
    {
      path: '/',
      // 同时展示 全局布局 + 一个 wrappers 布局
      wrappers: ['@/wrappers/index.tsx']
    },
    {
      path: '/login',
      // 不使用全局布局
      layout: false,
      // 使用两个 wrappers 布局，依次嵌套
      wrappers: ['@/wrappers/index.tsx', '@/wrappers/nested.tsx'],
    },
    {
      path: '/parent',
      routes: [
        {
          path: 'sub-route',
          // 🔴 错误的用法
          // 注意 `layout: false` 只对一级路由有效，二级路由的父路由不是全局布局
          layout: false
        }
      ]
    }
  ]
}
```

## 404 路由

### 约定式路由

使用约定式路由时，`src/pages/404.tsx` 默认被加载为找不到路由时的 404 页面。

### 配置式路由

若使用配置式路由，你需要手动在路由配置最后一条添加 fallback 的 404 路由，如：

```ts
// .umirc.ts
export default {
  routes: [
    // other routes ...
    { path: '/*', component: '@/pages/404.tsx' }
  ]
}
```

## 扩展路由属性

### 约定式路由

使用约定式路由时，你可以从路由文件内导出 `routeProps` 来配置更多路由属性：

```tsx
// pages/index.tsx
import { useRouteProps } from 'umi'

export default function Page() {
  const props: typeof routeProps = useRouteProps()
  // props.custom_data
}

export const routeProps = {
  // 禁用全局布局
  layout: false
  // 其他属性
  custom_data: {},
  // ...
}
```

使用 [`useRouteProps`](../api/api#userouteprops) 可以便捷的获取该路由的额外属性。

### 配置式路由

配置式路由直接在 `routes` 内添加更多属性即可：

```ts
// .umirc.ts
export default {
  routes: [
    {
      path: '/',
      // 自定义更多属性
      custom_data: {}
      // other custom route props ...
    }
  ]
}
```

和约定式路由一致，在路由中可使用 [`useRouteProps`](../api/api#userouteprops) 获取该路由的额外属性。

## 页面跳转

命令式跳转请使用 [`history`](../api/api#history) API

组件内还可以使用 [`useNavigate`](../api/api#usenavigate) hook

## Link 组件

比如：

```jsx
import { Link } from 'umi';

export default function Page() {
  return (
    <div>
      <Link to="/users">Users Page</Link>
    </div>
  )
}
```

然后点击 `Users Page` 就会跳转到 `/users` 地址。

注意：

* `Link` 只用于单页应用的内部跳转，如果是外部地址跳转请使用 `a` 标签

## 路由组件参数

Umi 4 使用 [react-router@6](https://reactrouter.com/docs/en/v6/api) 作为路由组件，路由参数的获取使其 hooks。

### match 信息

[useMatch](https://reactrouter.com/docs/en/v6/api#usematch)

```jsx
const match = useMatch('/comp/:id')
// match 
{
  "params": {
    "id": "paramId"
  },
  "pathname": "/comp/paramId/",
  "pathnameBase": "/comp/paramId",
  "pattern": {
    "path": "/comp/:id",
    "caseSensitive": false,
    "end": true
  }
}
```

### location 信息

[useLocation](https://reactrouter.com/docs/en/v6/api#uselocation)

```jsx
const location  = useLocation();
// location
{
  "pathname": "/path/",
  "search": "",
  "hash": "",
  "state": null,
  "key": "default"
}
```

<Message emoji="🚨" type="warning">
推荐使用 `useLocation`, 而不是直接访问 `history.location`. 两者的区别是 `pathname` 的部分。
`history.location.pathname` 是完整的浏览器的路径名；而 `useLocation` 中返回的 `pathname` 是相对项目配置的`base`的路径。

举例：项目如果配置 `base: '/testbase'`, 当前浏览器地址为 `https://localhost:8000/testbase/page/apple`

`history.location.pathname` 为 `/testbase/page/apple`

`useLocation().pathname` 为 `/page/apple`
</Message>

### 路由动态参数

[useParams](https://reactrouter.com/docs/en/v6/api#useparams)

```jsx
// 路由配置 /comp/:id
// 当前 location /comp/paramId

const params  = useParams();
// params
{
  "id": "paramId"
}
```

### query 信息

[useSearchParams](https://reactrouter.com/docs/en/v6/api#usesearchparams)

```jsx
// 当前 location /comp?a=b;
const [searchParams, setSearchParams] = useSearchParams();
searchParams.get('a')  // b
searchParams.toString()  // a=b

setSearchParams({a:'c',d:'e'}) // location 变成 /comp?a=c&d=e
```

`searchParams`的 api [参考](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/searchParams)

