# 按需加载

## 启用按需加载

为了简化部署成本，按需加载功能默认是关闭的，你需要在使用之前先通过配置开启，

```js
export default {
  dynamicImport: {},
}
```

## 使用按需加载

### 按需加载组件

通过 Umi 的 `dynamic` 接口实现，比如：

```js
import { dynamic } from 'umi';

const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

const App = dynamic({
  loader: async function() {
    await delay(/* 1s */1000);
    return () => <div>I will render after 1s</div>;
  },
});
```

### 按需加载非组件

通过 `import()` 实现，比如：

```js
import('g2').then(() => {
  // do something with g2
});
```
