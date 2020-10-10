---
translateHelp: true
---

# @umijs/plugin-helmet


整合 [react-helmet](https://github.com/nfl/react-helmet)，管理 HTML 文档标签（如标题、描述等）。

## 启用方式

默认开启。

## 介绍

包含以下功能，

1. 导出 [react-helmet](https://github.com/nfl/react-helmet#example) API，直接从 umi 中导入
1. 支持[服务端渲染（SSR）](/zh-CN/docs/ssr)

![helmet](https://user-images.githubusercontent.com/13595509/82291009-b8c41580-99da-11ea-8d77-128f59a273e5.png)

## 使用

```js
import React from 'react';
import { Helmet } from 'umi';

const Application = () => {
 return (
    <div className="application">
      <Helmet>
        <meta charSet="utf-8" />
        <title>My Title</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
    </div>
  );
}

export default Application;
```

## FAQ

### 标题闪一下没了

react-helmet 与 umi 中的 title 配置不能同时使用，可以通过配置 `title: false` 关闭默认标题配置

### 内容被编码

可配置 Helmet 组件属性 `encodeSpecialCharacters`，来关闭内容被编码

```jsx
<Helmet encodeSpecialCharacters={false}>
  ...
</Helmet>
```
