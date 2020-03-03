---
translateHelp: true
---

# Convention Routing

In addition to configuration-based routing, Umi also supports contract-based routing. Conventional routing is also called file routing, that is, no manual configuration is needed, the file system is routing, and the routing configuration is analyzed through directories and files and their names.

*If there are no routes configured, Umi will enter the convention routing mode* and then analyze the `src/pages` directory to get the routing configuration.

For example, the following file structure：

```bash
.
  └── pages
    ├── index.tsx
    └── users.tsx
```

Will get the following routing configuration

```js
[
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/users', component: '@/pages/users' },
]
```

It should be noted that files that meet any of the following rules *will not* be registered as routes

* Files with `.` or `_` prefix (file or directory)
* `d.ts` files (document type definitions)
* Files with `test.ts`、`spec.ts`、`e2e.ts` file extensions (applicable to `.js`、`.jsx` and `.tsx`）
* `components` and `component` folders
* `utils` and `util` folders
* Files without extensions `.js`、`.jsx`、`.ts` and `.tsx`
* File content which does not contain JSX elements

## Dynamic routing

`[]` package file or folder for dynamic routing.

such as:

* `src/pages/users/[id].tsx` would become `/users/:id`
* `src/pages/users/[id]/settings.tsx` would become `/users/:id/settings`

For a complete example, such as the following file structure

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

Will generate this routing configuration

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

Not supported at this time.

## Nested routes

Umi in the directory have agreed `_layout.tsx` upon will result in nested route to `_layout.tsx` that directory layout. 
React layout files need to return a component, and by `props.children` rendering sub-assemblies.

For example, the following directory structure

```bash
.
└── pages
    └── users
        ├── _layout.tsx
        ├── index.tsx
        └── list.tsx
```

Will generate this routing configuration

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

Convention `src/layouts/index.tsx` for the global routing. 
React to return a component, and by `props.children` rendering sub-assemblies.

For example, the following directory structure

```bash
.
└── src
    ├── layouts
    │   └── index.tsx
    └── pages
        ├── index.tsx
        └── users.tsx
```

Will generate this routing configuration

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

## Different global layouts

You may need different routes for different output overall layout, Umi does not support such a configuration, but you can still use `src/layouts/index.tsx` and `location.path` to differentiate, rendering different layout.

For example to make `/login` render a simple layout

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

## 404 routing

By convention, use `src/pages/404.tsx` for a 404 page to render as a React component.

For example, the following directory structure

```bash
.
└── pages
    ├── 404.tsx
    ├── index.tsx
    └── users.tsx
```

Will generate this routing configuration

```js
[
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/users', component: '@/pages/users' },
  { component: '@/pages/404' },
]
```

Thus, if access to `/foo`, and `/users` does not match, it will fallback to the 404 route, rendering `src/pages/404.tsx`.

## Extended routing attributes

Support for extending routes at the code level by exporting static attributes.

Example:

```js
function HomePage() {
  return <h1>Home Page</h1>;
}

HomePage.title = 'Home Page';

export default HomePage;
```

Where `title` is appended to the routing configuration.
