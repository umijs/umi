---
id: layout
title: 添加布局
---

umi 约定 layouts/index.js 为整体布局文件。

新建 layouts/index.js 文件，内容如下：

```js
export default function(props) {
  return (
    <div>
      <header>Header</header>
      {
        props.children
      }
      <footer>Footer</footer>
    </div>
  );
}
```

这样就为你的页面新增了一个全局的页头和页尾。

<img src="https://gw.alipayobjects.com/zos/rmsportal/hcRxkhHgEzuzwlwrMCIb.png" width="450" height="414" style="margin-left:0;" />
