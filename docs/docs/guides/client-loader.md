# Route Data Loading

Umi provides an out-of-the-box data preloading solution that can solve the waterfall request problem of page components and data dependencies in multi-level nested routes. Umi automatically initiates data requests in parallel based on the current route or the route you're about to navigate to. This means that once the route components are loaded, the data is immediately available for use.

## Enabling the Feature

Enable the feature by configuring:

```ts
// .umirc.ts

export default {
  clientLoader: {}
}
```

## Usage

In the route file, in addition to exporting the default page component, also export a `clientLoader` function. Inside this function, complete the logic for loading route data.

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

As seen in the above code, the data returned from the `clientLoader` function can be accessed within the component using `useClientLoaderData`.

## Optimization Effect

Consider a scenario with a three-level nested route:

1. We need to wait for the component of the first-level route to load and then initiate a data request from that component.
2. After the data request of the first-level route is complete, initiate the request for the component of the second-level route. Once the component of the second-level route is loaded, request the required data for that route.
3. After the data request of the second-level route is complete, initiate the request for the component of the third-level route. Once the component of the third-level route is loaded, request the required data for that route.
4. Once the data request of the third-level route is complete, the entire page is rendered.

Such a waterfall request process can significantly impact user experience, as shown in the following illustration:

![](https://img.alicdn.com/imgextra/i1/O1CN01OcsOL91CPw46Pm7vz_!!6000000000074-1-tps-600-556.gif)

By extracting the component's data request logic into `clientLoader`, Umi can parallelize these data requests, as shown in this illustration:

![](https://img.alicdn.com/imgextra/i3/O1CN01URnLH81un9EVYGeL9_!!6000000006081-1-tps-600-556.gif)