
# 介绍

UmiJS 是一个类 Next.JS 的 react 开发框架。他基于一个约定，即 **pages 目录下的文件即路由，而文件则导出 react  组件**，然后打通从源码到产物的每个阶段，并配以完善的插件体系，让我们能把 umi 的产物部署到各种场景里。

## 他是如何工作的？

不知大家有没有看过这篇文章，[《Compilers are the new frameworks》](https://tomdale.net/2017/09/compilers-are-the-new-frameworks/)，作者认为，“Web 框架正在从运行库转变为编译器”，我深表认同。

之前，工具是编译时的，框架是运行时的，两者互不强依赖，相互独立。但是，我们发现，把两者结合起来会让框架更强大，对使用者也更友好。比如，我在 pages 目录下建立 404.js 的文件，然后他就变成了整个项目的 fallback 路由，这在工具和框架分离的情况下是很难做到的。

<br />
<img src="https://camo.githubusercontent.com/6814f490328a0f65734a4913525987a959fd6253/68747470733a2f2f7368697075736572636f6e74656e742e636f6d2f33616138333237306131363061333263313434366263346134323366613330332f506173746564253230496d616765253230322e706e67" />

这是 umi 的流程，

* 首先，umi 是基于路由的，所以需要有一份路由配置，路由配置哪里来？可以是基于约定的，也可以是基于配置的，看个人喜好，推荐约定式的
* 然后，路由配置会用于生成路由文件，在这里 umi 做了很多复杂的事情，比如开发时按需编译、运行时按需加载、各种性能优化等等，这个路由的部分后面会展开讲下
* 然后，把入口文件交给 webpack 做打包
* 同时，会处理 HTML 的生成（可选）
* 最后是部署，和各种流程对接

举个具体的例子。

文件目录：

```
+ src
  + layouts/index.js
  + pages
    - a.js
    - b.js
    - 404.js
```

这会生成路由配置，

```
{
  component: 'layouts/index.js',
  routes: [
    { path: '/a', exact: true, component: 'pages/a.js' },
    { path: '/b', exact: true, component: 'pages/b.js' },
    { component: 'pages/404.js' },
  ],
}
```

然后生成路由文件，

```js
const routes = {
  component: require('layouts/index.js'),
  routes: [
    { path: '/a', exact: true, component: require('pages/a.js') },
    { path: '/b', exact: true, component: require('pages/b.js') },
    { component: require('pages/404.js') },
  ],
};

export default () =>
  <Router history={window.g_history}>
    { renderRoutes(routes) }
  </Router>
```

## 他和 dva、roadhog 是什么关系？

简单来说，

* roadhog 是基于 webpack 的封装工具，目的是简化 webpack 的配置
* umi 可以简单地理解为 roadhog + 路由，思路类似 next.js/nuxt.js，辅以一套插件机制，目的是通过框架的方式简化 React 开发
* dva 目前是纯粹的数据流，和 umi 以及 roadhog 之间并没有相互的依赖关系，可以分开使用也可以一起使用，个人觉得 [umi + dva 是比较搭的](https://github.com/sorrycc/blog/issues/66)

## 特性

* **开箱即用**，内置 react、react-router 等
* **类 next.js 且[功能完备](/guide/router.html)的路由约定**，同时支持配置的路由方式
* **完善的插件体系**，覆盖从源码到构建产物的每个生命周期
* **高性能**，内置 PWA、以路由为单元的 Code Splitting 等
* **支持静态页面导出**，适配各种环境，比如中台业务、无线业务、[egg](https://github.com/eggjs/egg)、支付宝钱包、云凤蝶等
* **开发启动快**，支持一键开启按需编译、[dll](https://github.com/umijs/umi/tree/master/packages/umi-plugin-dll)、hard-source-webpack-plugin 等
* **一键兼容到 IE9**，基于 [umi-plugin-polyfill](https://github.com/umijs/umi/tree/master/packages/umi-plugin-polyfill)
* **完善的 TypeScript 支持**，包括 d.ts 定义和 umi test
* **与 dva 数据流的深入融合**，支持 duck directory、model 的自动加载、code splitting 等等

## 为什么不是...?

### next.js

next.js 的功能相对比较简单，比如他的路由配置并不支持一些高级的用法，比如布局、嵌套路由、权限路由等等，而这些在企业级的应用中是很常见的。相比 next.js，umi 在约定式路由的功能层面会更像 nuxt.js 一些。

### roadhog

roadhog 是比较纯粹的 webpack 封装工具，作为一个工具，他能做的就比较有限（限于 webpack 层）。而 umi 则等于 roadhog + 路由 + HTML 生成 + 完善的插件机制，所以能在提升开发者效率方面发挥出更大的价值。
