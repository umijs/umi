# 添加 404 页面

umi 中约定 pages 目录下的 404.js 为 404 页面，这个文件需要返回 React 组件。比如：

```js
export default () => {
  return (
    <div>404 page</div>
  );
};
```

开发模式下，umi 会添加一个默认的 404 页面，但你仍可通过精确地访问 `/404` 来验证 404 页面。

**404页面布局**

如果对于`404`页面有不同的布局需求，可以在`layouts/index.js`通过`props.isPathnameMatched`属性来确认用户当前访问的地址是否一个已存在的路由，如下：

```javascript
export default function(props) {

  if (!props.isPathnameMatched) { // 404专属布局
    return <NotFoundLayout>{ props.children }</NotFoundLayout>
  }

  if (props.location.pathname === '/login') {
    return <SimpleLayout>{ props.children }</SimpleLayout>
  }
  return (
    <>
      <Header />
      { props.children }
      <Footer />
    </>
  );
}
```