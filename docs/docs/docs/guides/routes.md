---
order: 3
toc: content
---

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

Umi 4 默认按页拆包，从而有更快的页面加载速度，由于加载过程是异步的，所以往往你需要编写 [`loading.tsx`](./directory-structure#loadingtsxjsx) 来给项目添加加载样式，提升用户体验。

:::info{title=💡}
你可以在 Chrome Devtools > 网络 Tab 中将网络设置成低速，然后切换路由查看加载组件是否生效。
:::

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

配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径。如果是相对路径，会从 `src/pages` 开始寻找。

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


:::info{title=🚨}
`wrappers` 中的每个组件会给当前的路由组件增加一层嵌套路由，如果你希望路由结构不发生变化，推荐使用高阶组件。先在高阶组件中实现 wrapper 中的逻辑，然后使用该高阶组件装饰对应的路由组件。
:::

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

> 使用约定式路由时，约定 `src/pages` 下所有的 `(j|t)sx?` 文件即路由。如果你需要修改默认规则，可以使用 [conventionRoutes](../api/config#conventionroutes) 配置。

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

### 全局 layout

约定 `src/layouts/index.tsx` 为全局路由。返回一个 React 组件，并通过 `<Outlet />` 渲染嵌套路由。

如以下目录结构：

```bash
.
└── src
    ├── layouts
    │   └── index.tsx
    └── pages
        ├── index.tsx
        └── users.tsx
```

会生成如下路由：

```js
[
  { 
    path: '/', 
    component: '@/layouts/index',
    routes: [
      { path: '', component: '@/pages/index' },
      { path: 'users', component: '@/pages/users' },
    ],
  },
]
```

可以通过 `layout: false` 来细粒度关闭某个路由的 **全局布局** 显示，该选项只在一级生效：

```ts
  routes: [
    { 
      path: '/', 
      component: './index', 
      // 🟢 
      layout: false 
    },
    {
      path: '/users',
      routes: [
        // 🔴 不生效，此时该路由的 layout 并不是全局布局，而是 `/users`
        { layout: false }
      ]
    }
  ]
```

一个自定义的全局 `layout` 格式如下：

```tsx
import { Outlet } from 'umi'

export default function Layout() {
  return <Outlet />
}
```

### 不同的全局 layout

你可能需要针对不同路由输出不同的全局 layout，Umi 不支持这样的配置，但你仍可以在 `src/layouts/index.tsx` 中对 `location.path` 做区分，渲染不同的 layout 。

比如想要针对 `/login` 输出简单布局，

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

### 404 路由

约定 `src/pages/404.tsx` 为 404 页面，需返回 React 组件。

比如以下目录结构，

```bash
.
└── pages
    ├── 404.tsx
    ├── index.tsx
    └── users.tsx
```

会生成路由，

```js
[
  { path: '/', component: '@/pages/index' },
  { path: '/users', component: '@/pages/users' },
  { path: '/*', component: '@/pages/404' },
]
```

这样，如果访问 `/foo`，则 `/` 和 `/users` 都不能匹配，于是会 fallback 到 404 路由，通过 `src/pages/404.tsx` 进行渲染。

> 404 只有约定式路由会自动生效，如果使用配置式路由，需要自行配置 404 的通配路由。

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

:::warning{title=🚨}
推荐使用 `useLocation`, 而不是直接访问 `history.location`. 两者的区别是 `pathname` 的部分。
`history.location.pathname` 是完整的浏览器的路径名；而 `useLocation` 中返回的 `pathname` 是相对项目配置的`base`的路径。

举例：项目如果配置 `base: '/testbase'`, 

当前浏览器地址为 `https://localhost:8000/testbase/page/apple`

`history.location.pathname` 为 `/testbase/page/apple`

`useLocation().pathname` 为 `/page/apple`
:::

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

