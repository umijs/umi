---
id: config-umi
title: 配置 umi
---

在 `config.js` 中配置，支持 ES6 语法。

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
### context
### hd
是否开启高清方案，默认为 `false` 。

### preact
是否启用 preact，默认为 `true`，`false` 时切换到 React@16 。

### loading
指定页面切换时的 loading 效果组件，默认为空组件。格式为字符串，指向 loading 组件所在的文件。
比如：

```javascript
export default {
  loading: './PageLoadingComponent',
};
```

