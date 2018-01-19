---
id: navigate-between-pages
title: Navigate Between Pages
---

在 umi 里，页面之间跳转有两种方式：声明式和编程式。

## 通过 umi/link 做声明式跳转

```bash
import Link from 'umi/link';

export default () => (
  <Link to="/list">Go to list page</Link>
);
```

## 通过 umi/router 做编程式跳转

```js
import router from 'umi/router';

function goToListPage() {
  router.push('/list');
}
```

## 更多

关于 umi/link 和 umi/router 的更多用法，参考 [API 文档](./api.html)。

