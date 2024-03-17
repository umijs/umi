---
order: 5
toc: content
translated_at: '2024-03-17T09:24:49.645Z'
---

```markdown
# Data Stream

`@umi/max` has a built-in **data stream management** [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/model.ts), which is a lightweight data management solution based on the `hooks` paradigm. It allows managing global shared data in Umi projects.

## Getting Started

### Creating a Model

The data stream management plugin adopts a conventional directory structure. We agree that you can include Model files in the `src/models`, `src/pages/xxxx/models/` directory, and `src/pages/xxxx/model.{js,jsx,ts,tsx}` files.
Model files can use `.(tsx|ts|jsx|js)` four suffix formats, the **namespace** generation rule is as follows.

| Path | Namespace | Explanation |
| :--- |:--- | :--- |
| `src/models/count.ts` | `count` | `src/models` directory does not support nested directory definition model |
| `src/pages/pageA/model.ts` | `pageA.model` |  |
| `src/pages/pageB/models/product.ts` | `pageB.product` |  |
| `src/pages/pageB/models/fruit/apple.ts` | `pageB.fruit.apple` |  `pages/xxx/models` under model definition supports nested definition |

A Model is essentially a custom `hooks` that doesn't involve any "black magic" that users need to worry about.

When you need to get the global data in the Model, you can call its namespace. For example, for the Model file `userModel.ts`, its namespace is `userModel`.

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

This is a Model. The plugin's job is to turn the state or data within it into **global data**, so when different components use this Model, they get the same set of state or data.

:::info{title=💡}
The Model file needs to default export a function, which defines a `hook`. Files that do not comply with this specification will be filtered out and cannot be called by namespace.
:::

The Model can use other `hooks`, taking a counter as an example:

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

In project practice, we usually need to request backend interfaces to obtain the required data. Now let's extend the previous example of getting user information:

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

### Using Model

Now, if you want to use a global Model in a specific component. Taking user information as an example, just call the `useModel` hook function:

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

In this case, the `useModel()` method's parameter is the Model's **namespace**.

:::info{title=💡}
If you use VSCode as the IDE for developing Umi projects, it is recommended to use in conjunction with the [@umijs/plugin-model](https://marketplace.visualstudio.com/items?itemName=litiany4.umijs-plugin-model) plugin. It allows you to quickly jump to the file that defines the Model:

![vscode - @umijs/plugin-model plugin demonstration](https://gw.alipayobjects.com/zos/antfincdn/WcVbbF6KG2/1577073518336-afe6f03d-f817-491a-848a-5feeb4ecd72b.gif)
:::

## Performance Optimization

The `useModel()` method can accept an optional second parameter. When the component only needs to use part of the Model's parameters and is not interested in the changes of other parameters, a function can be passed in for filtering. Taking the operation buttons of the counter as an example:

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

The above component is not concerned with the `counter` value in the counter Model, only needing to use the `increment()` and `decrement()` methods provided by the Model. Thus, we passed in a function as the second parameter of the `useModel()` method, whose return value will serve as the `useModel()` method's return value.

This way, we filter out the frequently changing `counter` value, avoiding performance loss caused by repeated rendering of the component.

## Global Initial State

`@umi/max` has a built-in **global initial state management** [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/initial-state.ts), allowing you to quickly build and obtain the global initial state of Umi projects within components.

The global initial state is a special Model.

The global initial state is created at the very beginning of the entire Umi project. Write the `getInitialState()` export method in `src/app.ts`, whose return value will become the global initial state. For example:

```ts
// src/app.ts
import { fetchInitialData } from '@/services/initial';

export async function getInitialState() {
  const initialData = await fetchInitialData();
  return initialData;
}
```

Now, various plugins and components you define can directly obtain this global initial state through `useModel('@@initialState')`, as shown below:

```tsx
import { useModel } from 'umi';

export default function Page() {
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');
  return <>{initialState}</>;
};
```

| Object Property | Type | Introduction |
| --- | --- | --- |
| `initialState` | `any` | The return value of the exported `getInitialState()` method |
| `loading` | `boolean` | Whether the `getInitialState()` or `refresh()` method is in progress. Before the initial state is first obtained, the rendering of other parts of the page will be **blocked** |
| `error` | `Error` | If the exported `getInitialState()` method throws an error, the error message |
| `refresh` | `() => void` | Re-execute the `getInitialState` method and obtain a new global initial state |
| `setInitialState` | `(state: any) => void` | Manually set the value of `initialState`, after manual setting, `loading` will be set to `false` |

## Qiankun Parent-Child Application Communication

`@umi/max` has a built-in **Qiankun Microfrontend** [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts), when using the data stream plugin, it allows micro-applications to obtain the parent application's data Model passed to the child application through the `useModel('@@qiankunStateFromMaster')` method, thereby achieving communication between parent and child applications.

For specific usage methods, please refer to the section on parent-child application communication in microfrontend.

## API

### `useModel`

`useModel()` is a hook function that provides the capability to use Model. It accepts two parameters:

| Parameter | Type | Introduction |
| --- | --- | --- |
| `namespace` | `String` | The namespace of the Model file |
| `updater` | `(model: any) => any` | An optional parameter. Pass in a function, whose return value is the Model state or data currently needed in the component, and serves as the return value of the `useModel()` method. It is of significant importance for optimizing component performance. |

```tsx
// src/components/AdminInfo/index.tsx
import { useModel } from 'umi';

export default function Page() {
  const { user, fetchUser } = useModel('adminModel', (model) => ({
    user: model.admin,
    fetchUser: model.fetchAdmin,
  }));

  return <>hello</>;
};
```
