# 在页面间跳转

在 umi 里，页面之间跳转有两种方式：声明式和命令式。

## 声明式

基于 `umi/link`，通常作为 React 组件使用。

```bash
import Link from 'umi/link';

export default () => (
  <Link to="/list">Go to list page</Link>
);
```

## 命令式

基于 `umi/router`，通常在事件处理中被调用。

```js
import router from 'umi/router';

function goToListPage() {
  router.push('/list');
}
```

更多命令式的跳转方法，详见 [api#umi/router](/zh/api/#umi-router)。
