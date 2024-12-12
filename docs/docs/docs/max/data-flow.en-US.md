---
order: 5
toc: content
translated_at: '2024-03-18T00:49:20.502Z'
---

# Data Stream

`@umi/max` has a built-in **data flow management** [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/model.ts), which is a lightweight data management solution based on the `hooks` paradigm. It can be used to manage global shared data in Umi projects.

## Configuration

e.g.

```ts
export default {
  model: {
    extraModels: ['src/models/userModel.ts'],
    sort: (a, b) => a.namespace.localeCompare(b.namespace),
  },
};
```

### extraModels

- Type: `string[]`
- Default: `[]`

Configure `extraModels` to automatically add these Model files to the data stream management.

### sort

- Type: `(a: Model, b: Model) => number`
- Default: `(a, b) => a.namespace.localeCompare(b.namespace)`

Configure `sort` to sort the Model based on the return value of the `sort` function.

## Getting Started

### Creating a Model

The data flow management plugin adopts a conventional directory structure. We agree that Model files can be introduced in the `src/models`, `src/pages/xxxx/models/` directories, and in `src/pages/xxxx/model.{js,jsx,ts,tsx}` files.
Model files can have one of four suffix formats: `.(tsx|ts|jsx|js)`. The **namespace** generation rule is as follows.

| Path | Namespace | Description |
| :--- |:--- | :--- |
| `src/models/count.ts` | `count` | Defining model in `src/models` directory does not support directory nesting |
| `src/pages/pageA/model.ts` | `pageA.model` |  |
| `src/pages/pageB/models/product.ts` | `pageB.product` |  |
| `src/pages/pageB/models/fruit/apple.ts` | `pageB.fruit.apple` |  Definition in `pages/xxx/models` supports nested models |

A Model is essentially a custom `hook` with no "black magic" for the user to worry about.

When we need to access the global data in the Model, we can call the namespace directly. For example, for a Model file `userModel.ts`, its namespace is `userModel`.

Write a function with a default export:

```ts
// src/models/userModel.ts
export default function Page() {
  const user = {
    username: 'umi',
  };

  return { user };
};
```

This is a Model. What the plugin does is turn the state or data in it into **global data**, providing the same state or data to different components using that Model.

:::info{title=💡}
The Model file needs to export a function by default, which defines a `hook`. Files that do not conform to this standard will be filtered out and cannot be called by namespace.
:::

It's allowed to use other `hooks` in a Model. Take a counter as an example:

```ts
// src/models/counterModel.ts
import { useState, useCallback } from 'react';

export default function Page() {
  const [counter, setCounter] = useState(0);

  const increment = useCallback(() => setCounter((c) => c + 1), []);
  const decrement = useCallback(() => setCounter((c) => c - 1), []);

  return { counter, increment, decrement };
};
```

In real-world projects, we usually need to request backend interfaces to obtain the data we need. Now let's expand the previous example of fetching user information:

```ts
// src/models/userModel.ts
import { useState } from 'react';
import { getUser } from '@/services/user';

export default function Page() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then((res) => {
      setUser(res);
      setLoading(false);
    });
  }, []);

  return {
    user,
    loading,
  };
};
```

If you use [ahooks](https://ahooks.js.org) in your project, you can organize your code like this:

```ts
// src/models/userModel.ts
import { useRequest } from 'ahooks';
import { getUser } from '@/services/user';

export default function Page() {
  const { data: user, loading: loading } = useRequest(async () => {
    const res = await getUser();
    if (res) {
      return res;
    }
    return {};
  });

  return {
    user,
    loading,
  };
};
```

### Using a Model

Now, you want to use a global Model in a certain component. Taking the user information as an example, you only need to call the `useModel` hook function:

```tsx
// src/components/Username/index.tsx
import { useModel } from 'umi';

export default function Page() {
  const { user, loading } = useModel('userModel');

  return (
    {loading ? <></>: <div>{user.username}</div>}
  );
}
```

The `useModel()` method's argument is the Model's **namespace**.

:::info{title=💡}
If you use VSCode as the IDE for developing Umi projects, it's recommended to use it in conjunction with the [@umijs/plugin-model](https://marketplace.visualstudio.com/items?itemName=litiany4.umijs-plugin-model) plugin. It allows you to quickly jump to the file that defines the Model:

![vscode - @umijs/plugin-model plugin demo](https://gw.alipayobjects.com/zos/antfincdn/WcVbbF6KG2/1577073518336-afe6f03d-f817-491a-848a-5feeb4ecd72b.gif)
:::

## Performance Optimization

The `useModel()` method can accept an optional second parameter. When a component only needs to use part of the Model and is not interested in changes to other parameters, you can pass in a function to filter. Take the operation button for the counter as an example:

```tsx
// src/components/CounterActions/index.tsx
import { useModel } from 'umi';

export default function Page() {
  const { add, minus } = useModel('counterModel', (model) => ({
    add: model.increment,
    minus: model.decrement,
  }));

  return (
    <div>
      <button onClick={add}>add by 1</button>
      <button onClick={minus}>minus by 1</button>
    </div>
  );
};
```

The above component is not interested in the `counter` value in the counter Model, and only needs to use the `increment()` and `decrement()` methods provided by the Model. Therefore, we passed in a function as the second argument for the `useModel()` method, and its return value will be used as the return value of the `useModel()` method.

This way, we have filtered out the frequently changing `counter` value, avoiding the performance loss caused by the component's repetitive rendering.

## Global Initial State

`@umi/max` has a built-in **global initial state management** [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/initial-state.ts), which allows you to quickly build and access the global initial state of Umi projects within components.

The global initial state is a special Model.

The global initial state is created at the very beginning of the entire Umi project. Write the export method `getInitialState()` in `src/app.ts`, and its return value will become the global initial state. For example:

```ts
// src/app.ts
import { fetchInitialData } from '@/services/initial';

export async function getInitialState() {
  const initialData = await fetchInitialData();
  return initialData;
}
```

Now, various plugins and your defined components can directly access this global initial state through `useModel('@@initialState')` as shown below:

```tsx
import { useModel } from 'umi';

export default function Page() {
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');
  return <>{initialState}</>;
};
```

| Object Property | Type | Description |
| --- | --- | --- |
| `initialState` | `any` | The return value of the exported `getInitialState()` method |
| `loading` | `boolean` | Whether the `getInitialState()` or `refresh()` method is in progress. Before the initial state is obtained for the first time, the rendering of other parts of the page will be **blocked** |
| `error` | `Error` | If an error occurs while running the exported `getInitialState()` method, the error message |
| `refresh` | `() => void` | Re-execute the `getInitialState` method and obtain a new global initial state |
| `setInitialState` | `(state: any) => void` | Manually set the value of `initialState`, after manually setting it, `loading` will be set to `false` |

## Qiankun Parent-Child Communication

`@umi/max` has a built-in **Qiankun Micro-Frontend** [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts), which allows micro-applications to obtain the data Model passed from the parent application through the `useModel('@@qiankunStateFromMaster')` method, thereby achieving communication between parent and child applications.

For specific usage, please refer to the [micro-frontend's parent-child communication chapter](./micro-frontend#parent-child-communication).

## API

### `useModel`

`useModel()` is a hook function that provides the ability to use a Model. It accepts two parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `namespace` | `String` | The namespace of the Model file |
| `updater` | `(model: any) => any` | Optional parameter. Passing in a function, the return value of which is the Model state or data currently needed by the component, and it serves as the return value of the `useModel()` method. It plays a significant role in optimizing component performance. |

```tsx
// src/components/AdminInfo/index.tsx
import { useModel } from 'umi';

export default () => {
  const { user, fetchUser } = useModel('adminModel', (model) => ({
    user: model.admin,
    fetchUser: model.fetchAdmin,
  }));

  return <>hello</>;
};
```
