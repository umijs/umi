# Load on demand

For performance reasons, we load modules and components on demand.

## Loading Components on Demand

Implemented through the `umi/dynamic` interface, such as:

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

## Loading Modules on Demand

Implemented by `import()`, such as:

```js
import('g2').then(() => {
  // do something with g2
});
```
