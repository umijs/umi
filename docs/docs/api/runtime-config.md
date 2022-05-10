# 运行时配置

运行时配置和配置的区别在于它跑在浏览器端，而配置则是在构建时完成。因此你可以在运行时配置里写函数、jsx、import 浏览器端的依赖等等，注意不要引入 node 端的依赖。

## 配置方式
约定 `src/app.tsx` 为运行时配置，通过 export 来进行配置。

## 配置项

### patchRoutes(\{ routes \})

修改路由。

```ts
export function patchRoutes({ routes }) {
  for (let key of routes){
    // do something
  }
}
```

注意：
- 在 function 中直接修改 routes 即可，不需要返回
- `umi@4` 相较于 `umi@3`， routes 结构发生了变化


### render(oldRender)
覆写 render。

e.g.
```ts
export function render(oldRender){
  fetch('/api/auth').then(
    auth => {
      if(auth.isLogin) oldRender()
      else{
        history.push('./login');
        oldRender();
      }
    }
  )
}
```
该例子的目的是在渲染之前做权限校验。

### onRouteChange(\{ routes, clientRoutes, location, action \})

在初始加载和路由切换时做一些事情。

比如用于埋点统计
```ts
export function onRouteChange({location}){
  bacon(location.name)
}
```

### rootContainer(container)
修改交给 react-dom 渲染时的根组件。

比如用于在外面包一个 Provider
```ts
export function rootContainer(container) {
  return React.createElement(ThemeProvider, null, container);
}
```

### provider

`umi@4` 提供了5个 provider 供用户使用，按照优先级从低到高的顺序排列分别是
- innerProvider 暂无明确含义
- i18nProvider 用于国际化的 provider
- accessProvider 用于权限的 provider
- dataflowProvider 用于数据流的 provider
- outerProvider 暂无明确含义

另外 rootContainer 的优先级最高。

它们的使用方法同 rootContainer 相同，都用来修改根组件。提供这些不同的接口主要是让开发者能够更加有序且方便的管理自己的 provider ，避免使用 rootContainer 来添加所有的 provider。在使用过程中注意它们的顺序，优先级低的 provider 先执行，同时也会被包裹在最外层。

## 插件提供的运行时配置

Umi 允许插件注册运行时配置，如果你使用的插件有提供运行时配置，可以在该插件的文档中进行查看。

