# 运行时配置

运行时配置和配置的区别是他跑在浏览器端，基于此，我们可以在这里写函数、jsx、import 浏览器端依赖等等，注意不要引入 node 依赖。

## 配置方式

约定 `src/app.tsx` 为运行时配置。

## 配置项

### modifyClientRenderOpts(fn)

修改 clientRender 参数。

比如在微前端里动态修改渲染根节点：

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

修改路由。

比如在最前面添加一个 `/foo` 路由，

```bash
export function patchRoutes({ routes }) {
  routes.unshift({
    path: '/foo',
    exact: true,
    component: require('@/extraRoutes/foo').default,
  });
}
```

比如和 `render` 配置配合使用，请求服务端根据响应动态更新路由，

```bash
let extraRoutes;

export function patchRoutes({ routes }) {
  merge(routes, extraRoutes);
}

export function render(oldRender) {
  fetch('/api/routes').then(res=>res.json()).then((res) => {
    extraRoutes = res.routes;
    oldRender();
  })
}
```

注意：

- 直接修改 routes，不需要返回

### render(oldRender: Function)

覆写 render。

比如用于渲染之前做权限校验，

```bash
import { history } from 'umi';

export function render(oldRender) {
  fetch('/api/auth').then(auth => {
    if (auth.isLogin) { oldRender() }
    else {
      history.push('/login');
      oldRender()
    }
  });
}
```

### onRouteChange({ routes, matchedRoutes, location, action })

在初始加载和路由切换时做一些事情。

比如用于做埋点统计，

```bash
export function onRouteChange({ location, routes, action }) {
  bacon(location.pathname);
}
```

比如用于设置标题，

```bash
export function onRouteChange({ matchedRoutes }) {
  if (matchedRoutes.length) {
    document.title = matchedRoutes[matchedRoutes.length - 1].route.title || '';
  }
}
```

### rootContainer(LastRootContainer, args)

修改交给 react-dom 渲染时的根组件。

比如用于在外面包一个 Provider，

```bash
export function rootContainer(container) {
  return React.createElement(ThemeProvider, null, container);
}
```

args 包含：

- routes，全量路由配置
- plugin，运行时插件机制
- history，history 实例

## 更多配置项

Umi 允许插件注册运行时配置，如果你使用插件，肯定会在插件里找到更多运行时的配置项。
