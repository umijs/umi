---
translateHelp: true
---

# Convention Routing


In addition to configuration-based routing, Umi also supports contract-based routing. Conventional routing is also called file routing, that is, no manual configuration is needed, the file system is routing, and the routing configuration is analyzed through directories and files and their names.

**If there is no routes configuration, Umi will enter the conventional routing mode**, and then analyze the `src/pages` directory to get the routing configuration.

For example, the following file structure:

```bash
.
  └── pages
    ├── index.tsx
    └── users.tsx
```

Will get the following routing configuration,

```js
[
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/users', component: '@/pages/users' },
]
```

It should be noted that files that meet any of the following rules will not be registered as routes,

* Files or directories that begin with `.` or` _`
* Type definition file ending with `d.ts`
* Test files ending with `test.ts`,` spec.ts`, `e2e.ts` (for` .js`, `.jsx`, and` .tsx` files)
* `components` and` component` directories
* `utils` and` util` directories
* Not a `.js`,` .jsx`, `.ts` or` .tsx` file
* File content does not contain JSX elements

## Dynamic routing

By convention, the files or folders wrapped by `[]` are dynamically routed.

such as:

* `src/pages/users/[id].tsx` would become `/users/:id`
* `src/pages/users/[id]/settings.tsx` would become `/users/:id/settings`

For a complete example, such as the following file structure,

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

Will generate routing configuration,

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

In Umi, it is agreed that when there is `_layout.tsx` in the directory, a nested route will be generated, and `_layout.tsx` is used as the layout of the directory. The layout file needs to return a React component and render the child components via `props.children`.

For example, the following directory structure,

```bash
.
└── pages
    └── users
        ├── _layout.tsx
        ├── index.tsx
        └── list.tsx
```

Will generate a route,

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

The convention `src/layouts/index.tsx` is a global route. Returns a React component and renders the child components via `props.children`.

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

Will generate a route,

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

You may need to output different global layouts for different routes. Umi does not support such a configuration, but you can still distinguish `location.path` in `src/layouts/index.tsx` and render different layouts.

For example, if you want to output a simple layout for `/login`,

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

The convention `src/pages/404.tsx` is a 404 page, and you need to return a React component.

For example, the following directory structure,

```bash
.
└── pages
    ├── 404.tsx
    ├── index.tsx
    └── users.tsx
```

Will generate a route,

```js
[
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/users', component: '@/pages/users' },
  { component: '@/pages/404' },
]
```

In this way, if you visit `/foo`, neither `/` nor `/users` will match, and fallback to the 404 route will be rendered through `src/pages/404.tsx`.

## Extended routing attributes

Support for extending routes at the code level by exporting static attributes.

such as:

```js
function HomePage() {
  return <h1>Home Page</h1>;
}

HomePage.title = 'Home Page';

export default HomePage;
```

The `title` will be appended to the routing configuration.
