import { Message } from 'umi';

# 数据流

`@umi/max` 内置了**数据流管理**插件 [`@umijs/plugin-model`](https://github.com/umijs/umi-next/blob/master/packages/plugins/src/model.ts)，它是一种基于 `hooks` 范式的轻量级数据管理方案，可以在 Umi 项目中管理全局的共享数据。

## 开始使用

### 创建 Model

数据流管理插件采用约定式目录结构，我们约定在 `src/models` 目录下引入 Model 文件。

<Message emoji="💡">
如果 Umi 项目配置了 `singular: true`，则应当使用 `src/model` 作为存放 Model 文件的目录。
</Message>

所谓的 Model，就是一个自定义的 `hooks`，没有任何使用者需要关注的“黑魔法”。

Model 文件允许使用 `.js`，`.jsx`，`.ts` 和 `tsx` 四种后缀格式，其文件名将成为它的**命名空间（namespace）**。

当我们需要获取 Model 中的全局数据时，调用该命名空间即可。例如，对于 Model 文件 `useUserModel.ts`，它的命名空间为 `useUserModel`。

编写一个默认导出的函数：

```ts
// src/models/useUserModel.ts
export default () => {
  const user = {
    username: 'umi',
  };

  return { user };
};
```

这就是一个 Model。`@umijs/plugin-model` 插件所做的工作就是将其中的状态或数据变成了**全局数据**，不同的组件在使用该 Model 时，拿到的是同一份状态或数据。

<Message emoji="💡">
Model 文件需要默认导出一个函数，此函数定义了一个 `hook`。对于不符合此规范的文件，将会被过滤掉，并无法通过命名空间调用。
</Message>

Model 中允许使用其它 `hooks`，以计数器为例：

```ts
// src/models/useCounterModel.ts
import { useState, useCallback } from 'react';

export default () => {
  const [counter, setCounter] = useState(0);

  const increment = useCallback(() => setCounter((c) => c + 1), []);
  const decrement = useCallback(() => setCounter((c) => c - 1), []);

  return { counter, increment, decrement };
};
```

在项目实践中，我们通常需要请求后端接口，来获取所需的数据。现在让我们来扩展前面获取用户信息的例子：

```ts
// src/models/useUserModel.ts
import { useState } from 'react';
import { getUser } from '@/services/user';

export default () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  getUser().then((res) => {
    setUser(res);
    setLoading(false);
  });

  return {
    user,
    loading,
  };
};
```

如果您在项目中使用了 [ahooks](https://ahooks.js.org)，可以像这样组织您的代码：

```ts
// src/models/useUserModel.ts
import { useRequest } from 'ahooks';
import { getUser } from '@/services/user';

export default () => {
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

### 使用 Model

现在，您想要在某个组件中使用全局的 Model。以用户信息为例，只需要调用 `useModel` 这一钩子函数：

```tsx
// src/components/Username/index.tsx
import { useModel } from 'umi';

export default () => {
  const { user, loading } = useModel('useUserModel');

  return (
    {loading ? <></>: <div>{user.username}</div>}
  );
}
```

其中，`useModel()` 方法传入的参数为 Model 的**命名空间**。

<Message emoji="💡">
如果您使用 VSCode 作为 Umi 项目开发的 IDE，推荐搭配 [@umijs/plugin-model](https://marketplace.visualstudio.com/items?itemName=litiany4.umijs-plugin-model) 插件使用。它允许您快速跳转到定义 Model 的文件：

![vscode - @umijs/plugin-model 插件演示](https://gw.alipayobjects.com/zos/antfincdn/WcVbbF6KG2/1577073518336-afe6f03d-f817-491a-848a-5feeb4ecd72b.gif) </Message>

## 性能优化

`useModel()` 方法可以接受可选的第二个参数，当组件只需要使用 Model 中的部分参数，而对其它参数的变化不感兴趣时，可以传入一个函数进行过滤。以实现计数器的操作按钮为例：

```tsx
// src/components/CounterActions/index.tsx
import { useModel } from 'umi';

export default () => {
  const { add, minus } = useModel('useCounterModel', (model) => ({
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

上面的组件并不关心计数器 Model 中的 `counter` 值，只需要使用 Model 提供的 `increment()` 和 `decrement()` 方法。于是我们传入了一个函数作为 `useModel()` 方法的第二个参数，该函数的返回值将作为 `useModel()` 方法的返回值。

这样，我们过滤掉了 `counter` 这一频繁变化的值，避免了组件重复渲染带来的性能损失。

## 全局初始状态

`@umi/max` 内置了**全局初始状态管理**插件 [`@umijs/plugin-initial-state`](https://github.com/umijs/umi-next/blob/master/packages/plugins/src/initial-state.ts)，它依赖于 `@umijs/plugin-model`，允许您快速构建并在组件内获取 Umi 项目全局的初始状态。

全局初始状态是一种特殊的 Model。

全局初始状态在整个 Umi 项目的最开始创建。编写 `src/app.ts` 的导出方法 `getInitialState()`，其返回值将成为全局初始状态。例如：

```ts
// src/app.ts
import { fetchInitialData } from '@/services/initial';

export async function getInitialState() {
  const initialData = await fetchInitialData();
  return initialData;
}
```

现在，各种插件和您定义的组件都可以通过 `useModel('@@initialState')` 直接获取到这份全局的初始状态，如下所示：

```tsx
import { useModel } from 'umi';

export default () => {
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');
  return <>{initialState}</>;
};
```

| 对象属性 | 类型 | 介绍 |
| --- | --- | --- |
| `initialState` | `any` | 导出的 `getInitialState()` 方法的返回值 |
| `loading` | `boolean` | `getInitialState()` 或 `refresh()` 方法是否正在进行中。在首次获取到初始状态前，页面其他部分的渲染都会**被阻止** |
| `error` | `Error` | 如果导出的 `getInitialState()` 方法运行时报错，报错的错误信息 |
| `refresh` | `() => void` | 重新执行 `getInitialState` 方法，并获取新的全局初始状态 |
| `setInitialState` | `(state: any) => void` | 手动设置 `initialState` 的值，手动设置完毕会将 `loading` 置为 `false` |

## Qiankun 父子应用间通信

`@umi/max` 内置了 **Qiankun 微前端**插件 [`@umijs/plugin-qiankun`](https://github.com/umijs/umi-next/blob/master/packages/plugins/src/qiankun.ts)，当使用 `@umijs/plugin-model` 时，它允许微应用通过 `useModel('@@qiankunStateFromMaster')` 方法获取父应用传递给子应用的数据 Model，进而实现父子应用间的通信。

具体的使用方法请查阅[微前端的父子应用通信章节](./micro-frontend.md#父子应用通信)。

## API

### `useModel`

`useModel()` 是一个钩子函数，提供了使用 Model 的能力。它接受两个参数：

| 参数 | 类型 | 介绍 |
| --- | --- | --- |
| `namespace` | `String` | Model 文件的命名空间 |
| `updater` | `(model: any) => any` | 可选参数。传入一个函数，函数的返回值为当前组件中需要使用到的 Model 状态或数据，并作为 `useModel()` 方法的返回值。对优化组件性能具有重要意义。 |

```tsx
// src/components/AdminInfo/index.tsx
import { useModel } from 'umi';

export default () => {
  const { user, fetchUser } = useModel('useAdminModel', (model) => ({
    user: model.admin,
    fetchUser: model.fetchAdmin,
  }));

  return <>hello</>;
};
```
