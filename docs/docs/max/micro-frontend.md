import { Message } from 'umi';

# Micro Frontends

`@umi/max` comes with a built-in **Qiankun Micro Frontends** [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts). It enables you to enable Qiankun Micro Frontends development mode with a single click. This plugin helps you seamlessly integrate Qiankun micro apps into your Umi project and build a production-ready micro frontend architecture.

For more information about Qiankun Micro Frontends, please refer to [this page](https://qiankun.umijs.org/zh/guide).

## Micro Frontends Example

![Micro Frontends Example](https://gw.alipayobjects.com/mdn/rms_655822/afts/img/A*TroZSp_cH0MAAAAAAAAAAAAAARQnAQ)

As shown in the above image: In the parent app, by switching routes using the navigation bar, the content displayed below comes from different child apps. Child apps can be opened individually, and they can also be nested arbitrarily.

In simpler terms, both parent and child apps are **independent frontend projects**. The parent app can internally incorporate child apps, and child apps can also internally incorporate grandchild apps, and so on.

When an app can be imported as a child app into another app, it becomes what we call a micro app.

## Getting Started

<Message type="success">
This tutorial assumes that you have a basic understanding of what micro frontends are, what Qiankun micro apps are, and how to use Qiankun micro apps.
</Message>

### Configuring the Parent App

First, you need to configure the parent app to register information about the child apps. This way, the parent app can recognize and incorporate the child apps internally.

There are two main ways to register child apps:

- Registering child apps using plugins.
- Registering child apps at runtime.

#### Registering Child Apps Using Plugins

Modify the Umi configuration file of the parent app and add the following content:

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

Here, `name` is the name of the child app, which you'll use when importing the child app. `entry` is the HTTP address where the child app is hosted. For the complete API of the `master` object, refer to [this](#masteroptions).

#### Registering Child Apps at Runtime

Modify the Umi configuration file of the parent app and add the following content:

```ts
// .umirc.ts
export default {
  qiankun: {
    master: {},
  },
};
```

Modify the `src/app.ts` file of the parent app and export the `qiankun` object:

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

### Configuring Child Apps

Child apps need to export the necessary lifecycle hooks for the parent app to call at appropriate times.

Assuming your child app project is **based on Umi** and has imported the `qiankun` [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts)**. If not, you can configure it following [this tutorial](https://qiankun.umijs.org/zh/guide/getting-started#%E5%BE%AE%E5%BA%94%E7%94%A8).

Modify the Umi configuration file of the child app and add the following content:

```ts
// .umirc.ts
export default {
  qiankun: {
    slave: {},
  },
};
```

This way, the micro frontend plugin will automatically create the necessary lifecycle hooks and methods for Qiankun child apps in the project. Easy as a cake!

### Importing Child Apps

You can import child apps into the parent app using three different methods provided by the plugin:

- Importing child apps via route binding.
- Importing child apps using the `<MicroApp />` component.
- Importing child apps using the `<MicroAppWithMemoHistory />` component.

#### Importing Child Apps via Route Binding

Manually configure the `routes` field in the `.umirc.ts` file to bind child apps via routes. Use this method when:

- The child app has a complete route switching logic.
- Parent and child app routes are interrelated.

Now, let's say we want to load the `app1` child app for the `/app1/project` route and the `app2` child app for the `/app2` route. You can configure the parent app's routes as follows:

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
            // Configure routes associated with the micro app app1
            {
              // Using the * wildcard means all sub-routes under /app1/project are associated with the micro app app1
              path: '/project/*',
              microApp: 'app1',
            },
          ],
        },
        // Configure routes associated with the app2
        {
          path: '/app2/*',
          microApp: 'app2',
        },
      ],
    },
  ],
};
```

Once configured, the base route of the child app will be set to the `path` configured in the parent app at runtime.
For example, in the above configuration, we specified the path associated with app1 as `/app1/project`, if there is a route configured in app1 as `/user`, when we want to access the corresponding path of `/user` in the parent application page, the url of the browser needs to be `base + /user`, that is, `/app1/project/user` path, otherwise the child-app will render a blank or 404 page because it cannot match the correct route.

The `qiankun` plugin extends Umi's original route object with an additional `microApp` field, which holds the value of the registered child app's `name`. When switching to the corresponding route, Umi will use the `<MicroApp />` component to render the micro app and replace the original route's `component`.

For the extended Umi route object API, refer to [see more](#route).

#### Importing Child Apps using `<MicroApp />` Component

Load (or unload) child apps using the `<MicroApp />` component. Use this method when:

- The child app has a complete route switching logic.
- Parent and child app routes are interrelated.

Now, if we want to import the `app1` child app into a page of the parent app, you can write the code like this:

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" />;
};
```

When using this method to import child apps, the routes of the parent and child apps will correspond one-to-one. For example, if the parent app's route is `/some/page`, the child app's route will also be `/some/page`. When switching the route of the child app, the parent app will switch accordingly.

If the parent app's route includes a prefix, you can ensure that the routes of the parent and child apps correspond correctly by configuring the `base` attribute. For example, if the parent app's route is `/prefix/router-path/some/page` and we want the child app's route to be `/some/page`, you can modify the code like this:

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" base="/prefix/router-path" />
};
```

#### Importing Child Apps using `<MicroAppWithMemoHistory />` Component

Load (or unload) child apps using the `<MicroAppWithMemoHistory />` component. Use this method when:

- You only need to use specific routes of the child app.
- Parent and child app routes are independent.

The `<MicroAppWithMemoHistory />` component is a variation of the `<MicroApp />` component. You need to explicitly provide the `url` attribute as the route of the child app. Unlike the `<MicroApp />` component, the route of the child app will **not change** when the route of the parent app changes.

Now, let's say we want to import the `app2` child app into a component inside the parent app. The route of the child app is `/some/page`. You can write the code like this:

```tsx
import { MicroAppWithMemoHistory } from 'umi';

export default function Page() {
  return <MicroAppWithMemoHistory name="app2" url="/some/page" />;
};
```

### Navigating Between Child Apps

If you've imported child apps via the **route binding** method, within other child apps, you can use the `<MicroAppLink />` component to navigate to corresponding routes. Let's take child apps `app1` and `app2` as examples:

```tsx
// In app1
import { MicroAppLink } from 'umi';

export default function Page() {
  return (
    <>
      {/* Navigating link is /app2/home */}
      <MicroAppLink name="app2" to="/home">
        <Button>go to app2</Button>
      </MicroAppLink>
    </>
  );
}
```

In the example above, clicking the button changes the parent app's route to `/app2/home` and renders the page with route `/home` within the `app2` child app. Similarly, if you want to navigate from the `app2` child app to the `app1` child app, you can write the code like this:

```tsx
// In app2
import { MicroAppLink } from 'umi';

export default function Page() {
  return (
    <>
      {/* Navigating link is /app1/project/home */}
      <MicroAppLink name="app1" to="/home"> 
        <Button>go to app1</Button>
      </MicroAppLink>
    </>
  );
}
```

You can also navigate from a child app to a specific route in the parent app:

```tsx
// In the child app
import { MicroAppLink } from 'umi';

export default function Page() {
  return (
    <>
      {/* Navigating link is /table */}
      <MicroAppLink isMaster to="/table">
        <Button>go to master app</Button>
      </MicroAppLink>
    </>
  );
}
```

## Child App Lifecycle

Qiankun builds on top of single-spa and provides additional lifecycle hooks. According to the order of micro app lifecycles, Qiankun supports the following complete list of lifecycle hooks:

- `beforeLoad`: Called **before the micro app starts loading**. Initially, the micro app is in the `NOT_LOADED` state.
- [`load`](https://single-spa.js.org/docs/building-applications/#load): Called when the micro app **finishes loading**. When the micro app starts loading, it transitions to the `LOADING_SOURCE_CODE` state. If loading is successful, the micro app transitions to the `NOT_BOOTSTRAPPED` state; if loading fails, it transitions to the `LOAD_ERROR` state.
- [`bootstrap`](https://single-spa.js.org/docs/building-applications/#bootstrap): Called when the micro app **finishes initializing**. When the micro app starts initialization, it transitions to the `BOOTSTRAPPING` state. After initialization is complete, it transitions to the `NOT_MOUNTED` state.
- `beforeMount`: Called **before each mounting of the micro app**.
- [`mount`](https://single-spa.js.org/docs/building-applications/#mount): Called when the micro app **starts mounting**. The micro app transitions to the `MOUNTING` state.
- `afterMount`: Called when each mounting of the micro app **finishes mounting**. The micro app transitions to the `MOUNTED` state.
- `beforeUnmount`: Called **before each unmounting of the micro app**.
- [`unmount`](https://single-spa.js.org/docs/building-applications/#unmount): Called when the micro app **starts unmounting**. The micro app transitions to the `UNMOUNTING` state.
- `afterUnmount`: Called when each unmounting of the micro app **finishes unmounting**. The micro app transitions to the `NOT_MOUNTED` state.
- [`unload`](https://single-spa.js.org/docs/building-applications/#unload): Called when the micro app **finishes unloading**. The micro app transitions to the `NOT_LOADED` state.

Additionally, there is a special lifecycle hook `update`, which only works when using the `<MicroApp />` or `<MicroAppWithMemoHistory />` component to import micro apps: Called when a micro app in the `MOUNTED` state is **manually refreshed**. When an update starts, the micro app transitions to the `UPDATING` state; after the update is complete, it transitions back to the `MOUNTED` state.

You can manually refresh a child app like this:

```tsx
import React, { useRef } from 'react';
import { MicroApp } from 'umi';

export default function Page() {
  const microAppRef = useRef();

  // Call this method to update the child app
  const updateMicroApp = () => {
    microAppRef.current?.update();
  };

  return <MicroApp name="app1" ref={microAppRef} />;
};
```

When you need to add custom logic in the lifecycle of child apps, you can configure it globally in the parent app or individually in each child app.

### Configuring Lifecycle Hooks in the Parent App

Export the `qiankun` object in the `src/app.ts` file of the parent app for global configuration. All child apps will implement these lifecycle hooks:

```ts
// src/app.ts
export const qiankun = {
  lifeCycles: {
    // Print props information when all child apps finish mounting
    async afterMount(props) {
      console.log(props);
    },
  },
};
```

### Configuring Lifecycle Hooks in Child Apps

Export the `qiankun` object in the `src/app.ts` file of the child app to implement lifecycle hooks. Child apps only support configuring the `bootstrap`, `mount`, and `unmount` hooks at runtime:

```ts
// src/app.ts
export const qiankun = {
  // Called before the app is loaded
  async bootstrap(props) {
    console.log('app1 bootstrap', props);
  },
  // Called before the app is rendered
  async mount(props) {
    console.log('app1 mount', props);
  },
  // Called after the app is unmounted
  async unmount(props) {
    console.log('app1 unmount', props);
  },
};
```

## Parent-Child Application Communication

There are two methods for communication between parent and child applications:

1. Communication using `useModel()`. This is the **recommended** solution by Umi.
2. Communication using configuration.

### Communication using `useModel()`

This communication method is based on the [Data Flow](https://github.com/umijs/umi/blob/master/packages/plugins/src/model.ts) plugin, which is built-in with the `@umi/max` solution.

This method requires that child apps are **developed using Umi** and have **imported the data flow plugin**.

For more detailed information about this plugin, see the [Data Flow Guide](./data-flow).

#### Passing Data from the Master App

If you're importing child apps via the route mode, you need to export a function named `useQiankunStateForSlave()` in the parent app's `src/app.ts` file. The return value of this function will be passed to the child app:

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

If you're importing child apps via the component mode, you can directly pass the data to the child app as component parameters:

```tsx
import React, { useState } from 'react';
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
};
```

#### Consuming Data in the Child App

The child app will automatically generate a global model with the namespace `@@qiankunStateFromMaster`. Using the `useModel()` method, the child app can obtain and consume the data passed from the parent app in any component, as shown below:

```tsx
import { useModel } from 'umi';

export default function Page() {
  const masterProps = useModel('@@qiankunStateFromMaster');
  return <div>{JSON.stringify(masterProps)}</div>;
};
```

Alternatively, you can use the higher-order method `connectMaster()` to obtain and consume the data passed from the parent app, as shown below:

```tsx
import { connectMaster } from 'umi';

function MyPage(props) {
  return <div>{JSON.stringify(props)}</div>;
}

export default connectMaster(MyPage);
```

Child apps can also access and consume the received `props` attributes in lifecycle hooks. You can implement corresponding lifecycle hooks according to your needs, as described in the [Child App Lifecycle Hooks](#child-app-lifecycle-hooks) section.

In particular, when the parent app imports child apps using the `<MicroApp />` or `<MicroAppWithMemoHistory />` component, an additional method `setLoading()` is passed to the child app. This method allows the child app to mark its loading as completed at the appropriate time:

```tsx
const masterProps = useModel('@@qiankunStateFromMaster');
masterProps.setLoading(false);

// Alternatively
function MyPage(props) {
  props.setLoading(false);
}
connectMaster(MyPage);
```

When the child app completes mounting and transitions to the `MOUNTED` state, it will automatically be marked as completed.

### Communication using Configuration

When configuring the parent app to [register child apps](#configuring-the-parent-app), you can pass the `props` attribute to provide data to the child app.

For example, modify the `qiankun` export method in the parent app's `src/app.ts` as follows:

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

In the child app, you can access and consume the received `props` attributes in lifecycle hooks. Implement the corresponding lifecycle hooks according to your needs, as described in the [Child App Lifecycle Hooks](#child-app-lifecycle-hooks) section.

## Customizing Child Apps

When enabling child app loading animations or error capture capabilities, the child app accepts an additional style class `wrapperClassName`, and the rendered result is as follows:

```tsx
<div style={{ position: 'relative' }} className={wrapperClassName}>
  <MicroAppLoader loading={loading} />
  <ErrorBoundary error={e} />
  <MicroApp className={className} />
</div>
```

### Child App Loading Animation

When this feature is enabled, an automatic loading animation will be displayed while the child app is loading. When the child app finishes mounting and transitions to the `MOUNTED` state, the loading state ends and the child app content is displayed.

#### Ant Design-Based Loading Animation

When using Ant Design as the project's component library, you can pass the `autoSetLoading` property to the child app to enable the automatic loading animation. The plugin will automatically use Ant Design's [`<Spin />` component](https://ant.design/components/spin/) as the loading component.

If you're importing child apps via the route mode, you can configure it like this:

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

If you're importing child apps via the component mode, you can directly pass `autoSetLoading` as a parameter:

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" autoSetLoading />;
};
```

#### Custom Loading Animation

If you're not using Ant Design as the project's component library or you want to override the default loading animation styles, you can set a custom loading component `loader` as the child app's loading animation.

For child apps imported via the route mode, customizing the loading component is currently only supported at runtime. Here's an example:

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

If you're importing child apps via the component mode, you can pass `loader` as a parameter like this:

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
};
```

In the code above, `loading` is a `boolean` parameter. When it's `true`, the loading animation is still in progress; when it's `false`, the loading animation has finished.

If multiple child apps require custom loading animations, configuring each of them individually can be cumbersome. In this case, you can define a global configuration in the main app's settings, for example:
```ts
// .umirc.ts
qiankun: {
  master: {
    loader: '@/CustomLoader',
  },
},
```
In this example, `loader` is the file path, and it's conventionally placed in the [src directory](../guides/directory-structure.md#src-directory) in Umi. In umi, `@` means the `src` directory.

`CustomLoader` follows the same implementation as described earlier and accepts a boolean parameter `loading`.

Note: The `master.loader` doesn't enable the loading animation by default. To enable the animation, you need to set `autoSetLoading` to `true`.

### Child-app Error Handling

When this feature is enabled, an automatic error message will be displayed if an exception occurs while loading the child app.

#### Antd-based Error Capture Component

When using Ant Design as the project's component library, you can pass the `autoCaptureError` property to the child app to enable the automatic error capture capability. The plugin will automatically use Ant Design's [`<Result />` component](https://ant.design/components/result/) as the error capture component.

If you're importing child apps via the route mode, you can configure it like this:

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

If you're importing child apps via the component mode, you can directly pass `autoCaptureError` as a parameter:

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" autoCaptureError />;
};
```

#### Custom Error Capture Component

If you're not using Ant Design as the project's component library or you want to override the default error capture component styles, you can set a custom component `errorBoundary` as the child app's error capture component.

For child apps imported via the component mode, you can pass `errorBoundary` as a parameter like this:

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
};
```

In the code above, `error` is a parameter of type `Error`.

## Environment Variables

If you have some configuration information that cannot be explicitly written in `.umirc.ts` or `src/app.ts`, you can store them in an environment variable file. For example, write the parent app's environment variable file `.env` as follows:

```plaintext
INITIAL_QIANKUN_MASTER_OPTIONS="{\"apps\":[{\"name\":\"app1\",\"entry\":\"//localhost:7001\"},{\"name\":\"app2\",\"entry\":\"//localhost:7002\"}]}"
```

Internally, the micro-frontends plugin will execute `JSON.parse(process.env.INITIAL_QIANKUN_MASTER_OPTIONS)`, and then merge the obtained result with the existing configuration information. The environment variable written above is equivalent to writing the following configuration information:

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
      // ... Other configuration information from .umirc.ts
    },
  },
};
```

It's important to note that when there are duplicate configuration items, such as the `apps` item, the configuration item written in `.umirc.ts` will **override** the configuration item from the environment variable.

Similarly, for child apps, you can write the environment variable file `.env` like this:

```plaintext
INITIAL_QIANKUN_SLAVE_OPTIONS="{\"enable\":false}"
```

This is equivalent to writing the following configuration information:

```ts
export default {
  qiankun: {
    slave: {
      enable: false,
      // ... Other configuration information from .umirc.ts
    },
  },
};
```

## API

### MasterOptions

| Attribute | Required | Description | Type | Default Value |
| --- | --- | --- | --- | --- |
| `enable` | No | Enable the Qiankun micro-app plugin. Setting it to `false` disables the plugin. | `boolean` | `undefined` |
| `loader` | No | Configure a file for the micro-app's loading animation. Provide a file path. | `string` | - |
| `apps` | Yes | Micro-app configuration | [`App[]`](#app) | `undefined` |
| `routes` | No | Micro-app runtime routes | [`Route[]`](#route) | `undefined` |
| `sandbox` | No | Enable sandbox mode | `boolean \| { strictStyleIsolation: boolean, experimentalStyleIsolation: boolean }` | `true` |
| `prefetch` | No | Enable micro-app preloading | `boolean \| 'all' \| string[] \| (( apps: RegistrableApp[] ) => { criticalAppNames: string[]; minorAppsName: string[] })` | `true` |

For an introduction to sandbox and prefetch, refer to [this page](https://qiankun.umijs.org/en/api/#startopts).

### SlaveOptions

| Attribute | Required | Description | Type | Default Value |
| --- | --- | --- | --- | --- |
| `enable` | No | Enable the Qiankun micro-app plugin. Setting it to `false` disables the plugin. | `boolean` | `undefined` |

### App

| Attribute | Required | Description | Type | Default Value |
| --- | --- | --- | --- | --- |
| `name` | Yes | Name of the micro-app | `string` |
| `entry` | Yes | HTML address of the micro-app | `string` | `{ script: string[], styles: [] }` |
| `credentials` | No | Fetch cookies when fetching the micro-app. See [this introduction](https://qiankun.umijs.org/en/faq#how-to-solve-the-problem-that-cookie-is-not-brought-when-fetching-micro-application-entry) | `boolean` | `false` |
| `props` | No | Data passed from the parent app to the micro-app. See [Parent-Child Application Communication](#communication-using-usemodel) | `object` | `{}` |

### Route

| Attribute | Required | Description | Type | Default Value |
| --- | --- | --- | --- | --- |
| `path` | Yes | Route PATH | `string` |
| `microApp` | Yes | Associated micro-app name | `string` |
| `microAppProps` | No | Micro-app configuration | [`MicroAppProps`](#microappprops) | `{}` |

### MicroAppProps

| Attribute | Required | Description | Type | Default Value |
| --- | --- | --- | --- | --- |
| `autoSetLoading` | No | Automatically set the micro-app's loading state | `boolean` | `false` |
| `loader` | No | Custom micro-app loading status component | `(loading) => React.ReactNode` | `undefined` |
| `autoCaptureError` | No | Automatically set the micro-app's error capture | `boolean` | `false` |
| `errorBoundary` | No | Custom micro-app error capture component | `(error: any) => React.ReactNode` | `undefined` |
| `className` | No | Micro-app style class | `string` | `undefined` |
| `wrapperClassName` | No | Style class that wraps the micro-app loading component, error capture component, and the micro-app itself. This is only effective when the loading or error capture component is enabled. | `string` | `undefined` |


## FAQ

### Child App's Lifecycle Hooks Loaded but the Page Isn't Rendered
If the page isn't rendering and there are no errors, and you find that the child app's root node has been created but is empty, it's likely because the current URL doesn't match any route of the child app.

For example, in the main app's configuration, you have:
```js
{
  path: '/app1',
  microApp: 'app1',
}
```
And in the child app's route configuration:
```js
{
  path: '/user',
  component: './User',
}
```
In this case, you must access the child app's `user` page through the `/app1/user` path to see the content rendered.

