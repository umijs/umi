---
order: 3
toc: content
---
# 运行时配置

运行时配置和配置的区别是他跑在浏览器端，基于此，我们可以在这里写函数、tsx、import 浏览器端依赖等等，注意不要引入 node 依赖。

## 配置方式

约定 `src/app.tsx` 为运行时配置。

## TypeScript 提示

如果你想在写配置时也有提示，可以通过 umi 的 defineApp 方法定义配置。

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

## 配置项

> 以下配置项按字母排序。

### dva

如果你使用的 dva，那么支持配置 dva 插件的运行时配置，具体参考[插件配置](../max/dva)。

比如：

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
- Default: [] 配置额外到 dva model。

#### immer

- Type: boolean | object
- Default: false 表示是否启用 immer 以方便修改 reducer。

注：如需兼容 IE11，需配置 `{ immer: { enableES5: true }}`。

### 数据流

若你需要定义初始化数据，使用 `getInitialState` 、`useModel` 等 [数据流](../max/data-flow) 相关功能：

1. 你可以创建自带数据流功能的 `@umijs/max` 项目，详见 [Umi max 简介](../max/introduce) 。

2. 或者手动开启数据流功能的插件使用该功能：

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

`getInitialState()` 的返回值将成为全局初始状态。例如：

```ts
// src/app.ts
import { fetchInitialData } from "@/services/initial";

export async function getInitialState() {
  const initialData = await fetchInitialData();
  return initialData;
}
```

现在，各种插件和您定义的组件都可以通过 `useModel('@@initialState')` 直接获取到这份全局的初始状态，如下所示：

```tsx
import { useModel } from "umi";

export default function Page() {
  const { initialState, loading, error, refresh, setInitialState } =
    useModel("@@initialState");
  return <>{initialState}</>;
}
```

| 对象属性 | 类型 | 介绍 |
| --- | --- | --- |
| `initialState` | `any` | 导出的 `getInitialState()` 方法的返回值 |
| `loading` | `boolean` | `getInitialState()` 或 `refresh()` 方法是否正在进行中。在首次获取到初始状态前，页面其他部分的渲染都会**被阻止** |
| `error` | `Error` | 如果导出的 `getInitialState()` 方法运行时报错，报错的错误信息 |
| `refresh` | `() => void` | 重新执行 `getInitialState` 方法，并获取新的全局初始状态 |
| `setInitialState` | `(state: any) => void` | 手动设置 `initialState` 的值，手动设置完毕会将 `loading` 置为 `false` |

### layout

- Type: `RuntimeConfig | ProLayoutProps`

修改[内置布局](../max/layout-menu)的配置，比如配置退出登陆、自定义导航暴露的渲染区域等。

> 注意：需要开启 [layout](../api/config#layout) 插件，才能使用它的运行时配置。

```tsx
import { RuntimeConfig } from 'umi';

export const layout: RuntimeConfig = {
  logout: () => {}, // do something
};
```

更多具体配置参考[插件文档](../max/layout-menu#运行时配置)。

### onRouteChange

<HashAnchorCompat from="#onroutechange-routes-clientroutes-location-action-basename-isfirst-" to="#onroutechange"></HashAnchorCompat>

- type: `(args: { routes: Routes; clientRoutes: Routes; location: Location; action: Action; basename: string; isFirst: boolean }) => void`

在初始加载和路由切换时做一些事情。

比如用于做埋点统计，

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

比如用于设置标题，

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

<HashAnchorCompat from="#patchroutes-routes-" to="#patchroutes"></HashAnchorCompat>

- type: `(args: { routes: Routes; routeComponents }) => void`

```ts
export function patchRoutes({ routes, routeComponents }) {
  console.log('patchRoutes', routes, routeComponents);
}
```

- `routes`: 打平的路由列表。

- `routeComponents`: 路由对应的组件映射。

注：如需动态更新路由，建议使用 `patchClientRoutes()` ，否则你可能需要同时修改 `routes` 和 `routeComponents`。

### patchClientRoutes

<HashAnchorCompat from="#patchclientroutes-routes-" to="#patchclientroutes"></HashAnchorCompat>

- type: `(args: { routes: Routes; }) => void`

修改被 react-router 渲染前的树状路由表，接收内容同 [useRoutes](https://reactrouter.com/en/main/hooks/use-routes)。

比如在最前面添加一个 `/foo` 路由，

```tsx
import Page from '@/extraRoutes/foo';

export function patchClientRoutes({ routes }) {
  routes.unshift({
    path: '/foo',
    element: <Page />,
  });
}
```

比如在最前面添加一个重定向路由：

```tsx
import { Navigate } from 'umi';

export const patchClientRoutes = ({ routes }) => {
  routes.unshift({
    path: '/',
    element: <Navigate to="/home" replace />,
  });
};
```

比如添加一个嵌套路由：

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

比如和 `render` 配置配合使用，请求服务端根据响应动态更新路由，

```ts
let extraRoutes;

export function patchClientRoutes({ routes }) {
  // 根据 extraRoutes 对 routes 做一些修改
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

注意：

- 直接修改 routes，不需要返回

### qiankun

Umi 内置了 `qiankun` 插件来提供微前端的能力，具体参考[插件配置](../max/micro-frontend)。

### render

<HashAnchorCompat from="#renderoldrender-function" to="#render"></HashAnchorCompat>

- Type: `(oldRender: Function)=>void`

覆写 render。

比如用于渲染之前做权限校验，

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

如果你使用了 `import { request } from 'umi';` 来请求数据，那么你可以通过该配置来自定义中间件、拦截器、错误处理适配等。具体参考 [request](../max/request) 插件配置。

### rootContainer

<HashAnchorCompat from="#rootcontainerlastrootcontainer-args" to="#rootcontainer"></HashAnchorCompat>

- Type: `(container: JSX.Element,args: { routes: Routes; plugin; history: History }) => JSX.Element;`

修改交给 react-dom 渲染时的根组件。

比如用于在外面包一个 Provider，

```js
export function rootContainer(container, args) {
  return React.createElement(ThemeProvider, null, container);
}
```

args 包含：

- routes，全量路由配置
- plugin，运行时插件机制
- history，history 实例

## 更多配置

Umi 允许插件注册运行时配置，如果你使用插件，肯定会在插件里找到更多运行时的配置项。
