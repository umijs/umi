# Convention Routing

In addition to manually defined routing, Umi supports convention-based routing. This is also called file routing. It does not require manually configuring routes. Instead, the file system defines the routing. The routing configuration is derived from directories, files and their naming.

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
];
```

It should be noted that files that follow any of the following patterns will not be registered as routes:

- Files or directories beginning with `.` or `_`
- Type definition files ending in `d.ts`
- Test files ending with `test.ts`, `spec.ts`, `e2e.ts` (applicable to `.js`, `.jsx` and `.tsx` files)
- `components` and `component` directories
- `utils` and `util` directories
- Files not ending in `.js`, `.jsx`, `.ts` or `.tsx`
- Files not containing JSX elements

## Dynamic routing

Per convention, file path components enclosed in `[]` will be dynamically routed.

For example：

- `src/pages/users/[id].tsx` becomes `/users/:id`
- `src/pages/users/[id]/settings.tsx` becomes `/users/:id/settings`

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
routes: [
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

Per convention, file path components enclosed in `[ $]` will be dynamically optional routed.

For example：

- `src/pages/users/[id$].tsx` becomes `/users/:id?`
- `src/pages/users/[id$]/settings.tsx` becomes `/users/:id?/settings`

In a more complete example, given the following file structure:

```bash
.
  └── pages
    └── [post$]
      └── comments.tsx
    └── users
      └── [id$].tsx
    └── index.tsx
```

convention routing will produce the following routing configuration:

```js
routes: [
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/users/:id?', component: '@/pages/users/[id$]' },
  {
    exact: true,
    path: '/:post?/comments',
    component: '@/pages/[post$]/comments',
  },
];
```

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
routes: [
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
routes: [
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

A custom global `layout` could be defined as:

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

## Custom global layout

You may need to use different global layouts for different routes. Umi does not support different configuration files for that case, but you can still render different layouts based on the `props.location.pathname` attribute passed to the exported component in `src/layouts/index.tsx`.

For example, if you want to output a simple layout for `/login`,

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

## 404 routing

Umi will take the contents of `src/pages/404.tsx` for the 404 page. It is expected to return React components.

For example, the following directory structure,

```bash
.
└── pages
    ├── 404.tsx
    ├── index.tsx
    └── users.tsx
```

corresponds to the routing

```js
routes: [
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/users', component: '@/pages/users' },
  { component: '@/pages/404' },
];
```

If a user visits `/foo`, neither `/` nor `/users` will match, which is why the router will fall back to the 404 route and render `src/pages/404.tsx`.

## Routing permissions

Routes can be protected by specifying high-level component wrappers.

For example, `src/pages/user` can define a `wrappers` property:

```js
import React from 'react';

function User() {
  return <>user profile</>;
}

User.wrappers = ['@/wrappers/auth'];

export default User;
```

See below example as content of `src/wrappers/auth`,

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

With the above configuration, user request to `/user` will be validated using the `useAuth` function. If successful, `src/pages/user` gets rendered, otherwise, the user will be redirected to `/login`.

## Extended routing attributes

Umi supports extending routing at the code level by exporting static attributes.

```js
function HomePage() {
  return <h1>Home Page</h1>;
}

HomePage.title = 'Home Page';

export default HomePage;
```

The `title` will be appended to the routing configuration.
