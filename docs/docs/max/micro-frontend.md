import { Message } from 'umi';

# 微前端

`@umi/max` 内置了 **Qiankun 微前端**[插件](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts)，它可以一键启用 Qiankun 微前端开发模式，帮助您轻松地在 Umi 项目中集成 Qiankun 微应用，构建出一个生产可用的微前端架构系统。

关于 Qiankun 微前端的更多介绍请参阅[此页面](https://qiankun.umijs.org/zh/guide)。

## 微前端示例

![微前端示例](https://gw.alipayobjects.com/mdn/rms_655822/afts/img/A*TroZSp_cH0MAAAAAAAAAAAAAARQnAQ)

如上图所示：在父应用里，我们通过导航栏切换路由后，下方显示的内容来自于不同的子应用。子应用支持单独打开；子应用之间也支持任意的嵌套。

换一种更直观的理解方式：父应用和子应用其实都是**独立的前端项目**，父应用可以在内部引入子应用，子应用也可以在自己内部继续引入孙子应用，以此类推。

当应用能够作为子应用被其它应用引入的时候，它就成为了我们所说的微应用。

## 开始使用

<Message type="success">
本教程假设您对什么是微前端，什么是 Qiankun 微应用，以及如何使用 Qiankun 微应用已经有了基本的了解。
</Message>

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

假设您的子应用项目**基于 Umi** 开发且**引入了 `qiankun` [插件](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts) **。假如没有，可以按照[此教程](https://qiankun.umijs.org/zh/guide/getting-started#%E5%BE%AE%E5%BA%94%E7%94%A8)进行配置。

修改子应用的 Umi 的配置文件，添加如下内容：

```ts
// .umirc.ts
export default {
  qiankun: {
    slave: {},
  },
};
```

这样，微前端插件会自动在项目中创建好 Qiankun 子应用所需的生命周期钩子和方法，Easy as a cake!

我们还可以对子应用进行进一步的配置，例如在子应用的生命周期里调用某些方法，在[此章节](#子应用生命周期)介绍。

### 引入子应用

最后，在父应用中引入子应用，有三种实现的方式：

- 路由绑定引入子应用。
- `<MicroApp />` 组件引入子应用。
- `<MicroAppWithMemoHistory />` 组件引入子应用。

#### 路由绑定引入子应用

基于 [Umi 路由](https://umijs.org/docs/guides/routes)绑定子应用。

您需要手动配置 `.umirc.ts` 文件中的 `routes` 项以通过路由的方式绑定子应用。如果您更倾向于约定式路由模式，请考虑[使用组件的方式](#microapp--组件引入子应用)引入子应用。

现在，我们想要在 `/app1/project` 和 `/app2` 路由分别加载 `app1` 和 `app2` 子应用，可以配置父应用的 Umi 路由如下：

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
          component: '@/pages/app1/index.tsx',
          routes: [
            // 配置微应用 app1 关联的路由
            {
              // 带上 * 通配符意味着将 /app1/project 下所有子路由都关联给微应用 app1
              path: '/app1/project/*',
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

我们拓展了 Umi 原有的路由对象，来实现引入子应用。其中，`microApp` 的值为子应用的名称，切换到该路由后，Umi 将会获取并渲染此子应用，并替换原来 Umi 路由对象的 `component` 属性。拓展后的 Umi 路由对象 API 可[见此](#route)。

配置好后，子应用的路由将基于当前的路由 `path`。例如，当父应用路由切换为 `/app1/project/info`，子应用 `app1` 的路由变为 `/info`。

#### `<MicroApp />` 组件引入子应用

基于组件加载（或卸载）子应用。

现在，我们想在父应用的某个组件中引入 `app1` 子应用，则可以编写代码如下：

```tsx
import { MicroApp } from 'umi';

export default () => {
  return <MicroApp name="app1" />;
};
```

使用该方式引入子应用时，父子应用的路由将一一对应，例如当父应用路由为 `/some/page` 时，子应用路由同样变为 `/some/page`。

如果父应用的路由包含前缀，或者当前所在的页面包含其它路由路径时，应当手动处理子应用的路由，保证父子应用的路由正确对应。

例如当父应用路由为 `/prefix/router-path/some/page` 时，我们希望子应用的路由为 `/some/page`，则可以修改代码如下：

```tsx
<MicroApp name="app1" basename="/prefix/router-path" />
```

需注意的是，在 `<MicroApp />` 组件之中并不存在 `basename` 属性，这里的 `basename` 只是传递给子应用的参数。您需要在子应用中**自行处理**该参数，确保当父应用路由改变时，子应用能够切换到对应的页面。

例如，当您的子应用也基于 Umi 开发时，可以在子应用的 `src/app.ts` 文件中导出 `qiankun` 对象，获取父应用传入的 `basename` 属性，最后通过 Umi 提供的 `setCreateHistoryOptions()` 方法在运行时修改子应用的路由前缀。

基于 `qiankun` [插件](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts)时，代码实现如下：

```ts
// src/app.ts
import { setCreateHistoryOptions } from 'umi';

export const qiankun = {
  async bootstrap(props: any) {
    const basename = props?.basename;
    if (basename) setCreateHistoryOptions({ basename });
  },
};
```

不使用任何插件时，代码实现如下：

```ts
// src/app.ts
import { setCreateHistoryOptions } from 'umi';

export async function bootstrap(props: any) {
  const basename = props?.basename;
  if (basename) setCreateHistoryOptions({ basename });
}
```

#### `<MicroAppWithMemoHistory />` 组件引入子应用

基于组件加载（或卸载）子应用。

`<MicroAppWithMemoHistory />` 组件是 `<MicroApp />` 组件的变体，它接受 `<MicroApp />` 的所有参数。

不同的是，您需要显式提供 `url` 作为子应用的路由。当父应用的路由发生变化时，子应用的路由**不会**改变。

现在，我们想在父应用的某个组件中引入 `app2` 子应用，子应用内部的路由为 `/some/page`，则可以编写代码如下：

```tsx
import { MicroAppWithMemoHistory } from 'umi';

export default () => {
  return <MicroAppWithMemoHistory name="app2" url="/some/page" />;
};
```

只有当 `url` 的值发生变化时，子应用的路由才会改变。

当您需要在子应用当中嵌套孙子应用时，使用该组件是一个不错的选择。

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
- [`unload`](https://single-spa.js.org/docs/building-applications/#unload)，微应用**卸下完成时**调用。微应用变成 `NOT_LOADED` 状态。

此外，还存在一个特殊的生命钩子 `update`，仅在使用 `<MicroApp />` 或 `<MicroAppWithMemoHistory />` 组件引入微应用时生效：状态为 `MOUNTED` 的微应用**手动更新时**调用。开始更新时，微应用变成 `UPDATING` 状态；更新完成时，微应用变成 `MOUNTED` 状态。

您可以像这样更新子应用：

```tsx
import React, { useRef } from 'react';
import { MicroApp } from 'umi';

export default () => {
  const microAppRef = useRef();

  // 执行此方法时，更新子应用
  const updateMicroApp = () => {
    microAppRef.current.update();
  };

  return <MicroApp name="app1" ref={microAppRef} />;
};
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

在子应用的 `src/app.ts` 中导出 `qiankun` 对象，实现生命周期钩子：

```ts
// src/app.ts
export const qiankun = {
  // 子应用在挂载完成时，打印 props 信息
  async afterMount(props) {
    console.log(props);
  },
};
```

## 父子应用通信

父子应用间的通信有两种实现的方法：

- 基于 `useModel()` 的通信。这是 Umi **推荐**的解决方案。
- 基于配置的通信。

### 基于 `useModel()` 的通信

该通信方式基于 [数据流](https://github.com/umijs/umi/blob/master/packages/plugins/src/model.ts) 插件，此插件已经内置于 `@umi/max` 解决方案当中。

该通信方式需要子应用**基于 Umi** 开发且**引入了该数据流插件**。

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
import React, { useState } from 'react';
import { MicroApp } from 'umi';

export default () => {
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
};
```

#### 子应用消费数据

子应用会自动生成一个全局的 Model，其命名空间为 `@@qiankunStateFromMaster`。通过 `useModel()` 方法，允许子应用在任意组件中获取并消费父应用透传的数据，如下所示：

```tsx
import { useModel } from 'umi';

export default () => {
  const masterProps = useModel('@@qiankunStateFromMaster');
  return <div>{JSON.stringify(masterProps)}</div>;
};
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

export default () => {
  return <MicroApp name="app1" autoSetLoading />;
};
```

#### 自定义加载动画

如果您没有使用 antd 作为项目组件库，或希望覆盖默认的加载动画样式时，可以设置一个自定义的加载组件 `loader` 作为子应用的加载动画。

如果通过路由的模式引入子应用，可以配置如下：

```tsx
// .umirc.ts
import CustomLoader from 'src/components/CustomLoader';

export default {
  routes: [
    {
      path: '/app1',
      microApp: 'app1',
      microAppProps: {
        loader: (loading) => <CustomLoader loading={loading} />,
      },
    },
  ],
};
```

如果通过组件的模式引入子应用，直接将 `loader` 作为参数传入即可：

```tsx
import CustomLoader from '@/components/CustomLoader';
import { MicroApp } from 'umi';

export default () => {
  return (
    <MicroApp
      name="app1"
      loader={(loading) => <CustomLoader loading={loading} />}
    />
  );
};
```

其中，`loading` 为 `boolean` 类型参数，为 `true` 时表示仍在加载状态，为 `false` 时表示加载状态已结束。

### 子应用错误捕获

启用此能力后，当子应用加载出现异常时，会自动显示错误信息。

#### 基于 antd 的错误捕获组件

当您使用 antd 作为项目组件库时，可以向子应用传入 `autoCaptureError` 属性以开启子应用错误捕获能力，插件将会自动调用 antd 的 [`<Result />` 组件](https://ant.design/components/result-cn/)作为错误捕获组件。

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

export default () => {
  return <MicroApp name="app1" autoCaptureError />;
};
```

#### 自定义错误捕获组件

如果您没有使用 antd 作为项目组件库，或希望覆盖默认的错误捕获组件样式时，可以设置一个自定义的组件 `errorBoundary` 作为子应用的错误捕获组件。

如果通过路由的模式引入子应用，可以配置如下：

```tsx
// .umirc.ts
import CustomErrorBoundary from '../src/components/CustomErrorBoundary';

export default {
  routes: [
    {
      path: '/app1',
      microApp: 'app1',
      microAppProps: {
        errorBoundary: (error) => <CustomErrorBoundary error={error} />,
      },
    },
  ],
};
```

如果通过组件的模式引入子应用，直接将 `errorBoundary` 作为参数传入即可：

```tsx
import CustomErrorBoundary from '@/components/CustomErrorBoundary';
import { MicroApp } from 'umi';

export default () => {
  return (
    <MicroApp
      name="app1"
      errorBoundary={(error) => <CustomErrorBoundary error={error} />}
    />
  );
};
```

其中，`error` 为 `Error` 类型参数。

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
