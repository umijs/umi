---
order: 12
toc: content
---
# valtio

@umijs/max 内置了 valtio 数据流方案。

## 启用 valtio

配置开启。

```ts
export default {
  valtio: {},
}
```

## 开始使用

### 基本用法

极其简单。

```ts
import { proxy, useSnapshot } from 'umi';

// 1、定义数据
const state = proxy({ count: 0 });
// 2、使用数据
const snap = useSnapshot(state);
snap.count;
// 3、更新数据
state.count += 1;
```

### React 外访问

天然支持。

```ts
import { proxy } from 'umi';

const state = proxy({ count: 0 });
state.count;
state.count += 1;
```

### 数据推导

```ts
import { proxyWithComputed } from 'umi';

const state = proxyWithComputed({
  count: 0,
}, {
  double: snap => snap.count * 2,
});
```

### Action 和异步 Action

两种用法，可以和 state 放一起，也可以分开。

```ts
import { proxy } from 'umi';

// 方法一：放一起
const state = proxy({
  count: 0,
  actions: {
	  add() {
	    // 注意这里别用 this.count，基于 snap 调用时会报错
	    state.count += 1;
	  },
  }
});
// 方法二：分开放
const state = proxy({ count: 0 });
const actions = {
  add() {
    state.count += 1;
  },
  // 异步 action
  async addAsync() {
    state.count += await fetch('/api/add');
  },
};
```

### 数据结构的拆分与组合

```ts
import { proxy } from 'umi';

// 比如如下定义
// state.foo 和 state.bar 都是 proxy，可拆分使用
const state = proxy({
  foo: { a: 1 },
  bar: { b: 1 },
});

// 组合
const foo = proxy({ a: 1 });
const bar = proxy({ b: 1 });
const state = proxy({ foo, bar });
```

### 组件封装

如果 props 内容和 state 无关，可以不处理；如果有关，按以下方式用 context 包一下，同时做 props 到 state 的数据同步即可。

```ts
import { proxy } from 'umi';

// 1、createContext
const MyContext = createContext();
// 2、Provider
const value = useRef(proxy({ count: 0 })).current;
<MyContext.Provider value={value} />
// 3、useContext
useContext(MyContext);
```

### Redux DevTools 支持

```ts
import { proxy, proxyWithDevtools } from 'umi';

const state = proxy({ count: 0 });
proxyWithDevtools(state, { name: 'count', enabled: true });
```

### Redo & Undo 支持

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

### 持久化缓存

待实现。

```ts
import { proxyWithPersistant } from 'umi';

const state = proxyWithPersistant({
  count: 0,
}, {
  type: 'localStorage',
  key: 'count',
});
```

### 扩展

valtio 是基于组装式的扩展方式，相比 middleware 的方式在类型提示上会更好一些。比如我要实现前面的 proxyWithPersistant，简单点的方案只要这样，

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

### 兼容性

1）需要 React 16.8 或以上，2）不支持 IE 11，3）map 和 set 不能直接用，需改用 valtio 提供的 proxyMap 和 proxySet。

```ts
import { proxy, proxyMap } from 'umi';

const state = proxy({
  todos: proxyMap<number, Todo>([[1, {id:1,text:'Learn Umi'}]]),
  filter: 'all',
});
```

### 测试

可以直接测 store，也可以测基于 store 的 React 组件。正常写用例即可，后者推荐用 @testing-library/react。

