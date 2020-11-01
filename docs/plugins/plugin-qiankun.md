---
translateHelp: true
---

# @umijs/plugin-qiankun

Umi plugin for [qiankun](https://github.com/umijs/qiankun).

[![NPM version](https://img.shields.io/npm/v/@umijs/plugin-qiankun.svg?style=flat)](https://npmjs.org/package/@umijs/plugin-qiankun) [![Build Status](https://img.shields.io/travis/umijs/umi-plugin-qiankun.svg?style=flat)](https://travis-ci.org/umijs/umi-plugin-qiankun) [![NPM downloads](http://img.shields.io/npm/dm/@umijs/plugin-qiankun.svg?style=flat)](https://npmjs.org/package/@umijs/plugin-qiankun)

## How to enable

1. ```shell
   yarn add @umijs/plugin-qiankun -D
   ```

2. Configure `qiankun` to open.

## Introduction

Umi application opens [qiankun](https://github.com/umijs/qiankun) micro-frontend mode with one click.

## Examples

Navigation is the main application, App1/App2 are sub-applications, and App1/App2 can also be opened separately. The main application can nest APP1 and APP2, and App1 can also nest App2.

![](https://gw.alipayobjects.com/mdn/rms_655822/afts/img/A*TroZSp_cH0MAAAAAAAAAAAAAARQnAQ)

```bash
$ yarn
$ yarn build
$ cd packages/plguin-qiankun && yarn start
```

## Features

- ✔︎ Based on qiankun
- ✔︎ Support the main application and sub-applications to use umi
- ✔︎ Support the introduction of sub-applications through the `<MicroApp />` component
- ✔︎ Father-son app communication
- ✔︎ Customize `bootstrap()`, `mount()` and ʻunmount()` when sub-application is running
- ✔︎ Joint debugging of main application and sub-application
- ✔︎ Nested sub-applications

## Usage

### Main application configuration

#### Step 1: Register sub-application

There are two ways to register sub-applications, **choose one of the two**

##### a. Configure sub-applications during plugin construction

```js
export default {
  qiankun: {
    master: {
      // Register sub-application information
      apps: [
        {
          name:'app1', // unique id
          entry:'//localhost:7001', // html entry
        },
        {
          name:'app2', // unique id
          entry: '//localhost:7002', // html entry
        },
      ],
    },
  },
};
```

##### b. Dynamic configuration of sub-applications at runtime (open in src/app.ts)

```js
// Obtain the sub-application configuration from the interface, the qiankun variable exported is a promise
export const qiankun = fetch('/config').then(({ apps }) => ({
  // Register sub-application information
  apps,
  // Please see https://qiankun.umijs.org/zh/api/#registermicroapps-apps-lifecycles for complete lifecycle hooks
  lifeCycles: {
    afterMount: props => {
      console.log(props);
    },
  },
  // Support more other configurations, see here for details https://qiankun.umijs.org/zh/api/#start-opts
}));
```

For the complete master application configuration items, see here [masterOptions configuration list](#masterOptions)

#### Step 2: Load the sub-application

There are two ways to load sub-applications, **choose one of the two:**

##### <a name="RouteBased">a. Use routing binding method</a>

<Alert type="info">
  It is recommended to use this method to import sub-applications with their own routes.  
</Alert>

Suppose our system has some routes like this before:

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

We now want to load the micro-applications app1 and app2 in the two paths `/app1/project` and `/app2`, respectively. We only need to add some configurations like this:

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
+              microApp: 'app1',
+            },
          ],
        },
+       // 配置 app2 关联的路由
+       {
+         path: '/app2',
+         microApp: 'app2'
+       },
        {
          path: '/',
          component: './index.js',
        },
      ],
    },
  ],
}
```

##### b. <a name="MicroApp">How to use the `<MicroApp />` component</a>

<Alert type="info">
  It is recommended to use this method to import sub-applications without routing.
  Otherwise, please pay attention to whether the route that the micro-app depends on can correctly match the current browser url, otherwise it is easy for the micro-app to load, but the page is not rendered.
</Alert>

We can directly use React tags to load the sub-applications we have registered:

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

##### loading animation and component style

You can turn on the loading animation of the micro application by configuring ʻautoSetLoading`.

```jsx
import { MicroApp } from 'umi';

export function MyPage() {
  
  return (
    <div>
      <div>
         <MicroApp name="app1" autoSetLoading />
      </div>
    </div>
  )
}
```

By default, when we detect that you are using the antd component library, the loading animation uses the antd Spin component.

If you need to customize your own loading animation, or modify the style of a component, you can handle it like this:

```jsx
import { MicroApp } from 'umi';

export function MyPage() {
  
  return (
    <div>
      <MicroApp
        name="app1"
        autoSetLoading
        // Set up custom loading animation
        loader={loading => <div>loading: {loading}</div>}
        // Micro application container class
        className="myContainer"
        // wrapper class, only takes effect when loading animation is turned on
        wrapperClassName="myWrapper"
      />
    </div>
  )
}
```

In routing mode, you can set some static configuration to enable loading animation like this:

```js
{
  path: '/user',
  microApp: 'user',
  microAppProps: {
    autoSetLoading: true,
    className: 'myContainer',
    wrapperClassName: 'myWrapper',
  }
}
```

Or, you can turn off the automatic loading animation by setting autoSetLoading false:

```tsx
import { MicroApp } from 'umi';

export function MyPage() {
  
  return (
    <div>
      <div>
         <MicroApp 
           name="app1"
           // Close the loading animation
           autoSetLoading={false}
         />
      </div>
    </div>
  )
}
```

### Sub-application configuration

#### The first step: plug-in registration (config.js)

```js
export default {
  qiankun: {
    slave: {}
  }
}
```

#### Step 2: Configure runtime lifecycle hooks (optional)

If you need to add some custom logic during the life cycle of the sub-application, you can export the `qiankun` object in the `src/app.ts` of the sub-application, and implement each life cycle hook, where the hook function's input parameters` props` is automatically injected by the main application.

```js
export const qiankun = {
  // Before the application loads
  async bootstrap(props) {
    console.log('app1 bootstrap', props);
  },
  // Triggered before applying render
  async mount(props) {
    console.log('app1 mount', props);
  },
  // Triggered after the app is uninstalled
  async unmount(props) {
    console.log('app1 unmount', props);
  },
};
```

#### Environment variable configuration

In order to get a better local development and debugging experience, we recommend that you specify the specific port number of the application startup in the sub-application in advance, such as through `.env`

```yml
PORT=8081
```

Detailed configuration reference: https://umijs.org/zh/guide/env-variables.html#port

### Father-son app communication

There are two ways to achieve

#### Use with [useModel](https://umijs.org/zh-CN/plugins/plugin-model) (recommended)

> Make sure you have installed `@umijs/plugin-model` or `@umijs/preset-react`

1. The main application uses any of the following methods to transparently transmit data:

   1. If you use the [MicroApp](#MicroApp) component mode to consume micro-applications, then the data transfer method is the same as the normal react component communication, and it can be passed directly through props:

      ```js
      function MyPage() {
        const [name, setName] = useState(null);
        return <MicroApp name={name} onNameChange={newName => setName(newName)} />
      }
      ```
      
   2. If you use [route-binding](#RouteBased) to consume micro-applications, then you need to export a `useQiankunStateForSlave` function in `src/app.ts`, and the return value of the function will be passed to the micro-application as props, such as :
      ```ts
      // src/app.ts
      export function useQiankunStateForSlave() {
        const [masterState, setMasterState] = useState({});
       
        return {
          masterState,
          setMasterState,
        }
      }
      ```
   
2. A global model is automatically generated in the micro application, and the props values ​​transparently transmitted by the main application can be obtained in any component.

   ```jsx
   import { useModel } from 'umi';
   
   function MyPage() {
     const masterProps = useModel('@@qiankunStateFromMaster');
     return <div>{ JSON.strigify(masterProps) }</div>;
   }
   ```

   Or you can get the props transparently transmitted by the main application through the high-level component connectMaster

   ```jsx
   import { connectMaster } from 'umi';
   
   function MyPage(props) {
     return <div>{ JSON.strigify(props) }</div>;
   }

   export default connectMaster(MyPage);
   ```

3. When used together with `<MicroApp />`, an additional setLoading attribute will be passed to the sub-application, and `masterProps.setLoading(false)` can be executed at the appropriate time in the sub-application to mark the overall loading of the micro-module as complete status.

#### Based on props

Similar to the scheme of communication between components in react

1. When configuring apps in the main application, use props to pass data down (refer to the main application runtime configuration section)

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

2. The sub-application obtains props consumption data in the lifecycle hook (refer to the section on sub-application runtime configuration)

### Nested sub-applications

In addition to navigation applications, App1 and App2 both rely on browser URLs. In order to allow App1 to nest App2, the two applications exist at the same time, we need to change the route of App2 to memory type at runtime.

1. Add master configuration in App1

```js
export default {
  qiankun: {
    master: {
      // 注册子应用信息
      apps: [
        {
          name: 'app2', // Unique id
          entry: '//localhost:7002', // html entry
        },
      ],
    },
  },
};
```

2. Introduce App2 through `<MicroAppWithMemoHistory />`

```diff
import { MicroAppWithMemoHistory } from 'umi';

export function MyPage() {
  
  return (
    <div>
      <div>
+        <MicroAppWithMemoHistory name="app2" url="/user" />
      </div>
    </div>
  )
}
```

### API
#### <a name="masterOptions">MasterOptions</a>

| Configuration | Description | Type | Required or not | Default value |
| --- | --- | --- | --- | --- |
| apps | Sub-application configuration | [App](#AppOpts)[] | Yes | |
| sandbox | Whether to enable the sandbox, [Details](https://qiankun.umijs.org/zh/api/#start-opts) | boolean | No | false |
| prefetch | Whether to enable the prefetch feature, [detailed description](https://qiankun.umijs.org/zh/api/#start-opts) | boolean \|'all' | no | true |

#### <a name="AppOpts">App</a>

| Configuration | Description | Type | Required or not | Default value |
| --- | --- | --- | --- | --- |
| name | unique id of sub-application | string | yes | |
| entry | Sub-application html address | string \| {script: string[], styles: []} | Yes | |
| props | Data passed from the main application to the sub-application | object | No | {} |

## Upgrade guide

v2.3.0 is fully compatible with versions prior to v2, but we still recommend that you upgrade to the latest version to get a better development experience.

1. Remove unnecessary application configuration

   ```diff
   export default {
     qiankun: {
       master: {
         apps: [
           {
             name: 'microApp',
             entry: '//umi.dev.cnd/entry.html',
   -         base: '/microApp',
   -         mountElementId: 'root-subapp',
   -         history: 'browser',
           }
         ]
       }
     }
   }
   ```

2. Remove unnecessary global configuration

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

3. Remove unnecessary mount containers

   ```diff
   -export default MyContainer() {
   -  return (
   -    <div>
   -      <div id="root-subapp"></div>
   -    </div>
   -  )
   -}
   ```
   
4. Associated micro applications

   For example, we previously configured the base of the microapp named `microApp` as `/microApp` and mountElementId as `subapp-container`, then we only need (choose one):

   a. Add route for `/microApp`

   ```jsx
   export default {
     routes: [
       ...,
       { path: '/microApp', microApp: 'microApp' }
     ]
   }
   ```

   **When using the routing association mode, the base configuration of the micro application is no longer required to be consistent with the main application. **

   b. Use `MicroApp` in the component corresponding to `/microApp` route

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

5.Remove some invalid configurations, such as [Manually add sub-app routing configuration](https://github.com/umijs/umi-plugin-qiankun#1-New main application-pagessubappcontainerjs)

## CHANGELOG

### Changes with @umijs/plugin-qiankun before 2.3.0

* It is no longer necessary to manually configure base and mountElementId when the main application registers the sub-application.

  This type of method will cause many association problems. The most typical one is that if we need to mount a sub-application to a specific sub-route, problems often arise because the mount point has not been initialized or has been destroyed.

  Now just after registering the sub-application, specify the name of the sub-application that needs to be mounted under the desired route.

* You can directly mount your own sub-applications at any location through the `<MicroApp />` component. See [API Description](#MicroApp) for details

* The main application is no longer supported in browser routing mode, and the sub-application is a hybrid mode of hash routing. If you need a scene, you can load sub-applications by yourself using the `<MicroApp />` component.

* The base, mountElementId, defer and other configurations have been removed, and there are now better ways to solve this type of problem, see Article 1.

* rename `jsSandbox` -> `sandbox`, an upgrade from qiankun2.0.

* **Fully compatible with 1.x plugins. **

## Roadmap

-[x] Dynamic history type support (coming soon 🎉), dependent on umi: ^3.2.7, @umijs/plugin-qiankun: ^2.4.0

  By setting the micro-application props at runtime, modify the micro-application history related configuration to decouple the micro-application configuration, such as:

  ```tsx
  // HistoryOptions, see configuration https://github.com/ReactTraining/history/blob/master/docs/api-reference.md
  type HistoryProp = { type: 'browser' | 'memory' | 'hash' } & HistoryOptions;
  
  <MicroApp history={{ type: 'browser', basename: '/microApp' }} />
  ```

- [] Unified runtime, aiming at multi-level nested micro application scenarios
- [] Micro-applications automatically mountElementId, avoiding multiple umi sub-application mountElementId conflicts
- [] Automatic loading
- [] Local integrated development support

## Related

- [https://github.com/umijs/plugins/issues/64](https://github.com/umijs/plugins/issues/64)
