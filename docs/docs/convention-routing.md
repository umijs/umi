---
translateHelp: true
---

# Convention Routing

In addition to manually defined routing, Umi supports convention-based routing. This is also called file routing. It does not require manually configuring routes. Instead, the file system defines the routing. The routing configuration is derived from directories, files and their naming.

**如果没有 routes 配置，Umi 会进入约定式路由模式**，然后分析 `src/pages` 目录拿到路由配置。
**If there is no manual routing configuration file, Umi will fall back to the conventional routing mode**, analyzing the `src/pages` directory to discover the routing configuration.

Consider the following file structure:

```bash
.
  └── pages
    ├── index.tsx
    └── users.tsx
```

You will get the following routing configuration,

```js
[
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/users', component: '@/pages/users' },
]
```

It should be noted that files that follow any of the following patterns will not be registered as routes:

* Files or directories beginning with `.` or `_`
* Type definition files ending in `d.ts`
* Test files ending with `test.ts`, `spec.ts`, `e2e.ts` (applicable to `.js`, `.jsx` and `.tsx` files)
* `components` and `component` directories
* `utils` and `util` directories
* Files not ending in `.js`, `.jsx`, `.ts` or `.tsx`
* Files not containing JSX elements

## Dynamic routing

Per convention, file path components enclosed in `[]` will be dynamically routed.

For example：

* `src/pages/users/[id].tsx` becomes `/users/:id`
* `src/pages/users/[id]/settings.tsx` becomes `/users/:id/settings`

In a more complete example, given the following file structure:

```bash
.
  └── pages
    └── [post]
      ├── index.tsx
      └── comments.tsx
    └── users
      └── [id].tsx
    └── index.tsx
```

convention routing will produce the following routing configuration:

```js
[
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/users/:id', component: '@/pages/users/[id]' },
  { exact: true, path: '/:post/', component: '@/pages/[post]/index' },
  {
    exact: true,
    path: '/:post/comments',
    component: '@/pages/[post]/comments',
  },
];
```

## Dynamic optional routing

Not currently supported.

## Nested routing

It is agreed in Umi that if there is `_layout.tsx` in the directory, a nested route will be generated, with `_layout.tsx` as the layout of the directory. The layout file needs to return a React component and render the child components through `props.children`.

For example, the following directory structure

```bash
.
└── pages
    └── users
        ├── _layout.tsx
        ├── index.tsx
        └── list.tsx
```

will result in the following routing:

```js
[
  { exact: false, path: '/users', component: '@/pages/users/_layout',
    routes: [
      { exact: true, path: '/users', component: '@/pages/users/index' },
      { exact: true, path: '/users/list', component: '@/pages/users/list' },
    ]
  }
]
```

## Global layout

The file `src/layouts/index.tsx` is used for the global route. It should return a React component that renders child components passed in `props.children`.

For example, the following directory structure,

```bash
.
└── src
    ├── layouts
    │   └── index.tsx
    └── pages
        ├── index.tsx
        └── users.tsx
```

will result in the following routing:

```js
[
  { exact: false, path: '/', component: '@/layouts/index',
    routes: [
      { exact: true, path: '/', component: '@/pages/index' },
      { exact: true, path: '/users', component: '@/pages/users' },
    ],
  },
]
```

A custom global `layout` could be defined as:

```tsx
import { IRouteComponentProps } from 'umi'

export default function Layout({ children, location, route, history, match }: IRouteComponentProps) {
  return children
}
```

## 不同的全局 layout

你可能需要针对不同路由输出不同的全局 layout，Umi 不支持这样的配置，但你仍可以在 `src/layouts/index.tsx` 中对 `location.path` 做区分，渲染不同的 layout 。

比如想要针对 `/login` 输出简单布局，

```js
export default function(props) {
  if (props.location.pathname === '/login') {
    return <SimpleLayout>{ props.children }</SimpleLayout>
  }

  return (
    <>
      <Header />
      { props.children }
      <Footer />
    </>
  );
}
```

## 404 路由

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
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/users', component: '@/pages/users' },
  { component: '@/pages/404' },
]
```

这样，如果访问 `/foo`，`/` 和 `/users` 都不能匹配，会 fallback 到 404 路由，通过 `src/pages/404.tsx` 进行渲染。

## PrivateRoute

By specify `wrappers` property in page component.

For example, `src/pages/user`：

```js
import React from 'react'

function User() {
  return <>user profile</>
}

User.wrappers = ['@/wrappers/auth']

export default User

```

See below example as content of  `src/wrappers/auth`,

```jsx
import { Redirect } from 'umi'

export default (props) => {
  const { isLogin } = useAuth();
  if (isLogin) {
    return <div>{ props.children }</div>;
  } else {
    return <Redirect to="/login" />;
  }
}
```

With above configuration, user request of `/user` will be validated via `useAuth`. `src/pages/user` gets rendered or page redirected to `/login`.

## 扩展路由属性

支持在代码层通过导出静态属性的方式扩展路由。

比如：

```js
function HomePage() {
  return <h1>Home Page</h1>;
}

HomePage.title = 'Home Page';

export default HomePage;
```

其中的 `title` 会附加到路由配置中。
