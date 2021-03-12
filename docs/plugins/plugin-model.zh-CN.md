# @umijs/plugin-model

一种基于 `hooks` 范式的简易数据管理方案（部分场景可以取代 `dva`），通常用于中台项目的全局共享数据。

我们都知道自定义 `hooks` 是逻辑复用的利器，但我们也知道它不能复用状态，就和 `react` 内置的 `hooks` 一样，每次调用产生的状态都是相互隔离、无关的。那么，在业务开发中，如果我们需要提取的逻辑和状态都希望能够在多个组件中『共享』，就像其他数据流管理工具（`dva`, `mobx`）一样，`@umijs/plugin-model` 就是一个不错的选择。

## 启用方式

`src/models` 目录下有 hooks model 时启用。

## 介绍

我们约定在 `src/models` 目录下的文件为项目定义的 model 文件。每个文件需要默认导出一个 function，该 function 定义了一个 Hook，不符合规范的文件我们会过滤掉。

文件名则对应最终 model 的 name，你可以通过插件提供的 API 来消费 model 中的数据。

所谓 hooks model 文件，就是自定义 `hooks` 模块，没有任何需要使用者关注的黑魔法。请看示例：

**src/models/useAuthModel.js**

```js
import { useState, useCallback } from 'react';

export default function useAuthModel() {
  const [user, setUser] = useState(null);

  const signin = useCallback((account, password) => {
    // signin implementation
    // setUser(user from signin API)
  }, []);

  const signout = useCallback(() => {
    // signout implementation
    // setUser(null)
  }, []);

  return {
    user,
    signin,
    signout,
  };
}
```

> 使用者书写的就是一个普通的自定义 `hooks`，但 `@umijs/plugin-model` 把其中的状态变成了『全局状态』，多个组件中使用该 `model` 时，拿到的同一份状态。

### 在组件中使用 model

转到[API/useModel](#usemodel)

## 配置

该插件无配置项。

## API

### useModel

`useModel` 是一个 Hook，提供消费 Model 的能力，使用示例如下：

```js
import { useModel } from 'umi';

export default () => {
  const { user, fetchUser } = useModel('user', (model) => ({
    user: model.user,
    fetchUser: model.fetchUser,
  }));
  return <>hello</>;
};
```

`useModel` 有两个参数，`namespace` 和 `updater`。

- `namespace` - 就是 hooks model 文件的文件名，如上面例子里的 `useAuthModel`
- `updater` - 可选参数。在 hooks model 返回多个状态，但使用组件仅引用了其中部分状态，并且希望仅在这几个状态更新时 rerender 时使用（性能相关）。
