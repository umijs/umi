# Runtime Config

The difference between runtime-config and config is execution timing, runtime-config is evaluated while your app running in browser. Therefor, `function`, `jsx`, `import` and other **browser-runnable** snippets can be used.

> `node` exclusive dependencies should not work.

## How to use

As convention, `src/app.tsx` is the place you will put the runtime-config.

## Options

### modifyClientRenderOpts(fn)

Modify the opts of clientRender function.

e.g. Modify the render root element in micro front-end solution.

```js
let isSubApp = false;
export function modifyClientRenderOpts(memo) {
  return {
    ...memo,
    rootElement: isSubApp ? 'sub-root' : memo.rootElement,
  };
}
```

### patchRoutes({ routes })

Modify routing.

For example, prepend a new route `/foo` before all other routes.

```bash
export function patchRoutes({ routes }) {
  routes.unshift({
    path: '/foo',
    exact: true,
    component: require('@/extraRoutes/foo').default,
  });
}
```

For example, work with `render`, modify routes based on API response.

```bash
let extraRoutes;

export function patchRoutes({ routes }) {
  merge(routes, extraRoutes);
}

export function render() {
  fetch('/api/routes').then((res) => { extraRoutes = res.routes })
}
```

Notice：

- Modify `routes` instead of returning a new one

### render(oldRender: Function)

Overwrite `render`.

For example, check authority before rendering

```bash
import { history } from 'umi';

export function render(oldRender) {
  fetch('/api/auth').then(auth => {
    if (auth.isLogin) { oldRender() }
    else { history.push('/login'); }
  });
}
```

### onRouteChange({ routes, matchedRoutes, location, action })

Change something at route initialization/changing phase.

For example, event tracking and analysis:

```bash
export function onRouteChange({ location, routes, action }) {
  bacon(location.pathname);
}
```

For example, setup title:

```bash
export function onRouteChange({ matchedRoutes }) {
  if (matchRoutes.length) {
    document.title = matchedRoutes[matchRoutes.length - 1].route.title || '';
  }
}
```

### rootContainer(LastRootContainer)

Modify root component being passed to `react-dom`.

For example, wrap a `Provider`:

```bash
export function rootContainer(container) {
  return React.createElement(ThemeProvider, null, container);
}
```

## More options

Since `umi` support modifing runtime-config via plugin, which means you may find more runtime-config options with plugins you involved.
