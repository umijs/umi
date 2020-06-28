# 按需加载

## 启用按需加载

**常见使用场景**：组件体积太大，不适合直接计入 bundle 中，以免影响首屏加载速度。例如：某组件 HugeA 包含巨大的实现 / 依赖了巨大的三方库，且该组件 HugeA 的使用不在首屏显示范围内，可被单独拆出。这时候，`dynamic` 就该上场了。

为了简化部署成本，按需加载功能默认是关闭的，你需要在使用之前先通过配置开启，

```js
export default {
  dynamicImport: {},
}
```

## 使用按需加载

### 按需加载组件 `dynamic`



**为什么使用 `dynamic`**：封装了使用一个异步组件需要做的状态维护工作，开发者可以更专注于自己的业务组件开发，而不必关心 code spliting、async module loading 等等技术细节。

通常搭配 [动态 import 语法](https://github.com/tc39/proposal-dynamic-import) 使用。


**封装一个异步组件**

```js
import { dynamic } from 'umi';

export default dynamic({
  loader: async function() {
    // 这里的注释 webpackChunkName 可以指导 webpack 将该组件 HugeA 以这个名字单独拆出去
    const { default: HugeA } = await import(/* webpackChunkName: "external_A" */ './HugeA');
    return HugeA;
  },
});
```

**使用异步组件**

```js
import React from 'react';
import AsyncHugeA from './AsyncHugeA';

// 像使用普通组件一样即可
// dynamic 为你做:
// 1. 异步加载该模块的 bundle
// 2. 加载期间 显示 loading（可定制）
// 3. 异步组件加载完毕后，显示异步组件
export default () => {
  return <AsyncHugeA />;
}
```
