---
id: add-404-page
title: 添加 404 页面
---

umi 中约定 pages 目录下的 404.js 为 404 页面，这个文件需要返回 React 组件。比如：

```js
export default () => {
  return (
    <div>404 page</div>
  );
};
```

开发模式下，umi 会添加一个默认的 404 页面，但你仍然可通过精确地访问 `/404` 来验证 404 页面。
