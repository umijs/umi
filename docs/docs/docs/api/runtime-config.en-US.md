---
order: 3
toc: content
translated_at: '2024-03-17T10:36:22.270Z'
---

# Runtime Configuration

The difference between runtime configuration and configuration is that it runs on the browser side. Based on this, we can write functions, tsx, import browser dependencies, etc., here. Be careful not to import node dependencies.

## Configuration Method

It is agreed that `src/app.tsx` is for runtime configuration.

## TypeScript Hints

If you want hints while writing the configuration, you can define the configuration through the defineApp method of umi.

```js
import { defineApp } from 'umi';
export default defineApp({
  layout: () => {
    return {
      title: 'umi',
    };
  },
});

// or
import { RuntimeConfig } from 'umi';
export const layout: RuntimeConfig['layout'] = () => {
  return {
    title: 'umi',
  };
};
```

## Configuration Items

> The following configuration items are listed in alphabetical order.

### dva

If you are using dva, you can configure the runtime configuration for the dva plugin, please refer to [Plugin Configuration](../max/dva).

For example:

```ts
export default {
  dva: {
    immer: true,
    extraModels: [],
  },
};
```

#### extraModels

- Type: string[]
- Default: [] Configure additional dva models.

#### immer

- Type: boolean | object
- Default: false Indicates whether to enable immer to facilitate reducer modification.

Note: To be compatible with IE11, configure `{ immer: { enableES5: true }}`.

### Data Flow

If you need to define initialization data, use `getInitialState`, `useModel`, and other [data flow](../max/data-flow) related functions:

1. You can create a `@umijs/max` project with data flow functions, see [Introduction to Umi max](../max/introduce).

2. Or manually enable the plugin that provides the data flow functions:

   ```bash
     pnpm add -D @umijs/plugins
   ```

   ```ts
   // .umirc.ts
   export default {
     plugins: [
       '@umijs/plugins/dist/initial-state',
       '@umijs/plugins/dist/model',
     ],
     initialState: {},
     model: {},
   };
   ```

### getInitialState

- Type: `getInitialState: () => Promise<DataType extends any> | any`

The return value of `getInitialState()` will become the global initial state. For example:

```ts
// src/app.ts
import { fetchInitialData } from "@/services/initial";

export async function getInitialState() {
  const initialData = await fetchInitialData();
  return initialData;
}
```

Now, various plugins and the components you define can directly access this global initial state through `useModel('@@initialState')`, as shown below:

```tsx
import { useModel } from "umi";

export default function Page() {
  const { initialState, loading, error, refresh, setInitialState } =
    useModel("@@initialState");
  return <>{initialState}</>;
}
```

| Object Property | Type | Introduction |
| --- | --- | --- |
| `initialState` | `any` | The return value of the exported `getInitialState()` method |
| `loading` | `boolean` | Whether the `getInitialState()` or `refresh()` method is in progress. The rendering of other parts of the page will be **blocked** before the initial state is obtained for the first time |
| `error` | `Error` | If an error occurs while the exported `getInitialState()` method is running, the error information of the error |
| `refresh` | `() => void` | Re-execute the `getInitialState` method and obtain a new global initial state |
| `setInitialState` | `(state: any) => void` | Manually set the value of `initialState`, and the loading will be set to `false` after manual setting |

### layout

- Type: `RuntimeConfig | ProLayoutProps`

Modify the configuration of the [built-in layout](../max/layout-menu), such as configuring logout, custom navigation exposed rendering areas, etc.

> Note: You need to enable the [layout](../api/config#layout) plugin to use its runtime configuration.

```tsx
import { RuntimeConfig } from 'umi';

export const layout: RuntimeConfig = {
  logout: () => {}, // do something
};
```

For more specific configurations, refer to [Plugin Documentation](../max/layout-menu#runtime-configuration).

### onRouteChange

- type: `(args: { routes: Routes; clientRoutes: Routes; location: Location; action: Action; basename: string; isFirst: boolean }) => void`

Do something during initial loading and route switching.

For example, for doing tracking statistics,

```ts
export function onRouteChange({
  location,
  clientRoutes,
  routes,
  action,
  basename,
  isFirst,
}) {
  bacon(location.pathname);
}
```

For example, for setting the title,

```ts
import { matchRoutes } from 'umi';

export function onRouteChange({ clientRoutes, location }) {
  const route = matchRoutes(clientRoutes, location.pathname)?.pop()?.route;
  if (route) {
    document.title = route.title || '';
  }
}
```

### patchRoutes

- type: `(args: { routes: Routes; routeComponents }) => void`

```ts
export function patchRoutes({ routes, routeComponents }) {
  console.log('patchRoutes', routes, routeComponents);
}
```

- `routes`: A flattened list of routes.

- `routeComponents`: A mapping of routes to their components.

Note: If you need to dynamically update routes, it is recommended to use `patchClientRoutes()`, otherwise you may need to modify both `routes` and `routeComponents`.

### patchClientRoutes

- type: `(args: { routes: Routes; }) => void`

Modify the tree-like route table before it is rendered by react-router, receiving the same content as [useRoutes](https://reactrouter.com/en/main/hooks/use-routes).

For example, add a `/foo` route at the beginning,

```tsx
import Page from '@/extraRoutes/foo';

export function patchClientRoutes({ routes }) {
  routes.unshift({
    path: '/foo',
    element: <Page />,
  });
}
```

For example, add a redirect route at the beginning:

```tsx
import { Navigate } from 'umi';

export const patchClientRoutes = ({ routes }) => {
  routes.unshift({
    path: '/',
    element: <Navigate to="/home" replace />,
  });
};
```

For example, add a nested route:

```tsx
import Page from '@/extraRoutes/foo';

export const patchClientRoutes = ({ routes }) => {
  routes.push({
    path: '/group',
    children: [{
      path: '/group/page',
      element: <Page />,
    }],
  });
};
```

For example, use it in conjunction with the `render` configuration, requesting the server to dynamically update routes based on the response,

```ts
let extraRoutes;

export function patchClientRoutes({ routes }) {
  // Modify routes based on extraRoutes
  patch(routes, extraRoutes);
}

export function render(oldRender) {
  fetch('/api/routes')
    .then((res) => res.json())
    .then((res) => {
      extraRoutes = res.routes;
      oldRender();
    });
}
```

Note:

- Modify routes directly, no need to return

### qiankun

Umi has a built-in `qiankun` plugin to provide microfrontend capabilities, please refer to [Plugin Configuration](../max/micro-frontend).

### render

- Type: `(oldRender: Function)=>void`

Override render.

For example, for doing authorization check before rendering,

```bash
export function render(oldRender) {
  fetch('/api/auth').then(auth => {
    if (auth.isLogin) { oldRender() }
    else {
      location.href = '/login';
      oldRender()
    }
  });
}
```

### request

If you are using `import { request } from 'umi';` to request data, then you can customize middleware, interceptors, error handling adapters, etc., through this configuration. Please refer to [request](../max/request) plugin configuration.

### rootContainer

- Type: `(container: JSX.Element,args: { routes: Routes; plugin; history: History }) => JSX.Element;`

Modify the root component handed over to react-dom for rendering.

For example, to wrap a Provider around the outside,

```js
export function rootContainer(container, args) {
  return React.createElement(ThemeProvider, null, container);
}
```

args include:

- routes, full route configuration
- plugin, runtime plugin mechanism
- history, history instance

## More Configurations

Umi allows plugins to register runtime configurations. If you are using plugins, you will definitely find more runtime configuration items in the plugins.
