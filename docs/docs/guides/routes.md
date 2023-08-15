import { Message } from 'umi';

# Routing

In Umi applications, which are [single-page applications](https://en.wikipedia.org/wiki/Single-page_application), page navigation occurs on the client-side within the browser. This means that the server isn't re-requested to fetch HTML content, and the HTML is loaded only once during the application initialization. Different pages are composed of various components, and switching between pages involves changing the active component associated with the corresponding route path.

## Route Type Configuration

Please refer to the [history](../api/config#history) configuration.

## Configuring Routes

Routes are configured in the configuration file using the `routes` field, which is an array containing route information.

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

Umi 4 by default splits pages into separate bundles, resulting in faster page loading times. Since the loading process is asynchronous, you often need to create a [`loading.tsx`](./directory-structure#loadingtsxjsx) file to add loading styles and enhance the user experience.

<Message emoji="💡">
You can use Chrome Devtools > Network Tab to simulate a slow network speed. This can help you verify whether loading components are effective when switching routes.
</Message>

### path

* Type: `string`

The `path` supports two types of placeholders. The first type is dynamic parameters in the form of `:id`, and the second type is the `*` wildcard, which can only appear at the end of the route string.

✅ Here are the currently ***supported*** route path configurations:

```txt
/groups
/groups/admin
/users/:id
/users/:id/messages
/files/*
/files/:id/*
```

❌ Here are the currently ***unsupported*** route path configurations:
```txt
/users/:id?
/tweets/:id(\d+)
/files/*/cat.jpg
/files-*
```

### component

* Type: `string`

This field configures the React component path used for rendering when `location` matches `path`. The component path can be either an absolute or relative path. If it's a relative path, it will start searching from `src/pages`.

You can use `@` to reference files within the `src` directory, for example: `component: '@/layouts/basic'`. Using `@` is recommended for organizing your route file locations.

### routes

This field configures child routes and is typically used when you want to associate multiple paths with a layout component.

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

In the global layout `src/layouts/index`, you can use `<Outlet/>` to render child routes:

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

This way, accessing `/list` and `/admin` routes will use the `src/layouts/index` layout component.

### redirect

* Type: `string`

This field configures route redirection.

For example:

```js
export default {
  routes: [
    { path: '/', redirect: '/list' },
    { path: '/list', component: 'list' },
  ],
}
```

Accessing `/` will redirect to `/list`, and the rendering will be handled by the `src/pages/list` file.

### wrappers

* Type: `string[]`

This field configures wrapper components for route components. Wrapper components can add additional functionality to the current route component. For example, they can be used for route-level permission checks:

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

Then, in `src/wrappers/auth`:

```jsx
import { Navigate, Outlet } from 'umi'

export default (props) => {
  const { isLogin } = useAuth();
  if (isLogin) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
}
```

This way, accessing `/user` will go through the `auth` component for permission validation. If validated, the `src/pages/user` component is rendered; otherwise, it redirects to `/login`.

<Message emoji="🚨">
Each component in the `wrappers` array adds a nested route layer to the current route component. If you want to keep the route structure unchanged, it's recommended to use higher-order components. First, implement the logic from the wrapper in the higher-order component, then use the higher-order component to decorate the corresponding route component.
</Message>

For example:

```jsx
// src/hocs/withAuth.tsx
import { Navigate } from 'umi'

const withAuth = (Component) => () => {
  const { isLogin } = useAuth();
  if (isLogin) {
    return <Component />;
  } else {
    return <Navigate to="/login" />;
  }
}
```

```jsx
// src/pages/user.tsx

const TheOldPage = () => {
  // ...
}

export default withAuth(TheOldPage)
```

## Conventional Routing

In addition to configuration-based routing, Umi also supports conventional routing. Conventional routing, also known as file-based routing, eliminates the need for manual configuration. The file system structure directly determines the route configuration.

**If no `routes` configuration is provided, Umi enters conventional routing mode**, analyzing the `src/pages` directory to generate route configurations.

For instance, with the following file structure:

```bash
.
  └── pages
    ├── index.tsx
    └── users.tsx
```

The resulting route configuration would be:

```js
[
  { path: '/', component: '@/pages/index' },
  { path: '/users', component: '@/pages/users' },
]
```

> When using conventional routing, all `(j|t)sx?` files within the `src/pages` directory are considered routes. If you need to modify default conventions, you can use the [conventionRoutes](../api/config#conventionroutes) configuration.

### Dynamic Routes

Directories or files with a `$` prefix are considered dynamic routes. If a parameter name is not specified after `$`, it acts as a `*` wildcard. For example, consider the following directory structure:

For example:

* `src/pages/users/$id.tsx` becomes `/users/:id`
* `src/pages/users/$id/settings.tsx` becomes `/users/:id/settings`

Here's a complete example with the following file structure:

```
+ pages/
  + foo/
    - $slug.tsx
  + $bar/
    - $.tsx
  - index.tsx
```

This

 generates the following route configuration:

```javascript
[
  { path: '/', component: '@/pages/index.tsx' },
  { path: '/foo/:slug', component: '@/pages/foo/$slug.tsx' },
  { path: '/:bar/*', component: '@/pages/$bar/$.tsx' },
];
```

### Global Layout

The `src/layouts/index.tsx` file is considered the global layout route. It should return a React component and use `<Outlet />` to render nested routes.

For example, with the following directory structure:

```bash
.
└── src
    ├── layouts
    │   └── index.tsx
    └── pages
        ├── index.tsx
        └── users.tsx
```

The resulting route configuration is:

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

You can use `layout: false` to selectively disable the **global layout** for a specific route. This option only works for top-level routes:

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
      // 🔴 Not effective; the layout for this route is `/users`, not the global layout
      { layout: false }
    ]
  }
]
```

A custom global `layout` might look like this:

```tsx
import { Outlet } from 'umi'

export default function Layout() {
  return <Outlet />
}
```

### Different Global Layouts

You might want to use different global layouts for different routes. Umi doesn't directly support this configuration, but you can still differentiate layouts based on `location.path` in `src/layouts/index.tsx` and render different layouts accordingly.

For instance, if you want a simple layout for `/login`:

```js
import { useLocation, Outlet } from 'umi';

export default function() {
  const location = useLocation();
  if (location.pathname === '/login') {
    return <SimpleLayout><Outlet /></SimpleLayout>
  }

  // You can use `useAppData` / `useSelectedRoutes` to get more route information
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

The `src/pages/404.tsx` file is considered the 404 page and should return a React component.

For example, with the following directory structure:

```bash
.
└── pages
    ├── 404.tsx
    ├── index.tsx
    └── users.tsx
```

The resulting route configuration is:

```js
[
  { path: '/', component: '@/pages/index' },
  { path: '/users', component: '@/pages/users' },
  { path: '/*', component: '@/pages/404' },
]
```

This way, if you access `/foo`, `/`, and `/users` without matching routes, the fallback route will be the 404 route, which is rendered using the `src/pages/404.tsx` component.

> The 404 route only works with conventional routing. If using configuration-based routing, you need to manually configure a wildcard route for handling 404 cases.

## Page Navigation

For imperative navigation, use the [`history`](../api/api#history) API.

You can also use the [`useNavigate`](../api/api#usenavigate) hook within components.

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

Clicking on "Users Page" will navigate to the `/users` address.

Note:

* `Link` is designed for internal navigation within a single-page application. For external URLs, use the `a` tag.

## Route Component Parameters

Umi 4 uses [react-router@6](https://reactrouter.com/docs/en/v6/api) for route components. Route parameter retrieval is achieved using its hooks.

### Match Information

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

### Location Information

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
It's recommended to use `useLocation` instead of directly accessing `history.location`. The main difference is in the `pathname` part.
`history.location.pathname` provides the full browser pathname, whereas `useLocation().pathname` returns a pathname relative to the project's `base` configuration.

For example: If the project has a `base: '/testbase'` configuration and the current browser address is `https://localhost:8000/testbase/page/apple`:

`history.location.pathname` is `/testbase/page/apple`.

`useLocation().pathname` is `/page/apple`.
</Message>

### Route Dynamic Parameters

[useParams](https://reactrouter.com/docs/en/v6/api#useparams)

```jsx
// Route configuration: /comp/:id
// Current location: /comp/paramId

const params  = useParams();
// params
{
  "id": "paramId"
}
```

### Query Information

[useSearchParams](https://reactrouter.com/docs/en/v6/api#usesearchparams)

```jsx
// Current location: /comp?a=b;
const [searchParams, setSearchParams] = useSearchParams();
searchParams.get('a')  // b
searchParams.toString()  // a=b

setSearchParams({a:'c',d:'e'}) // Location changes to /comp?a=c&d=e
```

For the `searchParams` API, you can [refer to this link](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/searchParams).