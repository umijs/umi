# 约定式路由

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
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/users', component: '@/pages/users' },
];
```

需要注意的是，满足以下任意规则的文件不会被注册为路由，

- 以 `.` 或 `_` 开头的文件或目录
- 以 `d.ts` 结尾的类型定义文件
- 以 `test.ts`、`spec.ts`、`e2e.ts` 结尾的测试文件（适用于 `.js`、`.jsx` 和 `.tsx` 文件）
- `components` 和 `component` 目录
- `utils` 和 `util` 目录
- 不是 `.js`、`.jsx`、`.ts` 或 `.tsx` 文件
- 文件内容不包含 JSX 元素

## 动态路由

约定 `[]` 包裹的文件或文件夹为动态路由。

比如：

- `src/pages/users/[id].tsx` 会成为 `/users/:id`
- `src/pages/users/[id]/settings.tsx` 会成为 `/users/:id/settings`

举个完整的例子，比如以下文件结构，

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

会生成路由配置，

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

## 动态可选路由

约定 `[ $]` 包裹的文件或文件夹为动态可选路由。

比如：

- `src/pages/users/[id$].tsx` 会成为 `/users/:id?`
- `src/pages/users/[id$]/settings.tsx` 会成为 `/users/:id?/settings`

举个完整的例子，比如以下文件结构，

```bash
.
  └── pages
    └── [post$]
      └── comments.tsx
    └── users
      └── [id$].tsx
    └── index.tsx
```

会生成路由配置，

```js
[
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/users/:id?', component: '@/pages/users/[id$]' },
  {
    exact: true,
    path: '/:post?/comments',
    component: '@/pages/[post$]/comments',
  },
];
```

## 嵌套路由

Umi 里约定目录下有 `_layout.tsx` 时会生成嵌套路由，以 `_layout.tsx` 为该目录的 layout。layout 文件需要返回一个 React 组件，并通过 `props.children` 渲染子组件。

比如以下目录结构，

```bash
.
└── pages
    └── users
        ├── _layout.tsx
        ├── index.tsx
        └── list.tsx
```

会生成路由，

```js
[
  {
    exact: false,
    path: '/users',
    component: '@/pages/users/_layout',
    routes: [
      { exact: true, path: '/users', component: '@/pages/users/index' },
      { exact: true, path: '/users/list', component: '@/pages/users/list' },
    ],
  },
];
```

## 全局 layout

约定 `src/layouts/index.tsx` 为全局路由。返回一个 React 组件，并通过 `props.children` 渲染子组件。

比如以下目录结构，

```bash
.
└── src
    ├── layouts
    │   └── index.tsx
    └── pages
        ├── index.tsx
        └── users.tsx
```

会生成路由，

```js
[
  {
    exact: false,
    path: '/',
    component: '@/layouts/index',
    routes: [
      { exact: true, path: '/', component: '@/pages/index' },
      { exact: true, path: '/users', component: '@/pages/users' },
    ],
  },
];
```

一个自定义的全局 `layout` 如下：

```tsx
import { IRouteComponentProps } from 'umi';

export default function Layout({
  children,
  location,
  route,
  history,
  match,
}: IRouteComponentProps) {
  return children;
}
```

## 不同的全局 layout

你可能需要针对不同路由输出不同的全局 layout，Umi 不支持这样的配置，但你仍可以在 `src/layouts/index.tsx` 中对 `location.path` 做区分，渲染不同的 layout 。

比如想要针对 `/login` 输出简单布局，

```js
export default function (props) {
  if (props.location.pathname === '/login') {
    return <SimpleLayout>{props.children}</SimpleLayout>;
  }

  return (
    <>
      <Header />
      {props.children}
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
];
```

这样，如果访问 `/foo`，`/` 和 `/users` 都不能匹配，会 fallback 到 404 路由，通过 `src/pages/404.tsx` 进行渲染。

## 权限路由

通过指定高阶组件 `wrappers` 达成效果。

如下，`src/pages/user`：

```js
import React from 'react';

function User() {
  return <>user profile</>;
}

User.wrappers = ['@/wrappers/auth'];

export default User;
```

然后在 `src/wrappers/auth` 中，

```jsx
import { Redirect } from 'umi';

export default (props) => {
  const { isLogin } = useAuth();
  if (isLogin) {
    return <div>{props.children}</div>;
  } else {
    return <Redirect to="/login" />;
  }
};
```

这样，访问 `/user`，就通过 `useAuth` 做权限校验，如果通过，渲染 `src/pages/user`，否则跳转到 `/login`，由 `src/pages/login` 进行渲染。

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
