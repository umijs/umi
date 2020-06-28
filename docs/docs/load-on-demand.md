# Load On Demand


## How to endable

**Common use case**：To reduce first screen download cost, component with huge implementation / dependency can be split in differnet bundle. Let's say we have component `HugeA` with huge 3rd-party dependency, and this `HugeA` will not be used in first screen, that means it can be split out. We shall use `dynamic` in this case.

Load on demand is disabled by default in order to simplify deployment. You can enable it with below config:

```js
export default {
  dynamicImport: {},
}
```

## How to use

### Load component on demand

**Why use `dynamic`**：It includes functions like `split chunks`, `async chunks loader`, `loading state maintainance`, so developers is free from those technical details and is able to focus their business.

Usually work with [dynamic import syntax](https://github.com/tc39/proposal-dynamic-import).


**Create dynamic component**

```js
import { dynamic } from 'umi';

export default dynamic({
  loader: async function() {
    // webpackChunkName tells webpack create separate bundle for HugeA
    const { default: HugeA } = await import(/* webpackChunkName: "external_A" */ './HugeA');
    return HugeA;
  },
});
```

**Use dynamic component**

```js
import React from 'react';
import AsyncHugeA from './AsyncHugeA';

// import as normal component
// with below benefits out of box:
// 1. download bundle automatically
// 2. give a loading splash while downloading (customizable)
// 3. display HugeA whenever component downloaded
export default () => {
  return <AsyncHugeA />;
}
```
