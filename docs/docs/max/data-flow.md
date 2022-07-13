import { Message } from 'umi';

# 数据流

`@umi/max` 内置了**数据流管理**[插件](https://github.com/umijs/umi/blob/master/packages/plugins/src/model.ts)，它是一种基于 `hook` 范式的轻量级数据管理方案，可以在 Umi 项目中管理全局的共享数据。

## 开始使用

### Model 和命名空间

所谓 Model，就是一个[自定义的 `hook`](https://zh-hans.reactjs.org/docs/hooks-custom.html)，没有任何使用者需要关注的“黑魔法”。在命名 Model 文件时，建议遵循 React 官方的 `hook` 命名规范，以 `use` 开头。

数据流管理插件采用约定式目录结构，我们约定在 `src/models`, `src/pages/xxx/models`目录，和 `src/pages/xxx/model.{js,jsx,ts,tsx}` 文件中引入 Model 文件。

Model 文件允许使用 `.js`，`.jsx`，`.ts` 和 `.tsx` 四种后缀格式，其文件名将成为它的**命名空间（namespace）**。当我们需要获取某个 Model 中的全局数据时，调用它的命名空间即可。

命名空间生成规则如下：

| 路径 | 命名空间 | 说明 |
| :--- |:--- | :--- |
| `src/models/count.ts` | `count` | `src/models` 目录下不支持目录嵌套定义 model |
| `src/pages/pageA/model.ts` | `pageA.model` |  |
| `src/pages/pageB/models/product.ts` | `pageB.product` |  |
| `src/pages/pageB/models/fruit/apple.ts` | `pageB.fruit.apple` |  `pages/xxx/models` 下 model 定义支持嵌套定义 |

### 创建 Model

编写一个**默认导出**的函数：

```ts
// src/models/useUser.ts
export default () => {
  const user = {
    username: 'umi',
  };

  return { user };
};
```

这就是一个 Model。插件所做的工作就是将其中的状态或数据变成了**全局数据**，不同的组件在使用该 Model 时，拿到的是同一份状态或数据。

<Message type="warning">
Model 文件需要默认导出一个函数，此函数为一个 React 的自定义 `hook`。对于不符合此规范的文件，将会被过滤掉，并无法通过命名空间调用。
</Message>

Model 中允许使用其它 `hook`，以计数器为例：

```ts
// src/models/useCounter.ts
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
// src/models/useUser.ts
import { useState, useEffect } from 'react';
import { getUser } from '@/services/user';

export default () => {
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

如果您在项目中使用了 [ahooks](https://ahooks.js.org)，则可以像这样组织您的代码：

```ts
// src/models/useUser.ts
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

现在，您想要在某个组件中使用 Model 中存储的全局状态或数据，只需要调用 `useModel()` 这一钩子函数。以用户信息为例：

```tsx
// src/components/Username/index.tsx
import { useModel } from 'umi';

export default () => {
  const { user, loading } = useModel('useUser');

  return (
    {loading ? <></>: <div>{user.username}</div>}
  );
}
```

其中，`useModel()` 方法传入的参数为 Model 的**命名空间**。

<Message>
如果您使用 VSCode 作为 Umi 项目开发的 IDE，推荐搭配[此插件](https://marketplace.visualstudio.com/items?itemName=litiany4.umijs-plugin-model)使用。它允许您快速跳转到定义 Model 的文件：

![vscode - @umijs/plugin-model 插件演示](https://gw.alipayobjects.com/zos/antfincdn/WcVbbF6KG2/1577073518336-afe6f03d-f817-491a-848a-5feeb4ecd72b.gif)

</Message>

## 性能优化

`useModel()` 方法可以接受可选的第二个参数，当组件只需要使用 Model 中的部分参数，而对其它参数的变化不感兴趣时，可以传入一个函数进行过滤。以实现计数器的操作按钮为例：

```tsx
// src/components/CounterActions/index.tsx
import { useModel } from 'umi';

export default () => {
  const { add, minus } = useModel('useCounter', (model) => ({
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

`@umi/max` 内置了**全局初始状态管理**[插件](https://github.com/umijs/umi/blob/master/packages/plugins/src/initial-state.ts)，允许您快速构建并在组件内获取 Umi 项目全局的初始状态。

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

需注意的是，在第一次拿到全局初始状态之前，Umi **不会渲染**页面的其它部分。直到 `getInitialState()` 方法执行完毕返回一个值后，其它组件才会开始渲染。这确保了所有插件或组件都能拿到全局初始状态，并根据初始状态履行自己应尽的职责。

任何插件和您定义的组件都可以通过 `useModel('@@initialState')` 直接获取到这份全局的初始状态，如下所示：

```tsx
import { useModel } from 'umi';

export default () => {
  const { initialState, loading, error, refresh, setInitialState } =
    useModel('@@initialState');
  return <>{initialState}</>;
};
```

下表介绍了这些属性的具体作用：

| 对象属性 | 类型 | 介绍 |
| --- | --- | --- |
| `initialState` | `any` | `getInitialState()` 方法的返回值 |
| `loading` | `boolean` | `getInitialState()` 或 `refresh()` 方法是否正在进行中。在首次获取到初始状态前，页面其他部分的渲染都会**被阻止** |
| `error` | `Error` | 如果 `getInitialState()` 方法运行时报错，报错的错误信息 |
| `refresh` | `() => void` | 重新执行 `getInitialState()` 方法，并获取新的全局初始状态 |
| `setInitialState` | `(state: any) => void` | 手动设置 `initialState` 的值，手动设置完毕会将 `loading` 置为 `false` |

## Qiankun 父子应用间通信

`@umi/max` 内置了 **Qiankun 微前端**[插件](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts)，当使用数据流插件时，它允许微应用通过 `useModel('@@qiankunStateFromMaster')` 方法获取父应用传递给子应用的数据 Model，进而实现父子应用间的通信。

具体的使用方法请查阅[微前端的父子应用通信章节](./micro-frontend#父子应用通信)。

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
  const { user, fetchUser } = useModel('useAdmin', (model) => ({
    user: model.admin,
    fetchUser: model.fetchAdmin,
  }));

  return <>Hello, {user.username}!</>;
};
```
