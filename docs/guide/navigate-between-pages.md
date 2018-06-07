# 在页面间跳转

在 umi 里，页面之间跳转有两种方式：声明式和命令式。

## 声明式

基于 `umi/link`。

```bash
import Link from 'umi/link';

export default () => (
  <Link to="/list">Go to list page</Link>
);
```

## 命令式

基于 `umi/router`。

```js
import router from 'umi/router';

function goToListPage() {
  router.push('/list');
}
```
