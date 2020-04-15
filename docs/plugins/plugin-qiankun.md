---
translateHelp: true
---

# @umijs/plugin-qiankun

Umi plugin for [qiankun](https://github.com/umijs/qiankun).

[![NPM version](https://img.shields.io/npm/v/@umijs/plugin-qiankun.svg?style=flat)](https://npmjs.org/package/@umijs/plugin-qiankun) [![Build Status](https://img.shields.io/travis/umijs/umi-plugin-qiankun.svg?style=flat)](https://travis-ci.org/umijs/umi-plugin-qiankun) [![NPM downloads](http://img.shields.io/npm/dm/@umijs/plugin-qiankun.svg?style=flat)](https://npmjs.org/package/@umijs/plugin-qiankun)

## 启用方式

配置 `qiankun` 开启。

## 介绍

Umi 应用一键开启 [qiankun](https://github.com/umijs/qiankun) 微前端模式。 

## Examples

导航是主应用，App1/App2 是子应用，App1/App2 也支持单独打开。

![](https://img.alicdn.com/tfs/TB1ZMxEwKH2gK0jSZJnXXaT1FXa-1040-619.gif)

```bash
$ yarn
$ yarn build
$ cd packages/plguin-qiankun && yarn start
```

## Features

- ✔︎ 基于 qiankun
- ✔︎ 支持主应用和子应用都用 umi
- ✔︎ 支持通过 `<MicroApp />` 组件引入子应用
- ✔︎ 父子应用通讯
- ✔︎ 子应用运行时配置自定义 `bootstrap()`、`mount()` 和 `unmount()`
- ✔︎ 主应用、子应用联调

## Usage

### 主应用

#### 第一步：注册子应用

子应用注册有两种方式，**二选一即可**

##### 在构建期配置子应用

```js
export default {
  qiankun: {
    master: {
      // 注册子应用信息
      apps: [
        {
          name: 'app1', // 唯一 id
          entry: '//localhost:7001', // html entry
        },
        {
          name: 'app2', // 唯一 id
          entry: '//localhost:7002', // html entry
        },
      ],
      jsSandbox: true, // 是否启用 js 沙箱，默认为 true
      prefetch: true, // 是否启用 prefetch 特性，默认为 true
    },
  },
};
```

##### 在运行时动态配置子应用（src/app.js 里开启）

```js
// 从接口中获取子应用配置，export 出的 qiankun 变量是一个 promise
export const qiankun = fetch('/config').then(({ apps }}) => ({
  // 注册子应用信息
  apps,
  jsSandbox: true, // 是否启用 js 沙箱，默认为 true
  prefetch: true, // 是否启用 prefetch 特性，默认为 true
  lifeCycles: {
    // 完整生命周期钩子请看 https://qiankun.umijs.org/zh/api/#registermicroapps-apps-lifecycles
    afterMount: props => {
      console.log(props);
    },
  },
  // 支持更多的其他配置，详细看这里 https://qiankun.umijs.org/zh/api/#start-opts
}));
```

完整的主应用配置项看这里 [masterOptions 配置列表](#masterOptions)

#### 第二步：装载子应用

子应用的装载有两种方式，**二选一即可：**

##### 使用路由绑定的方式

假设我们的系统之前有这样的一些路由：

```js
export default {
	routes: [
    {
      path: '/',
      component: '../layouts/index.js',
      routes: [
        {
          path: '/app1',
          component: './app1/index.js',
          routes: [
            {
              path: '/app1/user',
              component: './app1/user/index.js',
            },
          ],
        },
        {
          path: '/',
          component: './index.js',
        },
      ],
    },
  ],
}
```

我们现在想在 `/app1/project` 和 `/app2` 这两个路径时分别加载微应用 app1 和 app2，只需要增加这样一些配置即可：

```diff
export default {
	routes: [
    {
      path: '/',
      component: '../layouts/index.js',
      routes: [
        {
          path: '/app1',
          component: './app1/index.js',
          routes: [
            {
              path: '/app1/user',
	          	component: './app1/user/index.js',
            },
+            // 配置微应用 app1 关联的路由
+            {
+              path: '/app1/project',
+	          	 microApp: 'app1',
+            },
          ],
        },
+        // 配置 app2 关联的路由
+        {
+        	path: '/app2',
+        	microApp: 'app2'
+        },
        {
          path: '/',
          component: './index.js',
        },
      ],
    },
  ],
}
```

##### 使用 `<MicroApp />` 组件的方式

我们可以直接使用 React 标签的方式加载我们已注册过的子应用：

```diff
import { MicroApp } from 'umi';

export function MyPage() {
  
  return (
    <div>
      <div>
+        <MicroApp name="app1" />
      </div>
    </div>
  )
}
```

### 子应用

#### 第一步：插件注册（config.js）

```js
export default {
  qiankun: {
    slave: {}
  }
}
```

如果子应用配置项为空，即 slave: {}，则可以省略配置：

```js
export default {
  base: `/${appName}`, // 子应用的 base，默认为 package.json 中的 name 字段
  plugins: ['@umijs/plugin-qiankun'],
};
```

#### 第二步：配置运行时生命周期钩子（可选）

在子应用的 `src/app.js` 里输出 `qiankun`，`props` 由主应用注入。

```js
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

#### 环境变量配置

为了获得更好地本地开发及调试体验，我们建议您提前在子应用中指定应用启动的具体端口号，如通过`.env`指定

```yml
PORT=8081
```

详细配置参考：https://umijs.org/zh/guide/env-variables.html#port

## 父子应用通讯

有两种方式可以实现

### 基于 props 传递

类似 react 中组件间通信的方案

1. 主应用中配置 apps 时以 props 将数据传递下去（参考主应用运行时配置一节）

   ```js
   // src/app.js

   export const qiankun = fetch('/config').then(config => {
     return {
       apps: [
         {
           name: 'app1',
           entry: '//localhost:2222',
           base: '/app1',
           props: {
             onClick: event => console.log(event),
             ...config,
           },
         },
       ],
     };
   });
   ```

2. 子应用在生命周期钩子中获取 props 消费数据（参考子应用运行时配置一节）

### 基于 Hooks 共享数据

由于方案基于 react hook，所以只能在 functional component 中使用相关 api，无法在 class component 中使用。

1. 约定父应用中在 `src/rootExports.js` 里 export 内容
2. 子应用中通过 `import { useRootExports } from 'umi'; const rootExports = useRootExports();` 取到

### <a name="masterOptions">MasterOptions</a>

| 配置 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| apps | 子应用配置 | App[] | 是 |  |
| jsSandbox | 是否启用 js 沙箱 | boolean | 否 | false |
| prefetch | 是否启用 prefetch 特性 | boolean | 否 | true |

#### App

| 配置 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| name | 子应用唯一 id | string | 是 |  |
| entry | 子应用 html 地址 | string \| { script: string[], styles: [] } | 是 |  |
| props | 主应用传递给子应用的数据 | object | 否 | {} |

## CHANGELOG

### 与 @umijs/plugin-qiankun 1.x 的变化

* 用户注册子应用时不再需要手动配置 base 以及 mountElementId。

这类方式会导致很多关联问题，最典型的是如果我们需要将子应用挂载到某一个具体的子路由下时，常出现由于挂载点还未初始化或已被销毁导致的问题。

现在只需要在注册完子应用后，在期望的路由下指定需要挂载的子应用的 name 即可。

* 可以直接通过 `<MicroApp />` 组件的方式在任意位置挂载自己的子应用。详见 [API 说明](#MicroApp)

* 不再支持主应用是 browser 路由模式，子应用是 hash 路由的混合模式。如果有场景需要可以通过自己使用 `<MicroApp />`组件加载子应用。

* 完全兼容 1.x 插件。

## 相关

- [https://github.com/umijs/plugins/issues/64](https://github.com/umijs/plugins/issues/64)

