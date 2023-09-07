---
order: 9
toc: content
---

# 微前端

`@umi/max` 内置了 **Qiankun 微前端**[插件](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts)，它可以一键启用 Qiankun 微前端开发模式，帮助您轻松地在 Umi 项目中集成 Qiankun 微应用，构建出一个生产可用的微前端架构系统。

关于 Qiankun 微前端的更多介绍请参阅[此页面](https://qiankun.umijs.org/zh/guide)。

## 微前端示例

![微前端示例](https://gw.alipayobjects.com/mdn/rms_655822/afts/img/A*TroZSp_cH0MAAAAAAAAAAAAAARQnAQ)

如上图所示：在父应用里，我们通过导航栏切换路由后，下方显示的内容来自于不同的子应用。子应用支持单独打开；子应用之间也支持任意的嵌套。

换一种更直观的理解方式：父应用和子应用其实都是**独立的前端项目**，父应用可以在内部引入子应用，子应用也可以在自己内部继续引入孙子应用，以此类推。

当应用能够作为子应用被其它应用引入的时候，它就成为了我们所说的微应用。

## 开始使用

:::success{title=🏆︎}

本教程假设您对什么是微前端，什么是 Qiankun 微应用，以及如何使用 Qiankun 微应用已经有了基本的了解。

:::

### 配置父应用

首先需要配置父应用，注册子应用的相关信息，这样父应用才能识别子应用并在内部引入。

注册子应用的方式主要有两种：

- 插件注册子应用。
- 运行时注册子应用。

#### 插件注册子应用

修改父应用的 Umi 配置文件，添加如下内容：

```ts
// .umirc.ts
export default {
  qiankun: {
    master: {
      apps: [
        {
          name: 'app1',
          entry: '//localhost:7001',
        },
        {
          name: 'app2',
          entry: '//localhost:7002',
        },
      ],
    },
  },
};
```

其中，`name` 为子应用的名称，在引入子应用时需要使用到它；`entry` 为子应用运行的 HTTP 地址；`master` 对象的完整 API 可[见此](#masteroptions)。

#### 运行时注册子应用

修改父应用的 Umi 配置文件，添加如下内容：

```ts
// .umirc.ts
export default {
  qiankun: {
    master: {},
  },
};
```

修改父应用的 `src/app.ts` 文件，导出 `qiankun` 对象：

```ts
// src/app.ts
export const qiankun = {
  apps: [
    {
      name: 'app1',
      entry: '//localhost:7001',
    },
    {
      name: 'app2',
      entry: '//localhost:7002',
    },
  ],
};
```

### 配置子应用

子应用需要导出必要的生命周期钩子，供父应用在适当的时机调用。

假设您的子应用项目**基于 Umi 开发**且**引入了 `qiankun` [插件](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts)**。如果没有，可以按照[此教程](https://qiankun.umijs.org/zh/guide/getting-started#%E5%BE%AE%E5%BA%94%E7%94%A8)进行配置。

修改子应用的 Umi 的配置文件，添加如下内容：

```ts
// .umirc.ts
export default {
  qiankun: {
    slave: {},
  },
};
```

这样，微前端插件会自动在项目中创建好 Qiankun 子应用所需的生命周期钩子和方法，Easy as a cake！

### 引入子应用

在父应用中引入子应用，插件提供了三种不同实现的方式：

- 路由绑定引入子应用。
- `<MicroApp />` 组件引入子应用。
- `<MicroAppWithMemoHistory />` 组件引入子应用。

#### 路由绑定引入子应用

手动配置 `.umirc.ts` 文件中的 `routes` 项，通过路由的方式绑定子应用。何时使用：

- 子应用包含完整的路由切换逻辑时。
- 父子应用路由相互关联时。

现在，我们想要在 `/app1/project` 和 `/app2` 路由分别加载子应用 `app1` 和 `app2`，可以配置父应用的路由如下：

```ts
// .umirc.ts
export default {
  routes: [
    {
      path: '/',
      component: '@/layouts/index.tsx',
      routes: [
        {
          path: '/app1',
          component: '@/layouts/app-layout.tsx',
          routes: [
            // 配置微应用 app1 关联的路由
            {
              // 带上 * 通配符意味着将 /app1/project 下所有子路由都关联给微应用 app1
              path: '/project/*',
              microApp: 'app1',
            },
          ],
        },
        // 配置 app2 关联的路由
        {
          path: '/app2/*',
          microApp: 'app2',
        },
      ],
    },
  ],
};
```

配置好后，子应用的路由 base 会在运行时被设置为主应用中配置的 `path`。

例如，在上面的配置中，我们指定了 app1 关联的 path 为 `/app1/project`，假如 app1 里有一个路由配置为 `/user`，当我们想在父应用中访问 `/user` 对应的页面时，浏览器的 url 需要是 `base + /user`，即 `/app1/project/user` 路径，否则子应用会因为无法匹配到正确的路由而渲染空白或 404 页面。

`qiankun` 插件拓展了 Umi 原有的路由对象，新增了 `microApp` 字段，它的值为注册子应用的 `name`。切换到对应路由后，Umi 将会使用 `<MicroApp />` 组件渲染此子应用，并替换原来路由的 `component`。

拓展后的 Umi 路由对象 API [可见此](#route)。

#### `<MicroApp />` 组件引入子应用

通过 `<MicroApp />` 组件加载（或卸载）子应用。何时使用：

- 子应用包含完整的路由切换逻辑时。
- 父子应用路由相互关联时。

现在，我们想在父应用的某个页面中引入子应用 `app1`，可以编写代码如下：

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" />;
}
```

使用该方式引入子应用时，父子应用的路由将一一对应。例如，当父应用路由为 `/some/page` 时，子应用路由同样为 `/some/page`。切换子应用路由时，父应用将同步切换。

如果父应用的路由包含前缀，可以通过配置 `base` 属性保证父子应用的路由正确对应。例如，父应用路由为 `/prefix/router-path/some/page` 时，我们希望子应用的路由为 `/some/page`，可以修改代码如下：

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" base="/prefix/router-path" />;
}
```

#### `<MicroAppWithMemoHistory />` 组件引入子应用

通过 `<MicroAppWithMemoHistory />` 组件加载（或卸载）子应用。何时使用：

- 仅使用子应用的指定路由时。
- 父子应用路由相互独立时。

`<MicroAppWithMemoHistory />` 组件是 `<MicroApp />` 组件的变体，您需要显式提供 `url` 属性作为子应用的路由。当父应用的路由发生变化时，子应用的路由**不会改变**。

现在，我们想在父应用的某个组件内部引入 `app2` 子应用，子应用的路由为 `/some/page`，可以编写代码如下：

```tsx
import { MicroAppWithMemoHistory } from 'umi';

export default function Page() {
  return <MicroAppWithMemoHistory name="app2" url="/some/page" />;
}
```

### 子应用之间跳转

如果子应用通过**路由绑定的方式**引入，在其它子应用的内部，可以使用 `<MicroAppLink />` 跳转到对应的路由。以子应用 `app1` 和 `app2` 为例：

```tsx
// 在 app1 中
import { MicroAppLink } from 'umi';

export default function Page() {
  return (
    <>
      {/* 跳转链接为 /app2/home */}
      <MicroAppLink name="app2" to="/home">
        <Button>go to app2</Button>
      </MicroAppLink>
    </>
  );
}
```

在上面的例子中，点击按钮后，父应用的路由变为 `/app2/home`，渲染子应用 `app2` 内部路由为 `/home` 的页面。同理，如果想要从子应用 app2 回到子应用 app1，可以编写代码如下：

```tsx
// 在 app2 中
import { MicroAppLink } from 'umi';

export default function Page() {
  return (
    <>
      {/* 跳转链接为 /app1/project/home */}
      <MicroAppLink name="app1" to="/home">
        <Button>go to app1</Button>
      </MicroAppLink>
    </>
  );
}
```

您也可以从子应用跳转到父应用的指定路由：

```tsx
// 在子应用中
import { MicroAppLink } from 'umi';

export default function Page() {
  return (
    <>
      {/* 跳转链接为 /table */}
      <MicroAppLink isMaster to="/table">
        <Button>go to master app</Button>
      </MicroAppLink>
    </>
  );
}
```

## 子应用生命周期

Qiankun 在 single-spa 的基础上实现了一些额外的生命钩子。按照微应用的生命周期顺序，Qiankun 支持的完整的生命钩子列表如下：

- `beforeLoad`，微应用**开始获取前**调用。最初，微应用为 `NOT_LOADED` 状态。
- [`load`](https://single-spa.js.org/docs/building-applications/#load)，微应用**获取完成时**调用。开始获取微应用时，微应用变成 `LOADING_SOURCE_CODE` 状态。若获取成功，微应用变成 `NOT_BOOTSTRAPPED` 状态；若获取失败，微应用变成 `LOAD_ERROR` 状态。
- [`bootstrap`](https://single-spa.js.org/docs/building-applications/#bootstrap)，微应用**初始化完成时**调用。开始初始化微应用时，微应用变成 `BOOTSTRAPPING` 状态。初始化完成时，微应用变成 `NOT_MOUNTED` 状态。
- `beforeMount`，微应用每次**开始挂载前**调用。
- [`mount`](https://single-spa.js.org/docs/building-applications/#mount)，微应用每次**开始挂载时**调用。微应用变成 `MOUNTING` 状态。
- `afterMount`，微应用每次**挂载完成时**调用。微应用变成 `MOUNTED` 状态。
- `beforeUnmount`，微应用每次**开始卸载前**调用。
- [`unmount`](https://single-spa.js.org/docs/building-applications/#unmount)，微应用每次**开始卸载时**调用。微应用变成 `UNMOUNTING` 状态。
- `afterUnmount`，微应用每次**卸载完成时**调用。微应用变成 `NOT_MOUNTED` 状态。
- [`unload`](https://single-spa.js.org/docs/building-applications/#unload)，微应用**卸载完成时**调用。微应用变成 `NOT_LOADED` 状态。

此外，还存在一个特殊的生命钩子 `update`，仅在使用 `<MicroApp />` 或 `<MicroAppWithMemoHistory />` 组件引入微应用时生效：状态为 `MOUNTED` 的微应用**手动刷新时**调用。开始更新时，微应用变成 `UPDATING` 状态；更新完成时，微应用变成 `MOUNTED` 状态。

您可以像这样手动刷新子应用：

```tsx
import { useRef } from 'react';
import { MicroApp } from 'umi';

export default function Page() {
  const microAppRef = useRef();

  // 执行此方法时，更新子应用
  const updateMicroApp = () => {
    microAppRef.current?.update();
  };

  return <MicroApp name="app1" ref={microAppRef} />;
}
```

当您需要在子应用的生命周期里添加一些自定义的逻辑时，既可以在父应用中进行全局配置，也可以在子应用中进行单独配置。

### 父应用配置生命周期钩子

在父应用的 `src/app.ts` 中导出 `qiankun` 对象进行全局配置，所有的子应用都将实现这些生命周期钩子：

```ts
// src/app.ts
export const qiankun = {
  lifeCycles: {
    // 所有子应用在挂载完成时，打印 props 信息
    async afterMount(props) {
      console.log(props);
    },
  },
};
```

### 子应用配置生命周期钩子

在子应用的 `src/app.ts` 中导出 `qiankun` 对象，实现生命周期钩子。子应用运行时仅支持配置 `bootstrap`、`mount` 和 `unmount` 钩子：

```ts
// src/app.ts
export const qiankun = {
  // 应用加载之前
  async bootstrap(props) {
    console.log('app1 bootstrap', props);
  },
  // 应用 render 之前触发
  async mount(props) {
    console.log('app1 mount', props);
  },
  // 应用卸载之后触发
  async unmount(props) {
    console.log('app1 unmount', props);
  },
};
```

## 父子应用通信

父子应用间的通信有两种实现的方法：

- 基于 `useModel()` 的通信。这是 Umi **推荐**的解决方案。
- 基于配置的通信。

### 基于 `useModel()` 的通信

该通信方式基于 [数据流](https://github.com/umijs/umi/blob/master/packages/plugins/src/model.ts) 插件，此插件已经内置于 `@umi/max` 解决方案当中。

该通信方式需要子应用**基于 Umi 开发**且**引入了该数据流插件**。

关于此插件的详细介绍可见[数据流指南](./data-flow)。

#### 主应用透传数据

如果通过路由的模式引入子应用，则需要在父应用的 `src/app.ts` 里导出一个名为 `useQiankunStateForSlave()` 的函数，该函数的返回值将传递给子应用：

```ts
// src/app.ts
export function useQiankunStateForSlave() {
  const [globalState, setGlobalState] = useState<any>({
    slogan: 'Hello MicroFrontend',
  });

  return {
    globalState,
    setGlobalState,
  };
}
```

如果通过组件的模式引入子应用，直接将数据以组件参数的形式传递给子应用即可：

```tsx
import { useState } from 'react';
import { MicroApp } from 'umi';

export default function Page() {
  const [globalState, setGlobalState] = useState<any>({
    slogan: 'Hello MicroFrontend',
  });

  return (
    <MicroApp
      name="app1"
      globalState={globalState}
      setGlobalState={setGlobalState}
    />
  );
}
```

#### 子应用消费数据

子应用会自动生成一个全局的 Model，其命名空间为 `@@qiankunStateFromMaster`。通过 `useModel()` 方法，允许子应用在任意组件中获取并消费父应用透传的数据，如下所示：

```tsx
import { useModel } from 'umi';

export default function Page() {
  const masterProps = useModel('@@qiankunStateFromMaster');
  return <div>{JSON.stringify(masterProps)}</div>;
}
```

或者可以通过高阶方法 `connectMaster()` 来获取并消费父应用透传的数据，如下所示：

```tsx
import { connectMaster } from 'umi';

function MyPage(props) {
  return <div>{JSON.stringify(props)}</div>;
}

export default connectMaster(MyPage);
```

子应用也可以在生命周期钩子中能够获取并消费得到的 `props` 属性，根据需求[实现对应的生命周期钩子](#子应用配置生命周期钩子)即可。

特别的，当父应用使用 `<MicroApp />` 或 `<MicroAppWithMemoHistory />` 组件的方式引入子应用时，会额外向子应用传递一个 `setLoading()` 方法，允许子应用在合适的时机执行，标记子应用加载为完成状态：

```tsx
const masterProps = useModel('@@qiankunStateFromMaster');
masterProps.setLoading(false);

// 或者
function MyPage(props) {
  props.setLoading(false);
}
connectMaster(MyPage);
```

当子应用挂载完成变成 `MOUNTED` 状态时，会自动标记为完成状态。

### 基于配置的通信

在配置父应用[注册子应用](#配置父应用)时，可以传入 `props` 属性，将数据传递给子应用。

例如，修改父应用 `src/app.ts` 的 `qiankun` 导出方法如下：

```ts
// src/app.ts
export const qiankun = {
  apps: [
    {
      name: 'app1',
      entry: '//localhost:7001',
      props: {
        accountOnClick: (event) => console.log(event),
        accountName: 'Alex',
        accountAge: 21,
      },
    },
  ],
};
```

子应用在生命周期钩子中能够获取并消费得到的 `props` 属性，根据需求[实现对应的生命周期钩子](#子应用配置生命周期钩子)即可。

## 自定义子应用

当启用子应用加载动画或错误捕获能力时，子应用接受一个额外的样式类 `wrapperClassName`，渲染的结果如下所示：

```tsx
<div style={{ position: 'relative' }} className={wrapperClassName}>
  <MicroAppLoader loading={loading} />
  <ErrorBoundary error={e} />
  <MicroApp className={className} />
</div>
```

### 子应用加载动画

启用此能力后，当子应用正在加载时，会自动显示加载动画。当子应用挂载完成变成 `MOUNTED` 状态时，加载状态结束，显示子应用内容。

#### 基于 antd 的加载动画

当您使用 antd 作为项目组件库时，可以向子应用传入 `autoSetLoading` 属性以开启子应用加载动画，插件将会自动调用 antd 的 [`<Spin />` 组件](https://ant.design/components/spin-cn/)作为加载组件。

如果通过路由的模式引入子应用，可以配置如下：

```ts
// .umirc.ts
export default {
  routes: [
    {
      path: '/app1',
      microApp: 'app1',
      microAppProps: {
        autoSetLoading: true,
      },
    },
  ],
};
```

如果通过组件的模式引入子应用，直接将 `autoSetLoading` 作为参数传入即可：

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" autoSetLoading />;
}
```

#### 自定义加载动画

如果您没有使用 antd 作为项目组件库，或希望覆盖默认的加载动画样式时，可以设置一个自定义的加载组件 `loader` 作为子应用的加载动画。

通过路由的模式引入的子应用，只支持在运行时配置，代码如下：

```tsx
// .app.tsx
import CustomLoader from 'src/components/CustomLoader';

export const qiankun = () => ({
  routes: [
    {
      path: '/app1',
      microApp: 'app1',
      microAppProps: {
        loader: (loading) => <CustomLoader loading={loading} />,
      },
    },
  ],
});
```

通过组件的模式引入子应用，直接将 `loader` 作为参数传入即可：

```tsx
import CustomLoader from '@/components/CustomLoader';
import { MicroApp } from 'umi';

export default function Page() {
  return (
    <MicroApp
      name="app1"
      loader={(loading) => <CustomLoader loading={loading} />}
    />
  );
}
```

其中，`loading` 为 `boolean` 类型参数，为 `true` 时表示仍在加载状态，为 `false` 时表示加载状态已结束。

如果项目中希望多个子应用使用统一的自定义加载动画，可以通过在主应用配置 `defaultLoader` 来完成

```ts
// .umirc.ts
qiankun: {
  master: {
    defaultLoader: '@/defaultLoader',
  },
},
```

其中，`defaultLoader` 为文件路径，统一约定放在 [src 目录](../guides/directory-structure.md#src-目录) 下，在 umi 中 `@` 即代表 `src` 目录。

`defaultLoader` 跟上述 `loader` 的实现一致，接收一个 `loading` 为 `boolean` 类型的参数。

```tsx
// defaultLoader.tsx
import { Spin } from 'antd';

export default function (loading: boolean) {
  return <Spin spinning={loading} />;
}
```

注意：`loader` 的优先级高于 `defaultLoader`。

### 子应用错误捕获

启用此能力后，当子应用加载出现异常时，会自动显示错误信息。

#### 基于 antd 的错误捕获组件

当您使用 antd 作为项目组件库时，可以向子应用传入 `autoCaptureError` 属性以开启子应用错误捕获能力，插件将会自动调用 antd 的 [`<Result />` 组件](https://ant.design/components/result-cn/)作为错误捕获组件。

如（文案语言会自动读取 umi locale 配置切换）：<img src="https://mdn.alipayobjects.com/huamei_zvchwx/afts/img/A*gAAVRrAJJNEAAAAAAAAAAAAADuWEAQ/original">

如果通过路由的模式引入子应用，可以配置如下：

```ts
// .umirc.ts
export default {
  routes: [
    {
      path: '/app1',
      microApp: 'app1',
      microAppProps: {
        autoCaptureError: true,
      },
    },
  ],
};
```

如果通过组件的模式引入子应用，直接将 `autoCaptureError` 作为参数传入即可：

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" autoCaptureError />;
}
```

#### 自定义错误捕获组件

如果您没有使用 antd 作为项目组件库，或希望覆盖默认的错误捕获组件样式时，可以设置一个自定义的组件 `errorBoundary` 作为子应用的错误捕获组件。

通过路由的模式引入的子应用，只支持在运行时配置，代码如下：

```tsx
// .app.tsx
import CustomErrorBoundary from '@/components/CustomErrorBoundary';

export const qiankun = () => ({
  routes: [
    {
      path: '/app1',
      microApp: 'app1',
      microAppProps: {
        errorBoundary: (error) => <CustomErrorBoundary error={error} />,
      },
    },
  ],
});
```

通过组件的模式引入子应用，将 `errorBoundary` 作为参数传入即可：

```tsx
import CustomErrorBoundary from '@/components/CustomErrorBoundary';
import { MicroApp } from 'umi';

export default function Page() {
  return (
    <MicroApp
      name="app1"
      errorBoundary={(error) => <CustomErrorBoundary error={error} />}
    />
  );
}
```

其中，`error` 为 `Error` 类型参数。

如果项目中希望多个子应用使用统一的自定义错误捕获组件，可以通过在主应用配置 `defaultErrorBoundary` 来完成

```ts
// .umirc.ts
qiankun: {
  master: {
    defaultErrorBoundary: '@/defaultErrorBoundary',
  },
},
```

其中，`defaultErrorBoundary` 为文件路径，统一约定放在 [src 目录](../guides/directory-structure.md#src-目录) 下，在 umi 中 `@` 即代表 `src` 目录。

`defaultErrorBoundary` 跟上述 `errorBoundary` 的实现一致，接收一个 `error` 为 `Error` 类型的参数。

```tsx
// defaultErrorBoundary.tsx
export default function (error: Error) {
  return <div>{error?.message}</div>;
}
```

注意：`errorBoundary` 的优先级高于 `defaultErrorBoundary`。

## 环境变量

如果您有一些不能显式编写在 `.umirc.ts` 或 `src/app.ts` 中的配置信息，可以将它们存放在环境变量文件中。例如编写父应用的环境变量文件 `.env` 如下：

```plaintext
INITIAL_QIANKUN_MASTER_OPTIONS="{\"apps\":[{\"name\":\"app1\",\"entry\":\"//localhost:7001\"},{\"name\":\"app2\",\"entry\":\"//localhost:7002\"}]}"
```

在内部，微前端插件会执行 `JSON.parse(process.env.INITIAL_QIANKUN_MASTER_OPTIONS)` 方法，然后将得到的结果与已有的配置信息合并。上面编写的环境变量，合并后相当于编写了如下配置信息：

```ts
export default {
  qiankun: {
    master: {
      apps: [
        {
          name: 'app1',
          entry: '//localhost:7001',
        },
        {
          name: 'app2',
          entry: '//localhost:7002',
        },
      ],
      // ... .umirc.ts 中其它的配置信息
    },
  },
};
```

需注意的是，当存在相同的配置项时，例如 `apps` 项，写在 `.umirc.ts` 中的配置项将**覆盖**环境变量中的配置项。

同理，对于子应用，可以编写环境变量 `.env` 文件如下：

```plaintext
INITIAL_QIANKUN_SLAVE_OPTIONS="{\"enable\":false}"
```

相当于编写了如下配置信息：

```ts
export default {
  qiankun: {
    slave: {
      enable: false,
      // ... .umirc.ts 中其它的配置信息
    },
  },
};
```

## API

### MasterOptions

| 属性 | 必填 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- |
| `enable` | 否 | 启用 Qiankun 微应用插件，设置为 `false` 时为不启用 | `boolean` | `undefined` |
| `apps` | 是 | 微应用配置 | [`App[]`](#app) | `undefined` |
| `routes` | 否 | 微应用运行时的路由 | [`Route[]`](#route) | `undefined` |
| `defaultErrorBoundary` | 否 | 子应用默认的错误捕获组件，值为文件路径 | `string` | - |
| `defaultLoader` | 否 | 子应用默认的加载动画，值为文件路径 | `string` | - |
| `sandbox` | 否 | 是否开启沙箱模式 | `boolean \| { strictStyleIsolation: boolean, experimentalStyleIsolation: boolean }` | `true` |
| `prefetch` | 否 | 是否启用微应用预加载 | `boolean \| 'all' \| string[] \| (( apps: RegistrableApp[] ) => { criticalAppNames: string[]; minorAppsName: string[] })` | `true` |

关于沙箱和预加载的介绍可见[此页面](https://qiankun.umijs.org/zh/api/#startopts)。

### SlaveOptions

| 属性 | 必填 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- |
| `enable` | 否 | 启用 Qiankun 微应用插件，设置为 `false` 时为不启用 | `boolean` | `undefined` |

### App

| 属性 | 必填 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- |
| `name` | 是 | 微应用的名称 | `string` |
| `entry` | 是 | 微应用的 HTML 地址 | `string` | `{ script: string[], styles: [] }` |
| `credentials` | 否 | 拉取微应用时同时拉取 Cookies，详见[此介绍](https://qiankun.umijs.org/zh/faq#%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3%E6%8B%89%E5%8F%96%E5%BE%AE%E5%BA%94%E7%94%A8-entry-%E6%97%B6-cookie-%E6%9C%AA%E6%90%BA%E5%B8%A6%E7%9A%84%E9%97%AE%E9%A2%98) | `boolean` | `false` |
| `props` | 否 | 父应用传递给微应用的数据，详见[父子应用通信章节](#父子应用通信) | `object` | `{}` |

### Route

| 属性 | 必填 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- |
| `path` | 是 | 路由 PATH | `string` |
| `microApp` | 是 | 关联的微应用名称 | `string` |
| `microAppProps` | 否 | 微应用的配置 | [`MicroAppProps`](#microappprops) | `{}` |

### MicroAppProps

| 属性 | 必填 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- |
| `autoSetLoading` | 否 | 自动设置微应用的加载状态 | `boolean` | `false` |
| `loader` | 否 | 自定义的微应用加载状态组件 | `(loading) => React.ReactNode` | `undefined` |
| `autoCaptureError` | 否 | 自动设置微应用的错误捕获 | `boolean` | `false` |
| `errorBoundary` | 否 | 自定义的微应用错误捕获组件 | `(error: any) => React.ReactNode` | `undefined` |
| `className` | 否 | 微应用的样式类 | `string` | `undefined` |
| `wrapperClassName` | 否 | 包裹微应用加载组件、错误捕获组件和微应用的样式类，仅在启用加载组件或错误捕获组件时有效 | `string` | `undefined` |

## FAQ

### 子应用的生命周期钩子加载了，但是页面没有渲染

如果页面没有报错，且通过查看 DOM 发现子应用的根节点已经有了，只是内容是空，这种基本可以确定是因为当前 url 没有匹配到子应用的任何路由导致的。

比如我们在主应用中配置了：

```js
{
  path: '/app1',
  microApp: 'app1',
}
```

子应用的路由配置是：

```js
{
  path: '/user',
  component: './User',
}
```

那么我们必须通过 `/app1/user` 路径才能正常的访问到子应用的 user 页面。
