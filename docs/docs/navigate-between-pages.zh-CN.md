# 页面跳转

在 umi 里，页面之间跳转有两种方式：声明式和命令式。

## 声明式

通过 Link 使用，通常作为 React 组件使用。

```tsx
import { Link } from 'umi';

export default () => (
  <Link to="/list">Go to list page</Link>
);
```

## 命令式

通过 history 使用，通常在事件处理中被调用。

```js
import { history } from 'umi';

function goToListPage() {
  history.push('/list');
}
```

也可以直接从组件的属性中取得 history

```tsx
export default (props) => (
  <Button onClick={()=>props.history.push('/list');}>Go to list page</Button>
);
```

更多命令式的跳转方法，详见 [api#history](/zh/api#history)。
