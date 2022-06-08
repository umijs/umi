# 运行时配置

运行时配置和配置的区别是他跑在浏览器端，基于此，我们可以在这里写函数、tsx、import 浏览器端依赖等等，注意不要引入 node 依赖。

## 配置方式

约定 `src/app.tsx` 为运行时配置。

## 配置项

> 以下配置项按字母排序。

### dva

如果你使用的 dva，那么支持配置 dva 插件的运行时配置，具体参考[插件配置](../max/dva)。

### getInitialState

定义初始化数据。通常为了提供给内置布局功能和权限相关用户信息，我们需要在应用启动的最初阶段请求一些初始化数据，在 Umi 中，我们内置了插件 `initial-state`，该插件暴露一个运行时配置 `getInitialState`，该配置接收一个方法，你需要通过该方法返回相关数据，例如：

```ts
// src/app.ts(x)
export async function getInitialState() {
  return {
    userName: '用户名',
    userId: '用户 ID',
  };
}
```

### layout

修改[内置布局](../guides/layout-menu)的配置，比如配置退出登陆、自定义导航暴露的渲染区域等。

> 注意：需要开启 [layout](../api/config#layout) 插件，才能使用它的运行时配置。

```js
export const layout = {
  logout: () => {}, // do something
};
```

更多具体配置参考[插件文档](../max/layout-menu#运行时配置)。

### onRouteChange(\{ routes, clientRoutes, location, action \})

在初始加载和路由切换时做一些事情。

比如用于做埋点统计，

```bash
export function onRouteChange({ location, routes, action }) {
  bacon(location.pathname);
}
```

比如用于设置标题，

```bash
export function onRouteChange({ clientRoutes }) {
  if (clientRoutes.length) {
    document.title = clientRoutes[clientRoutes.length - 1].route.title || '';
  }
}
```

### patchRoutes(\{ routes \})

### patchClientRoutes(\{ routes \})

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

### qiankun

Umi 内置了 `qiankun` 插件来提供微前端的能力，具体参考[插件配置](../max/micro-frontend)。

### render(oldRender: `Function`)

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

### request

如果你使用了 `import { request } from 'umi';` 来请求数据，那么你可以通过该配置来自定义中间件、拦截器、错误处理适配等。具体参考 [request](../max/request) 插件配置。

### rootContainer(lastRootContainer, args)

修改交给 react-dom 渲染时的根组件。

比如用于在外面包一个 Provider，

```js
export function rootContainer(container) {
  return React.createElement(ThemeProvider, null, container);
}
```

args 包含：

- routes，全量路由配置
- plugin，运行时插件机制
- history，history 实例

## 更多配置

Umi 允许插件注册运行时配置，如果你使用插件，肯定会在插件里找到更多运行时的配置项。
