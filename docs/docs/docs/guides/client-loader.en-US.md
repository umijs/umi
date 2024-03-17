---
order: 8
toc: content
translated_at: '2024-03-17T10:34:59.913Z'
---

# Route Data Loading

Umi provides an out-of-the-box solution for data pre-loading, which can solve the waterfall requests of page components and data dependencies under multi-layer nested routing. Umi automatically initiates their data requests in parallel according to the current route or the route being prepared for transition. Therefore, when the route component is loaded, there is already data available for immediate use.

## How to Enable

Configuration to enable:

```ts
// .umirc.ts

export default {
  clientLoader: {}
}
```

## How to Use

In the routing file, in addition to the default exported page component, another `clientLoader` function is exported, and the logic for route data loading is completed within this function.

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

As shown in the code above, the data returned by the `clientLoader` function can be obtained inside the component by calling `useClientLoaderData`.

## Optimization Effect

Consider a scenario with three layers of nested routing:

1. We need to wait for the first layer route's component to load, then the first layer route's component makes a data request.
2. After the data request of the first layer route is completed, it starts to request the second layer route's component. After the second layer route's component is loaded, it requests the data needed for the second layer route.
3. After the data request of the second layer route is completed, it starts to request the third layer route's component. After the third layer route's component is loaded, it requests the data needed for the third layer route.
4. After the data request of the third layer route is completed, the entire page is finally rendered.

Such waterfall requests can severely impact the user experience, as shown in the figure below:

![](https://img.alicdn.com/imgextra/i1/O1CN01OcsOL91CPw46Pm7vz_!!6000000000074-1-tps-600-556.gif)

If the component's data request is extracted into `clientLoader`, then Umi can request these data in parallel:

![](https://img.alicdn.com/imgextra/i3/O1CN01URnLH81un9EVYGeL9_!!6000000006081-1-tps-600-556.gif)
