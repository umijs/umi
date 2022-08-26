import { Tabbed, Message } from 'umi';

# Module Federation 插件

在 Umi 项目使用 Module Federation 功能。

## 配置

### 使用远端模块配置

<Tabbed>

@umijs/max 项目

```ts
// .umirc.ts
import { defineConfig } from '@umijs/max';

// 提取变量是为了和 MFSU 配合使用保持配置一致
const shared = {
  react: {
    singleton: true,
    eager: true,
  },
  'react-dom': {
    singleton: true,
    eager: true,
  },
};

export default defineConfig({
  // 已经内置 Module Federation 插件, 直接开启配置即可
  mf: {
    remotes: [
      {
        // 可选，未配置则使用当前 remotes[].name 字段
        aliasName: 'mfNameAlias',
        name: 'theMfName',
        entry: 'https://to.the.remote.com/remote.js',
      },
    ],

    // 配置 MF 共享的模块
    shared,
  },
  mfsu: false, // 如何开启 mfsu 见下一节
});
```

普通 Umi 项目

```ts
// .umirc.ts
import { defineConfig } from 'umi';

// 提取变量是为了和 MFSU 配合使用保持配置一致
const shared = {
  react: {
    singleton: true,
    eager: true,
  },
  'react-dom': {
    singleton: true,
    eager: true,
  },
};

export default defineConfig({
  plugins: ['@umijs/plugins/dist/mf'], // 引入插件
  mf: {
    remotes: [
      {
        // 可选，未配置则使用当前 remotes[].name 字段
        aliasName: 'mfNameAlias',
        name: 'theMfName',
        entry: 'https://to.the.remote.com/remote.js',
      },
    ],

    // 配置 MF 共享的模块
    shared,
  },
  mfsu: false, // 如何开启 mfsu 见下一节
});
```

</Tabbed>

在项目中就可以使用 `import XXX from 'mfNameAlias/XXXX'` 来使用远端模块的内容了。

#### 运行时远端模块加载

如果需要在运行时（根据运行的环境）决定加载远端模块的地址，可以采用如下方式配置：

```ts
// .umirc.ts
defineConfig({
  mf: {
    remotes: [
      {
        name: 'theMfName',
        keyResolver: `(function(){ 
                    try { 
                        return window.injectInfo.env || 'PROD'
                    } catch(e) { 
                        return 'PROD'} 
                    })()`,
        entries: {
          PRE: 'http://pre.mf.com/remote.js',
          PROD: 'http://produ.mf.com/remote.js',
          TEST: 'http://test.dev.mf.com/remote.js',
          DEV: 'http://127.0.0.1:8000/remote.js',
        },
      },
    ],
    shared,
  },
});
```

- 使用运行时远端模块加载逻辑时，不要配置 `remotes[]#entry` , 插件会优先使用该字段。
- `keyResolver` 用于在运行时决定使用 `entries` 哪个 key; 推荐使用 _立即调用函数表达式_ 的形式，可以在函数中实现较复杂的功能。不支持异步的函数。
- `keyResolver` 也可以使用静态的值，配置形式 `keyResolver: '"PROD"'`

### 导出远端模块配置

当前项目对外提供远端模块，模块名使用如下配置字段

```ts
// .umirc.ts
// 提取变量是为了和 MFSU 配合使用保持配置一致
const remoteMFName = 'remoteMFName';

defineConfig({
  mf: {
    name: remoteMFName,

    // 可选，远端模块库类型, 如果模块需要在乾坤子应用中使用建议配置示例的值，
    // 注意这里的 name 必须和最终 MF 模块的 name 一致
    // library: { type: "window", name: "exportMFName" },
  },
});
```

<Message emoji="🚨">
配置的模块名必须为一个合法的 Javascript 变量名！
</Message>

导出的模块按照约定，将源代码目录下的 `exposes` 一级子目录名作为导出项，导出文件为该目录下的 index 文件，举例

```txt
src/exposes/
├── Button
│   └── index.jsx
├── Head
│   └── index.ts
└── Form
    └── index.tsx
```

对应的 Module Federation 的 exposes 为

```js
{
  './Button': 'src/exposes/Button/index.jsx',
  './Button': 'src/exposes/Head/index.ts',
  './Form'  : 'src/exposes/Form/index.tsx',
}
```

## 运行时 API

### 何时需要使用运行时 API ？

采用配置的方式结合`import()`已经可以方便的使用 Module Federation 功能。如果你有以下需求就应该考虑使用运行时 API。

- 远端模块的加载失败时，页面需要使用兜底组件
- 远端模块的加载的地址无法通过同步函数来确定（需要异步调用）
- 远端模块的加载的地址和模块名需要在运行时才能确定

### safeMfImport

有兜底的远端模块加载函数，接口定义如下：

```ts
safeMfImport(moduleSpecifier: string, fallback: any): Promise<any>
```

结合 `React.lazy` 可以实现远端模块的懒加载

```ts
import { safeMfImport } from '@umijs/max';
import React, { Suspense } from 'react';

const RemoteCounter = React.lazy(() => {
  return safeMfImport('remoteCounter/Counter', { defualt: () => 'Fallback' });
});

export default () => {
  return (
    <Suspense fallback="loading">
      <RemoteCounter />
    </Suspense>
  );
};
```

<Message emoji="🚨">
- 注意这里需要将兜底的***组件***包装到对象的`default`字段上来模拟一个模块。
- `remoteCounter/Counter` 需要和配置对应。
</Message>

[实例代码](https://github.com/umijs/umi/blob/master/examples/mf-host/src/pages/safe-import.tsx)

### safeRemoteComponent

该 API 为封装了 `safeMfImport` 的高阶组件, 接口定义如下：

```ts
safeRemoteComponent<T extends React.ComponentType<any>>
  (opts: {
      moduleSpecifier:string;
      fallbackComponent: React.ComponentType<any>;  // 远端组件加载失败的兜底组件
      loadingElement: React.ReactNode ;             // 组件加载中的 loading 展示
    } ): T
```

示例:

```ts
const RemoteCounter = safeRemoteComponent<React.FC<{ init?: number }>>({
  moduleSpecifier: 'remoteCounter/Counter',
  fallbackComponent: () => 'fallbacked',
  loadingElement: 'Loading',
});

export default () => {
  return (
    <div>
      <RemoteCounter init={808} />
    </div>
  );
};
```

[示例代码](https://github.com/umijs/umi/blob/master/examples/mf-host/src/pages/safe-remote-component.tsx)

### rawMfImport

加载远端模块，接口如下。

```ts
rawMfImport(opts: {
  entry: string;
  remoteName: string;
  moduleName: string;
}): Promise<any>
```

示例

```ts
const RemoteCounter = React.lazy(() => {
  return rawMfImport({
    entry: 'http://localhost:8001/remote.js',
    moduleName: 'Counter',
    remoteName: 'remoteCounter',
  });
});
```

[示例代码](https://github.com/umijs/umi/blob/master/examples/mf-host/src/pages/raw-mf-import.tsx)

### safeRemoteComponentWithMfConfig

封装了`rawMfImport`的 高阶组件：

```ts
type RawRemoteComponentOpts ={
  mfConfig:{
    entry:string;
    remoteName: string;
    moduleName: string;
  };
  fallbackComponent: ComponentType<any>;
  loadingElement: ReactNode;
}
safeRemoteComponentWithMfConfig<T extends ComponentType<any>>(opts: RawRemoteComponentOpts): T
```

示例

```ts
const RemoteCounter = safeRemoteComponentWithMfConfig<
  React.FC<{ init?: number }>
>({
  mfConfig: {
    entry: 'http://localhost:8001/remote.js',
    moduleName: 'Counter',
    remoteName: 'remoteCounter',
  },
  fallbackComponent: () => 'raw Fallback',
  loadingElement: 'raw Loading',
});

export default () => {
  return <RemoteCounter />;
};
```

[示例代码](https://github.com/umijs/umi/blob/master/examples/mf-host/src/pages/raw-mf-component.tsx)

### registerMfRemote

动态的注册 Module Federation 模块远端配置。

```ts
type MFModuleRegisterRequest = { entry: string; remoteName: string; aliasName?:string; }
registerMfRemote (opts: MFModuleRegisterRequest): void
```

使用 `safeMfImport` 或者 `safeRemoteComponent` 时，`moduleSpecifier` 须是已经配置的远端模块。而 `rawMfImport` 的调用略啰嗦，可以使用 `registerMfRemote` 先注册，然后通过简洁的 `safeMfImport` 和 `safeRemoteComponent`。

```ts
registerMfRemote({
  aliasName: 'registered',
  remoteName: 'remoteCounter',
  entry: 'http://127.0.0.1:8001/remote.js',
});

const RemoteCounter = React.lazy(() => {
  return safeMfImport('registered/Counter', { defualt: null });
});
```

[示例代码](https://github.com/umijs/umi/blob/master/examples/mf-host/src/pages/register-then-import.tsx)

## 和 MFSU 一起使用

关闭 MFSU 后使用 MF 插件时，编译速度会大大下降。需要在开启 MF 插件后仍然使用 MFSU 功能请仔细阅读本部分后再配置开启。

假设我们采用了如下 mf 插件的配置

```ts
// .umirc.ts
const shared = {
  react: {
    singleton: true,
    eager: true,
  },
  'react-dom': {
    singleton: true,
    eager: true,
  },
};
const remoteMFName = 'remoteMFName';

export default defineConfig({
  mf: {
    name: remoteMFName,
    remotes: [
      {
        name: 'remote1',
        entry: 'https://to.the.remote.com/remote.js',
      },
      {
        aliasName: 'aliasRemote',
        name: 'remote2',
        entry: 'https://to.the.remote.com/remote2.js',
      },
    ],
    shared,
  },
});
```

那么对应的 MFSU 的配置如下：

```ts
// .umirc.ts
export default defineConfig({
  mfsu: {
    // 重命名 mfsu 远端模块名称, 需要全局唯一的名字，防止两个启用 mf 的项目模块名冲突
    mfName: 'mfsu_global_uniq_name',

    // 本项目导出的 MF 模块的名称
    remoteName: remoteMFName,

    // 所有在项目中使用的 MF 模块的名称
    remoteAliases: ['remote1', 'aliasRemote'],

    // 需要和 mf 插件的值保证统一
    shared,
  },
});
```
