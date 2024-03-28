---
order: 12
toc: content
translated_at: '2024-03-17T08:10:46.432Z'
---

# valtio

@umijs/max comes with a built-in valtio data flow solution.

## Enable valtio

Configure to enable.

```ts
export default {
  valtio: {},
}
```

## Getting Started

### Basic Usage

Extremely simple.

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

Naturally supported.

```ts
import { proxy } from 'umi';

const state = proxy({ count: 0 });
state.count;
state.count += 1;
```

### Data Deduction

```ts
import { proxyWithComputed } from 'umi';

const state = proxyWithComputed({
  count: 0,
}, {
  double: snap => snap.count * 2,
});
```

### Actions and Async Actions

Two ways to use, can be combined with state or separated.

```ts
import { proxy } from 'umi';

// Method one: Combine
const state = proxy({
  count: 0,
  actions: {
	  add() {
	    // Note, do not use this.count, will error when called based on snap
	    state.count += 1;
	  },
  }
});
// Method two: Separate
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

// For example, as follows defined
// state.foo and state.bar are both proxies, can be split and used
const state = proxy({
  foo: { a: 1 },
  bar: { b: 1 },
});

// Combination
const foo = proxy({ a: 1 });
const bar = proxy({ b: 1 });
const state = proxy({ foo, bar });
```

### Component Encapsulation

If the content of props is unrelated to state, it can be left unhandled; if related, wrap it with context as follows, while synchronizing props to state data.

```ts
import { proxy } from 'umi';

// 1. createContext
const MyContext = createContext();
// 2. Provider
const value = useRef(proxy({ count: 0 })).current;
<MyContext.Provider value={value} />
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

### Persistent Cache

To be implemented.

```ts
import { proxyWithPersistent } from 'umi';

const state = proxyWithPersistent({
  count: 0,
}, {
  type: 'localStorage',
  key: 'count',
});
```

### Extension

Valtio is based on a composable extension approach, which provides better type hints compared to the middleware approach. For instance, to implement the earlier mentioned proxyWithPersistent, a simpler solution would be as follows,

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

1) Requires React 16.8 or above, 2) Does not support IE 11, 3) map and set cannot be used directly, need to use the valtio provided proxyMap and proxySet instead.

```ts
import { proxy, proxyMap } from 'umi';

const state = proxy({
  todos: proxyMap<number, Todo>([[1, {id:1,text:'Learn Umi'}]]),
  filter: 'all',
});
```

### Testing

You can test the store directly, or test React components based on the store. Write cases as usual, the latter are recommended to use @testing-library/react.
