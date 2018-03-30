---
id: config-umi
title: 配置 umi
---

## 如何配置

在 `.umirc.js` 中配置，支持 ES6 语法。

比如：

```js
export default {
  pages: {
    '/index': { context: { title: 'IndexPage' } },
    '/list':  { context: { title: 'ListPage' } },
  },
  context: {
    title: 'Unnamed Page',
  },
  hd: true,
};
```

## 配置项

### pages

配置每个页面的属性。

比如：

```
pages: {
  '/index': { context: { title: 'IndexPage' } },
  '/list':  { document: './list.ejs', context: { title: 'ListPage' } },
},
```

有两个属性：

1. document，指定模板
2. context，指定模板里的变量，比如标题之类的

### context

配置全局 context，会覆盖到每个 pages 里的 context。

### exportStatic

是否导出全部路由为静态页面，默认只输出一个 index.html。

比如：

```
"exportStatic": {}
```

还可以启用 `.html` 后缀。

```
"exportStatic": { htmlSuffix: true },
```

### hd

是否开启高清方案，默认为 `false` 。

### disableServiceWorker

禁用 service worker 缓存，默认开启。

### preact

是否切换到 preact，默认为 `false`。

### loading

指定页面切换时的 loading 效果组件，默认为空组件。格式为字符串，指向 loading 组件所在的文件。

比如：

```js
export default {
  loading: './PageLoadingComponent',
};
```

### plugins

指定插件，格式为数组。

比如：

```
export default {
  plugins: [
    'umi-plugin-dva',
    // 有参数时为数组，数组的第二项是参数，类似 babel 插件
    ['umi-plugin-routes', {
      update() {},
    }],
  ],
};
```

### hashHistory

启用 hash history 的方式。

### outputPath

指定输出路径，默认是 `./dist`。

### singular

启用单数目录，格式为布尔值。

* src/layout/index.js
* src/page
* model（如果有开启 umi-plugin-dva 插件的话）

### disableDynamicImport

禁用 Code Splitting，格式为布尔值。

