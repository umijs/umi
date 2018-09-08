---
sidebarDepth: 3
---

# umi-plugin-react

This is a collection of officially packaged plugins with 13 commonly used advanced features.

## Install

```bash
$ yarn add umi-plugin-react --dev
```

## Usage

Configured in `.umirc.js`:

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

## Configuration items

All features are turned off by default and will be enabled if there is a true value.

### dva

* Type: `Object`

Based on [umi-plugin-dva](https://github.com/umijs/umi/tree/master/packages/umi-plugin-dva), see the details at [Use with dva](/guide/with-dva.html)。

Configuration items includes:

* `immer`, Whether to enable [dva-immer](https://github.com/dvajs/dva/tree/master/packages/dva-immer)
* `dynamicImport`, Whether to enable dynamic import, options same as [#dynamicImport](#dynamicImport), and if you configure it in [#dynamicImport](#dynamicImport), the options items will be inherited into dva
* `hmr`, Whether to enable dva hmr

::: warning
If there is a dva dependency in the project, the dependencies in the project are prioritized.
:::

### antd

* Type: `Boolean`

Automatically configure [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) to enable on-demand compilation of antd and antd-mobile, with built-in antd and antd-mobile dependencies, There is no need to manually install in the project.

::: warning
If there is an ant or antd-mobile dependency in the project, the dependencies in the project are prioritized.
:::

### routes

* Type: `Object`

based on [umi-plugin-routes](https://github.com/umijs/umi/tree/master/packages/umi-plugin-routes), used to modify routes in batches.

options include:

* `exclude`, type is `Array(RegExp)`, used to ignore certain routes, such as using dva, usually need to ignore the models, components, services, etc.
* `update`, type is `Function`, for update routes.

### polyfills

* Type: `Array(String)`

Based on [umi-plugin-polyfills](https://github.com/umijs/umi/tree/master/packages/umi-plugin-polyfills), used to add polyfills.

Currently supports configuration of `['ie9']`, `['ie10']` or `['ie11']` for quickly compatibility.

### locale

* Type `Object`

Based on [umi-plugin-locale](https://github.com/umijs/umi/tree/master/packages/umi-plugin-locale) and [react-intl](https://github.com/yahoo/react-intl), used to resolve internationalization.

options include:

* `default`: 'zh-CN', // default zh-CN
* `baseNavigator`: true, // default true, when it is true, will use `navigator.language` overwrite default
* `antd`: true, // use antd, default is true

### library

* Type: `String`

It is possible to switch the underlying library to either preact or react.

### dynamicImport

* Type: `Object`

Implement routing-level code splitting, which specifies which level of on-demand loading is required.

options include:

* `webpackChunkName`, Whether to add a meaningful file name
* `loadingComponent`, Specify the component path at load time
* `level`, specifying the route level to code splitting

### dll

* Type: `Object`

Increase the second startup speed by webpack dll plugin.

options include:

* `include`
* `exclude`

### hardSource

* Type: `Boolean`

Open webpack cache with [hard-source-webpack-plugin](https://github.com/mzgoddard/hard-source-webpack-plugin)， 80% increase in speed of the second start. It is recommended to use non-windows computers. Due to the slowness of large file IO under Windows, it is up to you to decide whether to enable it.

### pwa

* Type `Object`

Enable pwa 。

### hd

* Type `Boolean`

Turn on the HD solution.

### fastClick

* Type `Boolean`

Enable fastClick.

### title

* Type `String` or `Object`

Enable title plugin for set HTML title:

options include:

* `defaultTitle`: 'default tile', // required, when option type is String, will use option as the default title
* `format`: '{parent}{separator}{current}', // default {parent}{separator}{current}, title format
* `separator`: ' - ', // default ' - '

When the title plugin is enabled you can configure the title in the route configuration or in the page component in pages folder.

For example:

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

or

```jsx
/**
 * title: test page
 */
export default () => {
  return <div>testpage</div>;
}
```
