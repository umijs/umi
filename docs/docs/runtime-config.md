---
translateHelp: true
---

# Runtime Config

The difference between runtime configuration and configuration is that he runs on the browser side. Based on this, we can write functions, jsx, import browser-side dependencies, and so on. Be careful not to introduce node dependencies.

## Configuration method

Conventions `src/app.tsx` configured to run time.

## Configuration item

### patchRoutes({ routes })

Modify the route. For example, in the front to add a `/foo` route,

```bash
export function patchRoutes({ routes }) {
  routes.unshift({
    path: '/foo',
    exact: true,
    component: require('@/extraRoutes/foo').default,
  });
}
```

The `render` configuration used in conjunction with a request route server is dynamically updated based on the response

```bash
let extraRoutes;

export function patchRoutes({ routes }) {
  merge(routes, extraRoutes);
}

export function render() {
  fetch('/api/routes').then((res) => { extraRoutes = res.routes })
}
```

Note：

* For direct routes, no need to return

### render(oldRender: Function)

Overwrite render. For example, for permission verification before rendering

```bash
import { history } from 'umi';

export function render(oldRender) {
  fetch('/api/auth').then(auth => {
    if (auth.isLogin) { oldRender() }
    else { history.redirectTo('/login'); }
  });
}
```

### onRouteChange({ routes, matchedRoutes, location, action })

Do something during initial load and route switching. For example, it is used for buried point statistics.

```bash
export function onRouteChange({ location, routes, action }) {
  bacon(location.pathname);
}
```

Such as for setting the title

```bash
export function onRouteChange({ matchedRoutes }) {
  if (matchRoutes.length) {
    document.title = matchedRoutes[matchRoutes.length - 1].route.title || '';
  }
}
```

### rootContainer(LastRootContainer)

Modify the root component to render to react-dom. For example, to bread a Provider

```bash
export function rootContainer(container) {
  return React.createElement(ThemeProvider, null, container);
}
```

## More configuration items

Umi allows plugins to register runtime configuration. If you use plugins, you will definitely find more runtime configuration items in the plugin.
