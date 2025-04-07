---
order: 8
toc: content
---
# 路由数据加载

Umi 提供了开箱即用的数据预加载方案，能够解决在多层嵌套路由下，页面组件和数据依赖的瀑布流请求。Umi
会自动根据当前路由或准备跳转的路由，并行地发起他们的数据请求，因此当路由组件加载完成后，已经有马上可以使用的数据了。

## 启用方式

配置开启：

```ts
// .umirc.ts

export default {
  clientLoader: {}
}
```

## 使用方式

在路由文件中，除了默认导出的页面组件外，再导出一个 `clientLoader` 函数，并且在该函数内完成路由数据加载的逻辑。

```tsx
// pages/.../some_page.tsx

import { useClientLoaderData } from 'umi';

export default function SomePage() {
  const { data } = useClientLoaderData();
  return <div>{data}</div>;
}

export async function clientLoader() {
  const data = await fetch('/api/data');
  return data;
}
```

如上代码，在 `clientLoader` 函数返回的数据，可以在组件内调用 `useClientLoaderData` 获取。

## 优化效果

考虑一个三层嵌套路由的场景：

1. 我们需要先等第一层路由的组件加载完成，然后第一层路由的组件发起数据请求
2. 第一层路由的数据请求完成后，开始请求第二层路由的组件，第二层路由的组件加载好以后请求第二层路由需要的数据
3. 第二层路由的数据请求完成后，开始请求第三层路由的组件，第三层路由的组件加载好以后请求第三层路由需要的数据
4. 第三层路由的数据请求完成后，整个页面才完成渲染

这样的瀑布流请求会严重影响用户的体验，如下图所示：

![](https://img.alicdn.com/imgextra/i1/O1CN01OcsOL91CPw46Pm7vz_!!6000000000074-1-tps-600-556.gif)

如果将组件请求数据的程序提取到 `clientLoader` 中，则 Umi 可以并行地请求这些数据：

![](https://img.alicdn.com/imgextra/i3/O1CN01URnLH81un9EVYGeL9_!!6000000006081-1-tps-600-556.gif)
