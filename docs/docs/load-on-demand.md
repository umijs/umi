# Load On Demand


## How to endable

Load on demand is disabled by default in order to simplify deployment. You can enable it with below config:

```js
export default {
  dynamicImport: {},
}
```

## How to use

### Load component on demand

Load component via `dynamic`, for example:

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

### Load non-component stuff

Load non-component stuff via `import()`, for example:

```js
import('g2').then(() => {
  // do something with g2
});
```
