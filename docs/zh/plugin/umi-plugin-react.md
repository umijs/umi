---
sidebarDepth: 3
---

# umi-plugin-react

这是官方封装的一个插件集，包含 13 个常用的进阶功能。

## 安装

```bash
$ yarn add umi-plugin-react --dev
```

## 使用

在 `.umirc.js` 里配置：

```js
export default {
  plugins: [
    ['umi-plugin-react', {
      dva: {
        immer: true,
      },
      antd: true,
      routes: {
        exclude: [/models\//],
      },
      polyfills: ['ie9'],
      locale: {},
      library: 'react',
      dynamicImport: {
        webpackChunkName: true,
        loadingComponent: './components/Loading.js',
      },
      dll: {
        exclude: [],
      },
      hardSource: true,
      pwa: true,
      hd: true,
      fastClick: true,
      title: 'default title',
    }],
  ],
};
```

## 配置项

所有功能默认关闭，有真值配置才会开启。

### dva

* 类型：`Object`

基于 [umi-plugin-dva](https://github.com/umijs/umi/tree/master/packages/umi-plugin-dva) 实现，功能详见 [和 dva 一起用](/zh/guide/with-dva.html)。

配置项包含：

* `immer`，是否启用 [dva-immer](https://github.com/dvajs/dva/tree/master/packages/dva-immer)
* `dynamicImport`，是否启用按需加载，配置项同 [#dynamicImport](#dynamicImport)，并且如果在 [#dynamicImport](#dynamicImport) 有配置，配置项会继承到 dva 中
* `hmr`，是否启用 dva 的 hmr

::: warning
如果项目中有 dva 依赖，则优先使用项目中的依赖。
:::

### antd

* 类型：`Boolean`

启用后自动配置 [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) 实现 antd 和 antd-mobile 的按需编译，并且内置 antd 和 antd-mobile 依赖，无需手动在项目中安装。

::: warning
如果项目中有 antd 或者 antd-mobile 依赖，则优先使用项目中的依赖。
:::

### routes

* 类型：`Object`

基于 [umi-plugin-routes](https://github.com/umijs/umi/tree/master/packages/umi-plugin-routes) 实现，用于批量修改路由。

配置项包含：

* `exclude`，值为 `Array(RegExp)`，用于忽略某些路由，比如使用 dva 后，通常需要忽略 models、components、services 等目录
* `update`, 值为 `Function`，用于更新路由

### polyfills

* 类型：`Array(String)`

基于 [umi-plugin-polyfills](https://github.com/umijs/umi/tree/master/packages/umi-plugin-polyfills) 实现，用于加各种补丁。

目前支持配置 `['ie9']`、`['ie10']` 或 `['ie11']`，实现一键兼容。

### locale

* 类型：`Object`

基于 [umi-plugin-locale](https://github.com/umijs/umi/tree/master/packages/umi-plugin-locale) 和 [react-intl](https://github.com/yahoo/react-intl) 实现，用于解决 i18n 问题。

配置项包含：

* `default: 'zh-CN'`, // default zh-CN
* `baseNavigator: true`, // default true, when it is true, will use `navigator.language` overwrite default
* `antd: true`, // use antd, default is true

### library

* 类型：`String`

可能切换底层库为 preact 或 react。

### dynamicImport

* 类型：`Object`

实现路由级的动态加载（code splitting），可按需指定哪一级的按需加载。

配置项包含：

* `webpackChunkName`，是否通过 webpackChunkName 实现有意义的异步文件名
* `loadingComponent`，指定加载时的组件路径
* `level`，指定按需加载的路由等级

### dll

* 类型：`Object`

通过 webpack 的 dll 插件预打包一份 dll 文件来达到二次启动提速的目的。

配置项包含：

* `include`
* `exclude`

### hardSource

* 类型：`Boolean`

通过 [hard-source-webpack-plugin](https://github.com/mzgoddard/hard-source-webpack-plugin) 开启 webpack 缓存，二次启动时间减少 80%。推荐非 windows 电脑使用，windows 下由于大文件 IO 比较慢，可自行决定是否启用。

### pwa

* 类型：`Object`

开启 pwa 。

### hd

* 类型：`Boolean`

开启高清方案。

### fastClick

* 类型：`Boolean`

启用 fastClick。

### title

* 类型：`String` 或者 `Object`

开启 title 插件，设置 HTML title：

配置项包含：

* `defaultTitle: '默认标题'`, // 必填，当配置项为 String 时直接配置项作为 defaultTitle
* `format: '{parent}{separator}{current}'`, // default {parent}{separator}{current}, title format
* `separator: ' - '`, // default ' - '

当 title 插件开启后你可以在 routes 配置或者 pages 下的页面组件中配置 title。

比如使用配置式路由的时候如下配置：

```js
// .umirc.js or config/config.js
export default {
  routes: [{
    path: '/testpage',
    component: './testpage',
    title: 'test page',
  }],
}
```

使用约定式路由的时候则直接在页面组件中配置：

```jsx
/**
 * title: test page
 */
export default () => {
  return <div>testpage</div>;
}
```
