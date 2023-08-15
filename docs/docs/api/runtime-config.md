# Runtime Configuration

The difference between runtime configuration and regular configuration is that runtime configuration runs on the browser side. Based on this, you can write functions, TypeScript JSX, and import browser-specific dependencies. Be cautious not to include Node.js dependencies.

## Configuration Approach

Conventionally, `src/app.tsx` is used for runtime configuration.

## TypeScript Suggestions

If you want to have suggestions while writing configurations, you can define configurations using Umi's `defineApp` method.

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

If you are using dva, you can configure the runtime options for dva plugins. Refer to the [Plugin Configuration](../max/dva) for more details.

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
- Default: false Indicates whether to enable immer for easier reducer modification.

Note: To maintain compatibility with IE11, configure `{ immer: { enableES5: true }}`.

### Data Flow

If you need to define initial data or use features like `getInitialState` and `useModel` in [Data Flow](../max/data-flow):

1. You can create an `@umijs/max` project with built-in data flow functionality. Refer to [Umi Max Introduction](../max/introduce) for more details.

2. Alternatively, you can manually enable data flow functionality using plugins:

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

### layout

Modify the configuration of the [built-in layout](../max/layout-menu), such as configuring logout, customizing the rendered area exposed by navigation, and more.

> Note: You need to enable the [layout](../api/config#layout) plugin to use its runtime configuration.

```js
export const layout = {
  logout: () => {}, // do something
};
```

For more specific configurations, refer to the [Plugin Documentation](../max/layout-menu#runtime-configuration).

### onRouteChange(\{ routes, clientRoutes, location, action, basename, isFirst \})

Perform actions when initially loading or changing routes.

For example, use it for tracking analytics:

```ts
export function onRouteChange({
  location,
  clientRoutes,
  routes,
  action,
  basename,
  isFirst,
}) {
  trackAnalytics(location.pathname);
}
```

Use it to set titles:

```ts
import { matchRoutes } from 'umi';

export function onRouteChange({ clientRoutes, location }) {
  const route = matchRoutes(clientRoutes, location.pathname)?.pop()?.route;
  if (route) {
    document.title = route.title || '';
  }
}
```

### patchRoutes(\{ routes \})

```ts
export function patchRoutes({ routes, routeComponents }) {
  console.log('patchRoutes', routes, routeComponents);
}
```

- `routes`: Flattened route list.

- `routeComponents`: Mapping of routes to components.

Note: If you need to dynamically update routes, it is recommended to use `patchClientRoutes()`, otherwise you may need to modify both `routes` and `routeComponents` simultaneously.

### patchClientRoutes(\{ routes \})

Modify the tree-shaped routing table before it is rendered by react-router. Receives content similar to [useRoutes](https://reactrouter.com/en/main/hooks/use-routes).

For example, add a `/foo` route at the beginning:

```tsx
import Page from '@/extraRoutes/foo';

export function patchClientRoutes({ routes }) {
  routes.unshift({
    path: '/foo',
    element: <Page />,
  });
}
```

Add a redirect route at the beginning:

```tsx
import { Navigate } from 'umi';

export const patchClientRoutes = ({ routes }) => {
  routes.unshift({
    path: '/',
    element: <Navigate to="/home" replace />,
  });
};
```

Add a nested route:

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

Use in conjunction with the `render` configuration to dynamically update routes based on server responses:

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

- Directly modify `routes` without needing to return anything.

### qiankun

Umi comes with a built-in `qiankun` plugin to provide micro-frontends capabilities. Refer to [Plugin Configuration](../max/micro-frontend) for more details.

### render(oldRender: `Function`)

Override the `render` function.

For example, use it to perform permission checks before rendering:

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

If you use `import { request } from 'umi';` to make data requests, you can use this configuration to customize middleware, interceptors, error handling, and more. Refer to the [request](../max/request) plugin configuration for more details.

### rootContainer(lastRootContainer, args)

Modify the root component handed over to react-dom for rendering.

For example, use it to wrap a Provider around the container:

```js
export function rootContainer(container) {
  return React.createElement(ThemeProvider, null, container);
}
```

`args` contains:

- `routes`: The full route configuration
- `plugin`: Runtime plugin mechanism
- `history`: History instance

## More configuration

Umi allows plugins to register runtime configuration. If you use plugins, you will definitely find more runtime configuration items in the plugin.
