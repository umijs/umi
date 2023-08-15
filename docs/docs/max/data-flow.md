import { Message } from 'umi';

# Data Flow

The `@umi/max` comes with a built-in **data flow management** [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/model.ts). It is a lightweight data management solution based on the `hooks` paradigm, designed to manage global shared data in Umi projects.

## Getting Started

### Creating a Model

The data flow management plugin follows a convention-based directory structure. We conventionally place Model files in the `src/models` and `src/pages/xxxx/models/` directories, or you can also include them as `src/pages/xxxx/model.{js,jsx,ts,tsx}` files.
Model files can use any of the four suffix formats: `.(tsx|ts|jsx|js)`. The generation rules for **namespaces** are as follows.

| Path | Namespace | Description |
| :--- | :--- | :--- |
| `src/models/count.ts` | `count` | Model definitions in the `src/models` directory do not support nested folders |
| `src/pages/pageA/model.ts` | `pageA.model` |  |
| `src/pages/pageB/models/product.ts` | `pageB.product` |  |
| `src/pages/pageB/models/fruit/apple.ts` | `pageB.fruit.apple` |  Nested model definitions are supported under `pages/xxx/models` |

A Model, in essence, is a custom `hooks` without any "black magic" that users need to be concerned about.

When you need to access global data from a Model, you can simply call that namespace. For example, for a Model file named `userModel.ts`, its namespace would be `userModel`.

Write a default export function:

```ts
// src/models/userModel.ts
export default function Page() {
  const user = {
    username: 'umi',
  };

  return { user };
};
```

This is a Model. The plugin's role is to turn the states or data within it into **global data**. Different components using the same Model will access the same state or data.

<Message emoji="💡">
Model files need to export a default function, which defines a `hook`. Files that do not follow this convention will be filtered out and cannot be accessed through namespaces.
</Message>

Other `hooks` can be used within a Model, as shown in the counter example:

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

In real-world projects, we often need to make backend API requests to fetch necessary data. Let's extend the previous example of fetching user information:

```ts
// src/models/userModel.ts
import { useState, useEffect } from 'react';
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

If you're using [ahooks](https://ahooks.js.org) in your project, you can organize your code like this:

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

Now, if you want to use a global Model in a component, let's take the user information as an example. You can simply call the `useModel` hook function:

```tsx
// src/components/Username/index.tsx
import { useModel } from 'umi';

export default function Page() {
  const { user, loading } = useModel('userModel');

  return (
    {loading ? <></> : <div>{user.username}</div>}
  );
}
```

In the `useModel()` method, the parameter provided is the Model's **namespace**.

<Message emoji="💡">
If you're using VSCode as your IDE for Umi project development, it's recommended to use the [@umijs/plugin-model](https://marketplace.visualstudio.com/items?itemName=litiany4.umijs-plugin-model) plugin. It allows you to quickly navigate to the file defining the Model:
![vscode - @umijs/plugin-model Demo](https://gw.alipayobjects.com/zos/antfincdn/WcVbbF6KG2/1577073518336-afe6f03d-f817-491a-848a-5feeb4ecd72b.gif)
</Message>

## Performance Optimization

The `useModel()` method can accept an optional second parameter. When a component only needs to use certain parameters from the Model and isn't interested in changes to other parameters, you can pass a filtering function. Let's use the example of operation buttons for a counter:

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

In the above component, the `counter` value from the counter Model isn't relevant. The component only needs to use the `increment()` and `decrement()` methods provided by the Model. Therefore, we pass a function as the second parameter to the `useModel()` method, and the return value of this function becomes the return value of the `useModel()` method. This way, we filter out the frequently changing `counter` value, avoiding the performance hit from unnecessary re-renders.

## Global Initial State

The `@umi/max` comes with a built-in **global initial state management** [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/initial-state.ts), allowing you to quickly build and retrieve the Umi project's global initial state within components.

The global initial state is a special kind of Model.

The global initial state is created at the very beginning of the Umi project. Write the export method `getInitialState()` in `src/app.ts`, and its return value becomes the global initial state. For example:

```ts
// src/app.ts
import { fetchInitialData } from '@/services/initial';

export async function getInitialState() {
  const initialData = await fetchInitialData();
  return initialData;
}
```

Now, various plugins and components can directly access this global initial state by using `useModel('@@initialState')`, as shown below:

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
| `initialState` | `any` | Return value of the exported `getInitialState()` method |
| `loading` | `boolean` | Whether `getInitialState()` or `refresh()` methods are currently in progress. Rendering of other parts of the page is **blocked** until the initial state is obtained for the first time |
| `error` | `Error` | If an error occurs during the execution of the exported `getInitialState()` method |
| `refresh` | `() => void` | Re-execute the `getInitialState` method and retrieve a new global initial state |
| `setInitialState` | `(state: any) => void` | Manually set the value of `initialState`, and set `loading` to `false` when done manually |

## Qiankun Communication Between Parent and Child Applications

The `@umi/max` comes with the **Qiankun micro-frontends** [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts). When using data flow plugins, this plugin allows micro-applications to use the `useModel('@@qiankunStateFromMaster')` method to access the data Model passed from the parent application to the child application, enabling communication between parent and child applications.

For specific usage, please refer to the [Communication Between Parent and Child Applications](./micro-frontend#communication-between-parent-and-child-applications) section.

## API

### `useModel`

`useModel()` is a hook function that provides the ability to use a Model. It takes two parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `namespace` | `String` | Namespace of the Model file |
| `updater` | `(model: any) => any` | Optional parameter. Pass a function that returns the Model's state or data that the current component needs to use. This return value becomes the return value of the `useModel()` method. It's crucial for optimizing component performance. |

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
