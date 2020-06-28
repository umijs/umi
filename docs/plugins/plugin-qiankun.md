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

### 主应用配置

#### 第一步：注册子应用

子应用注册有两种方式，**二选一即可**

##### a. 插件构建期配置子应用

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
    },
  },
};
```

##### b. 运行时动态配置子应用（src/app.ts 里开启）

```js
// 从接口中获取子应用配置，export 出的 qiankun 变量是一个 promise
export const qiankun = fetch('/config').then(({ apps }}) => ({
  // 注册子应用信息
  apps,
  // 完整生命周期钩子请看 https://qiankun.umijs.org/zh/api/#registermicroapps-apps-lifecycles
  lifeCycles: {
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

##### <a name="RouteBased">a. 使用路由绑定的方式</a>

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
+	             microApp: 'app1',
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

##### b. <a name="MicroApp">使用 `<MicroApp />` 组件的方式</a>

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

### 子应用配置

#### 第一步：插件注册（config.js）

```js
export default {
  qiankun: {
    slave: {}
  }
}
```

#### 第二步：配置运行时生命周期钩子（可选）

如果你需要在子应用的生命周期期间加一些自定义逻辑，可以在子应用的 `src/app.ts` 里导出 `qiankun` 对象，并实现每一个生命周期钩子，其中钩子函数的入参 `props` 由主应用自动注入。

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

### 父子应用通讯

有两种方式可以实现

#### 配合 useModel 使用（推荐）

1. 主应用使用下面任一方式透传数据：

   1. 如果你用的 [MicroApp](#MicroApp) 组件模式消费微应用，那么数据传递的方式就跟普通的 react 组件通信是一样的，直接通过 props 传递即可：

      ```js
      function MyPage() {
        const [name, setName] = useState(null);
        return <MicroApp name={name} onNameChange={newName => setName(newName)} />
      }
      ```
      
   2. 如果你用的 [路由绑定式](#RouteBased) 消费微应用，那么你需要在 `src/app.ts` 里导出一个 `useQiankunStateForSlave` 函数，函数的返回值将作为 props 传递给微应用，如：
      ```ts
   // src/app.ts
   export function useQiankunStateForSlave() {
        const [globalState, setGlobalState] = useState({});
       
        return {
          globalState,
          setGlobalState,
        }
      }
      ```
   
2. 微应用中会自动生成一个全局 model，可以在任意组件中获取主应用透传的 props 的值。

   ```jsx
   import { useModel } from 'umi';
   const masterProps = useModel('qiankunStateFromMaster');
   ```

3. 和 `<MicroApp />` 的方式一同使用时，会额外向子应用传递一个 setLoading 的属性，在子应用中合适的时机执行 `masterProps.setLoading(false)`，可以标记微模块的整体 loading 为完成状态。

#### 基于 props 传递

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
           props: {
             onClick: event => console.log(event),
             name: 'xx',
             age: 1,
           },
         },
       ],
     };
   });
   ```

2. 子应用在生命周期钩子中获取 props 消费数据（参考子应用运行时配置一节）

### API
#### <a name="masterOptions">MasterOptions</a>

| 配置 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| apps | 子应用配置 | [App](#AppOpts)[] | 是 |  |
| sandbox | 是否启用沙箱，[详细说明](https://qiankun.umijs.org/zh/api/#start-opts) | boolean | 否 | false |
| prefetch | 是否启用 prefetch 特性，[详细说明](https://qiankun.umijs.org/zh/api/#start-opts) | boolean \| 'all' | 否 | true |

#### <a name="AppOpts">App</a>

| 配置 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| name | 子应用唯一 id | string | 是 |  |
| entry | 子应用 html 地址 | string \| { script: string[], styles: [] } | 是 |  |
| props | 主应用传递给子应用的数据 | object | 否 | {} |

## 升级指南

v2.3.0 完全兼容 v2 之前的版本，但我们还是建议您能升级到最新版本已获得更好的开发体验。

1. 移除无必要的应用配置

   ```diff
   export default {
     qiankun: {
       master: {
         apps: [
           {
             name: 'microApp',
             entry: '//umi.dev.cnd/entry.html',
   -         base: '/microApp',
   -         mountElementId: 'microApp',
   -         history: 'browser',
           }
         ]
       }
     }
   }
   ```

2. 移除无必要的全局配置

   ```diff
   export default {
     qiankun: {
       master: {
         apps: [],
   -     defer: true,
       }
     }
   }
   ```

3. 关联微应用

   比如我们之前配置了微应用名为 `microApp` 的 base 为 `/microApp` ，mountElementId 为 `subapp-container`， 那么我们只需要（二选一）：

   a. 增加 `/microApp` 的路由

   ```jsx
   export default {
     routes: [
       ...,
       { path: '/microApp', microApp: 'microApp' }
     ]
   }
   ```

   **使用路由关联模式时，不再需要微应用的 base 配置必须跟主应用中的保持一致了。**

   b. 在 `/microApp` 路由对应的组件里使用 `MicroApp`

   ```jsx
   export default {
     routes: [
       ...,
       { path: '/microApp', component: 'MyPage' }
     ]
   }
   ```

   ```jsx
   import { MicroApp } from 'umi';
   export default MyPage() {
     return (
       <div>
     		<MicroApp name="microApp" />
   	  </div>
     )
   }
   ```

4. 移除一些无效配置，如 [手动添加子应用路由配置](https://github.com/umijs/umi-plugin-qiankun#1-主应用新建-pagessubappcontainerjs)

## CHANGELOG

### 与 @umijs/plugin-qiankun 2.3.0 之前版本的变化

* 主应用注册子应用时不再需要手动配置 base 和 mountElementId。

  这类方式会导致很多关联问题，最典型的是如果我们需要将子应用挂载到某一个具体的子路由下时，常出现由于挂载点还未初始化或已被销毁导致的问题。

  现在只需要在注册完子应用后，在期望的路由下指定需要挂载的子应用的 name 即可。

* 可以直接通过 `<MicroApp />` 组件的方式在任意位置挂载自己的子应用。详见 [API 说明](#MicroApp)

* 不再支持主应用是 browser 路由模式，子应用是 hash 路由的混合模式。如果有场景需要可以通过自己使用 `<MicroApp />`组件加载子应用。

* 移除了 base、mountElementId、defer 等配置，现在有更好的方式来解决这类问题，参见第一条。

* rename `jsSandbox` -> `sandbox`，来自 qiankun2.0 的升级。

* **完全兼容 1.x 插件。**

## Roadmap

- [ ] 动态 history type 支持

  通过运行时设置微应用 props 的方式，修改微应用 history 相关配置，从而解耦微应用配置，如：

  ```tsx
  // HistoryOptions 配置见 https://github.com/ReactTraining/history/blob/master/docs/api-reference.md
  type HistoryProp = { type: 'browser' | 'memory' | 'hash' } & HistoryOptions;
  
  <MicroApp history={{ type: 'browser', basename: '/microApp' }} />
  ```

- [ ] 运行时统一，针对多层嵌套微应用场景

- [ ] 微应用自动 mountElementId，避免多个 umi 子应用 mountElementId 冲突

- [ ] 自动 loading

- [ ] 本地集成开发支持

## 相关

- [https://github.com/umijs/plugins/issues/64](https://github.com/umijs/plugins/issues/64)
