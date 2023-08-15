# valtio

@umijs/max comes with the valtio state management solution.

## Activation

Enable it through configuration.

```ts
export default {
  valtio: {},
};
```

## Getting Started

### Basic Usage

It's incredibly simple.

```ts
import { proxy, useSnapshot } from 'umi';

// 1. Define data
const state = proxy({ count: 0 });
// 2. Use data
const snap = useSnapshot(state);
snap.count;
// 3. Update data
state.count += 1;
```

### Access Outside React

Natively supported.

```ts
import { proxy } from 'umi';

const state = proxy({ count: 0 });
state.count;
state.count += 1;
```

### Computed Data

```ts
import { proxyWithComputed } from 'umi';

const state = proxyWithComputed(
  {
    count: 0,
  },
  {
    double: snap => snap.count * 2,
  }
);
```

### Actions and Async Actions

There are two ways to define actions: you can define them within the same object as the state, or separate them.

```ts
import { proxy } from 'umi';

// Method 1: Define together
const state = proxy({
  count: 0,
  actions: {
    add() {
      // Note: Don't use this.count here, as calling this in relation to snap will cause an error
      state.count += 1;
    },
  },
});
// Method 2: Define separately
const state = proxy({ count: 0 });
const actions = {
  add() {
    state.count += 1;
  },
  // Async action
  async addAsync() {
    state.count += await fetch('/api/add');
  },
};
```

### Splitting and Combining Data Structures

```ts
import { proxy } from 'umi';

// For example, defining as follows:
// Both state.foo and state.bar are proxies and can be used separately
const state = proxy({
  foo: { a: 1 },
  bar: { b: 1 },
});

// Combining
const foo = proxy({ a: 1 });
const bar = proxy({ b: 1 });
const state = proxy({ foo, bar });
```

### Component Encapsulation

If props are unrelated to state, they can be left as they are. If they are related, use the following method to wrap them in a context. Also, synchronize the data from props to state.

```ts
import { proxy } from 'umi';

// 1. Create Context
const MyContext = createContext();
// 2. Provider
const value = useRef(proxy({ count: 0 })).current;
<MyContext.Provider value={value} />;
// 3. useContext
useContext(MyContext);
```

### Redux DevTools Support

```ts
import { proxy, proxyWithDevtools } from 'umi';

const state = proxy({ count: 0 });
proxyWithDevtools(state, { name: 'count', enabled: true });
```

### Redo & Undo Support

```ts
import { proxyWithHistory } from 'umi';

const state = proxyWithHistory({
  count: 0,
});
state.value.count;
state.value.count += 1;
state.undo();
state.redo();
state.history;
```

### Persistence Cache

To be implemented.

```ts
import { proxyWithPersistant } from 'umi';

const state = proxyWithPersistant(
  {
    count: 0,
  },
  {
    type: 'localStorage',
    key: 'count',
  }
);
```

### Extension

Valtio allows compositional extensions, which can offer better type hinting compared to middleware. For example, for implementing the `proxyWithPersistant` function mentioned earlier, a simple solution can be as follows:

```ts
export function proxyWithPersist<V>(val: V, opts: {  
  key: string;  
}) {  
  const local = localStorage.getItem(opts.key);  
  const state = proxy(local ? JSON.parse(local) : val);  
  subscribe(state, () => {  
    localStorage.setItem(opts.key, JSON.stringify(snapshot(state)));  
  });
  return state;  
}
```

### Compatibility

1. Requires React 16.8 or above.
2. Does not support IE 11.
3. Cannot directly use `map` and `set`, use `proxyMap` and `proxySet` provided by valtio.

```ts
import { proxy, proxyMap } from 'umi';

const state = proxy({
  todos: proxyMap<number, Todo>([[1, {id:1,text:'Learn Umi'}]]),
  filter: 'all',
});
```

### Testing

You can directly test the store or test React components based on the store. Write your test cases as usual. For the latter, it's recommended to use `@testing-library/react`.