---
id: navigate-between-pages
title: 在页面间跳转
---

## 跳转的两种方式

在 umi 里，页面之间跳转有两种方式：声明式和命令式。

### 声明式

基于 `umi/link`。

```bash
import Link from 'umi/link';

export default () => (
  <Link to="/list">Go to list page</Link>
);
```

### 命令式

基于 `umi/router`。

```js
import router from 'umi/router';

function goToListPage() {
  router.push('/list');
}
```

### 更多

关于 umi/link 和 umi/router 的更多用法，参考 [API 文档](./api.html)。


## 实践

继续之前的例子，我们新增一个 list 页面，新建 pages/list.js，并填入：

```js
import router from 'umi/router';

export default () => {
  return (
    <div>
      ListPage
      <br />
      <button onClick={() => { router.goBack(); }}>go back</button>
    </div>
  );
}
```

然后修改 pages/index.js，编辑：

```js
import Link from 'umi/link';

export default () => {
  return (
    <div>
      ListPage
      <br />
      <Link to="/list"><button>go to /list</button></Link>
    </div>
  );
}
```

这样就实现了两个页面之间的跳转，效果：

<img src="https://gw.alipayobjects.com/zos/rmsportal/kCxjVDAjcfbzFfaGFQsy.gif" style="margin-left:0;" />
