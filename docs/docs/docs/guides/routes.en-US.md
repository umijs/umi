---
order: 3
toc: content
translated_at: '2024-03-17T10:22:52.868Z'
---

# Routing

In Umi applications, which are [single-page applications](https://en.wikipedia.org/wiki/Single-page_application), the navigation between pages is done client-side in the browser without re-fetching the HTML from the server. The HTML is loaded only once during the app initialization. Each page comprises different components, so navigating between pages essentially means toggling between these components. You need to associate different routing paths with their respective components in the configuration.

## Route Configuration Types

Refer to [history](../api/config#history) configuration.

## Configuring Routes

Routes are configured in the configuration file via the `routes` attribute, which is an array of route information.

For example:

```ts
// .umirc.ts
export default {
  routes: [
    { path: '/', component: 'index' },
    { path: '/user', component: 'user' },
  ],
}
```

Umi 4 defaults to page-level code splitting for faster page loads. Since the loading process is asynchronous, you often need to write a [`loading.tsx`](./directory-structure#loadingtsxjsx) to add loading styles to your project, improving the user experience.

:::info{title=💡}
You can set the network to slow in Chrome Devtools > Network tab, then switch routes to check if the loading component works.
:::

### path

* Type: `string`

`path` supports only two types of placeholders: the first is dynamic parameters, in the form of `:id`, and the second is the `*` wildcard, which can only appear at the end of the route string.

✅ The following are currently ***supported*** route path configurations:

```txt
/groups
/groups/admin
/users/:id
/users/:id/messages
/files/*
/files/:id/*
```

❌ The following route path configurations are currently ***not supported***:
```txt
/users/:id?
/tweets/:id(\d+)
/files/*/cat.jpg
/files-*
```

### component

* Type: `string`

Configures the React component path to render when the location and path match. It can be an absolute path or a relative path. If it's a relative path, it will start looking from `src/pages`.

If pointing to a file in the `src` directory, you can use `@`, e.g., `component: '@/layouts/basic'`. It's recommended to use `@` to organize the routing file location.

### routes

Configure sub-routes, usually used when adding a layout component for multiple paths.

For example:

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

In the global layout `src/layouts/index`, use `<Outlet/>` to render sub-routes:

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

This way, accessing `/list` and `/admin` will include the `src/layouts/index` layout component.

### redirect

* Type: `string`

Configure route redirection.

For example:

```js
export default {
  routes: [
    { path: '/', redirect: '/list' },
    { path: '/list', component: 'list' },
  ],
}
```

Accessing `/` will redirect to `/list`, where `src/pages/list` will render the content.

### wrappers

* Type: `string[]`

Configure wrapper components for the route component, adding more features to the current route component.

For example, it can be used for route-level permission verification:

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

Then, in `src/wrappers/auth`,

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

This way, accessing `/user` checks permissions with the `auth` component. If the check passes, `src/pages/user` is rendered; otherwise, it redirects to `/login`.

:::info{title=🚨}
Each component in `wrappers` adds a nested route layer to the current route component. If you want to keep the route structure unchanged, consider using a higher-order component. Implement the logic in the wrapper first, then decorate the corresponding route component with that higher-order component.
:::

Example:

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

### layout

* Type: `boolean`

Configure `layout: false` to individually disable the global layout for a specific route:

```js
// .umirc.ts

export default {
  routes: [
    // Disable the global layout for the login page, allowing you to implement the entire page
    { path: '/login', component: '@/pages/Login', layout: false },
  ],
}
```

Note:

1. The global layout might come from the convention `layouts/index.tsx`, or added by plugins (like the layout plugin in `@umijs/max` that automatically adds menu layouts). When configuring `layout: false`, all layouts are canceled, and the component content occupies the whole page, which is often used for scenarios like login pages.

2. `layout: false` only affects the first-level routes. See more examples in [Global layout](#global-layout).

## Convention-based Routing

Apart from configuration-based routing, Umi also supports convention-based routing. Convention routing, also known as file-based routing, doesn't require manual configuration. The routing configuration is derived from the directory and file names and their naming within the file system.

**If there is no routes configuration, Umi enters convention-based routing mode** and analyzes the `src/pages` directory to obtain routing configurations.

For example, the following file structure:

```bash
.
  └── pages
    ├── index.tsx
    └── users.tsx
```

Will produce the following routing configuration,

```js
[
  { path: '/', component: '@/pages/index' },
  { path: '/users', component: '@/pages/users' },
]
```

> When using convention-based routing, the convention is that all `(j|t)sx?` files under `src/pages` are considered routes. If you need to modify the default rules, you can use the [conventionRoutes](../api/config#conventionroutes) configuration.

### Dynamic Routes

By convention, directories or files prefixed with `$` are dynamic routes. If a parameter name is not specified after `$`, it represents a wildcard `*`. For example, the following directory structure:

* `src/pages/users/$id.tsx` becomes `/users/:id`
* `src/pages/users/$id/settings.tsx` becomes `/users/:id/settings`

A complete example, such as the file structure below,

```
+ pages/
  + foo/
    - $slug.tsx
  + $bar/
    - $.tsx
  - index.tsx
```

Will generate the following route configuration:

```javascript
[
  { path: '/', component: '@/pages/index.tsx' },
  { path: '/foo/:slug', component: '@/pages/foo/$slug.tsx' },
  { path: '/:bar/*', component: '@/pages/$bar/$.tsx' },
];
```

### Global layout

The convention is for `src/layouts/index.tsx` to be the global layout. Return a React component and use `<Outlet />` to render nested routes.

For example, the following directory structure:

```bash
.
└── src
    ├── layouts
    │   └── index.tsx
    └── pages
        ├── index.tsx
        └── users.tsx
```

Will generate the following routes:

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

You can use `layout: false` for fine-grained control to disable the **global layout** for a specific route. This option only takes effect at the first level:

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
        // 🔴 Doesn't take effect, as the layout here is not the global layout but `/users`
        { layout: false }
      ]
    }
  ]
```

A custom global `layout` could look like this:

```tsx
import { Outlet } from 'umi'

export default function Layout() {
  return <Outlet />
}
```

### Different Global Layouts

You might need different global layouts for different routes. Umi does not support this configuration, but you can differentiate `location.path` in `src/layouts/index.tsx` to render different layouts.

For example, for a simple layout on `/login`,

```js
import { useLocation, Outlet } from 'umi';

export default function() {
  const location = useLocation();
  if (location.pathname === '/login') {
    return <SimpleLayout><Outlet /></SimpleLayout>
  }

  // Using `useAppData` / `useSelectedRoutes` for more routing information
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

### 404 Route

The convention is for `src/pages/404.tsx` to be the 404 page. It must return a React component.

For example, the following directory structure,

```bash
.
└── pages
    ├── 404.tsx
    ├── index.tsx
    └── users.tsx
```

Will generate the routes,

```js
[
  { path: '/', component: '@/pages/index' },
  { path: '/users', component: '@/pages/users' },
  { path: '/*', component: '@/pages/404' },
]
```

This way, if you access `/foo`, neither `/` nor `/users` can match, so it will fallback to the 404 route rendered by `src/pages/404.tsx`.

> The 404 page automatically applies in convention-based routing only. If using configuration-based routing, you'll need to manually configure the 404 wildcard route.

## Page Navigation

For imperative navigation, use the [`history`](../api/api#history) API

Within components, you can also use the [`useNavigate`](../api/api#usenavigate) hook

## Link Component

For example:

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

Then, clicking on `Users Page` navigates to the `/users` address.

Note:

* `Link` is used only for internal navigations within a single-page application; use the `a` tag for external navigations.

## Route Component Parameters

Umi 4 uses [react-router@6](https://reactrouter.com/docs/en/v6/api) for routing components, and routing parameters can be accessed using its hooks.

### match Information

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

### location Information

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
It is recommended to use `useLocation` instead of directly accessing `history.location`. The difference is in the `pathname` part.
`history.location.pathname` is the complete browser path; whereas, `useLocation` returns the `pathname` relative to the project's configured `base`.

Example: If the project is configured with `base: '/testbase'`,

Current browser address is `https://localhost:8000/testbase/page/apple`

`history.location.pathname` is `/testbase/page/apple`

`useLocation().pathname` is `/page/apple`
:::

### Dynamic Routing Parameters

[useParams](https://reactrouter.com/docs/en/v6/api#useparams)

```jsx
// Route configuration /comp/:id
// Current location /comp/paramId

const params  = useParams();
// params
{
  "id": "paramId"
}
```

### query Information

[useSearchParams](https://reactrouter.com/docs/en/v6/api#usesearchparams)

```jsx
// Current location /comp?a=b;
const [searchParams, setSearchParams] = useSearchParams();
searchParams.get('a')  // b
searchParams.toString()  // a=b

setSearchParams({a:'c',d:'e'}) // location changes to /comp?a=c&d=e
```

Refer to [searchParams API](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/searchParams) for `searchParams` apis.
