# @umijs/renderer-react

## Changes

- [BREAK CHANGE] 删除路由组件的 `props.params`，从 `props.match.params` 里获取
- 改进 CSR，正确和最小次数的 getInitialProps 调用
- 改进 SSR，精确地把 getInitialProps 的数据给到路由组件
- 支持父路由传 props 给子路由

## 支持父路由传 props 给子路由

```js
function Layout(props) {
  return React.Children.map(props.children, child => {
    return React.cloneElement(child, { foo: 'bar' });
  });
}
```
