# 按需加载

出于性能的考虑，我们会对模块和组件进行按需加载。

## 按需加载组件

通过 `umi/dynamic` 接口实现，比如：

```js
import dynamic from 'umi/dynamic';

const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));
const App = dynamic({
  loader: async function() {
    await delay(/* 1s */1000);
    return () => <div>I will render after 1s</div>;
  },
});
```

## 按需加载模块

通过 `import()` 实现，比如：

```js
import('g2').then(() => {
  // do something with g2
});
```
