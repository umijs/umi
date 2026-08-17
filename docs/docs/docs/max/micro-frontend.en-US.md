---
order: 9
toc: content
translated_at: '2026-08-17T03:38:01.000Z'
---

# Micro Frontends

`@umi/max` has a built-in **Qiankun Micro Frontends** [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts), which can enable the Qiankun micro frontend development mode with one click, helping you easily integrate Qiankun micro applications in your Umi project, and build a production-ready micro frontend architecture system.

For more information about Qiankun Micro Frontends, please refer to [this page](https://qiankun.umijs.org/guide).

## Micro Frontend Example

![Micro Frontend Example](https://gw.alipayobjects.com/mdn/rms_655822/afts/img/A*TroZSp_cH0MAAAAAAAAAAAAAARQnAQ)

As shown in the picture above: In the parent application, after switching routes through the navigation bar, the content displayed below comes from different child applications. Child applications support being opened independently; child applications also support arbitrary nesting among themselves.

Another more intuitive understanding: Both the parent and child applications are **independent front-end projects**. The parent application can introduce child applications internally, and child applications can also continue to introduce grandchild applications internally, and so on.

When an application can be introduced by other applications as a child application, it becomes what we call a micro application.

## Getting Started

:::success{title=🏆︎}

This tutorial assumes that you have a basic understanding of what micro frontends are, what Qiankun micro applications are, and how to use Qiankun micro applications.

:::

### Configure the Parent Application

First, you need to configure the parent application and register information related to the child applications so that the parent application can recognize and introduce the child applications internally.

There are mainly two ways to register child applications:

- Register child applications through the plugin.
- Register child applications at runtime.

#### Register Child Applications Through the Plugin

Modify the Umi configuration file of the parent application and add the following content:

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

Where `name` is the name of the child application, which is needed when introducing the child application; `entry` is the HTTP address where the child application is running; the full API of `master` object can be [seen here](#masteroptions).

#### Register Child Applications at Runtime

Modify the Umi configuration file of the parent application and add the following content:

```ts
// .umirc.ts
export default {
  qiankun: {
    master: {},
  },
};
```

Modify the `src/app.ts` file of the parent application and export the `qiankun` object:

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

### Configure the Child Application

Child applications need to export necessary lifecycle hooks for the parent application to call at the appropriate time.

Assuming your child application project is **developed based on Umi** and **the `qiankun` [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/qiankun.ts) is introduced**. If not, you can follow [this tutorial](https://qiankun.umijs.org/guide/getting-started#sub-application) to configure.

:::warning{title="Utoopack compatibility"}
If the child application is built with utoopack and the parent application uses qiankun 2, upgrade qiankun in the parent application to `2.10.17-beta.0` or later. Earlier versions do not provide `document.currentScript` correctly while executing entry scripts, which prevents the child application from loading. For more details, see the Utoo blog post [When Turbopack Meets qiankun: Adapting Utoopack for Micro Frontends](https://utoo.land/en/docs/blog/utoopack-qiankun).
:::

Modify the Umi configuration file of the child application and add the following content:

```ts
// .umirc.ts
export default {
  qiankun: {
    slave: {},
  },
};
```

This way, the micro frontend plugin will automatically create the necessary lifecycle hooks and methods for the Qiankun child application in the project, Easy as a cake！

### Introduce Child Applications

To introduce child applications in the parent application, the plugin provides three different implementation methods:

- Introduce child applications based on routing.
- Introduce child applications through the `<MicroApp />` component.
- Introduce child applications through the `<MicroAppWithMemoHistory />` component.

#### Introduce Child Applications Based on Routing

Manually configure the `routes` item in the `.umirc.ts` file by binding child applications through routing. When to use:

- When the child application contains a complete routing switching logic.
- When the routing of parent and child applications is interrelated.

Now, if we want to load child applications `app1` and `app2` on the `/app1/project` and `/app2` routes, respectively, we can configure the parent application's routing as follows:

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
            // Configure the route associated with micro application app1
            {
              // Adding a * wildcard means associating all sub-routes under /app1/project to the micro application app1
              path: '/project/*',
              microApp: 'app1',
            },
          ],
        },
        // Configure the route associated with app2
        {
          path: '/app2/*',
          microApp: 'app2',
        },
      ],
    },
  ],
};
```

After configuration, the base route of the child application will be set to the `path` configured in the main application at runtime.

For example, in the above configuration, we specified the path associated with app1 as `/app1/project`. Suppose there is a route configured as `/user` in app1. When we want to access the page corresponding to `/user` in the parent application, the browser's URL needs to be `base + /user`, which is the `/app1/project/user` path, otherwise, the child application will render a blank or 404 page because it cannot match the correct route.

The `qiankun` plugin extends the original Umi routing object and adds a `microApp` field, which is the `name` of the registered child application. After switching to the corresponding route, Umi will use the `<MicroApp />` component to render this child application and replace the original route's `component`.

The extended Umi routing object API can be [seen here](#route).

#### Introduce Child Applications Through the `<MicroApp />` Component

Load (or unload) child applications through the `<MicroApp />` component. When to use:

- When the child application contains a complete routing switching logic.
- When the routing of parent and child applications is interrelated.

Now, if we want to introduce child application `app1` in a certain page of the parent application, we can write the code as follows:

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" />;
}
```

When using this method to introduce child applications, the routing of parent and child applications will correspond one-to-one. For example, when the parent application's routing is `/some/page`, the child application's routing will be the same as `/some/page`. When switching child application routing, the parent application will switch synchronously.

If the parent application's route includes a prefix, you can configure the `base` attribute to ensure that the routing of the parent and child applications correspond correctly. For example, when the parent application's route is `/prefix/router-path/some/page`, if we want the child application's route to be `/some/page`, we can modify the code as follows:

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" base="/prefix/router-path" />;
}
```

#### Introduce Child Applications Through the `<MicroAppWithMemoHistory />` Component

Load (or unload) child applications through the `<MicroAppWithMemoHistory />` component. When to use:

- Only use the specified route of the child application.
- When the routing of parent and child applications is independent of each other.

The `<MicroAppWithMemoHistory />` component is a variant of the `<MicroApp />` component. You need to explicitly provide the `url` attribute as the route of the child application. When the route of the parent application changes, the route of the child application **will not change**.

Now, if we want to introduce child application `app2` inside a certain component of the parent application, with the route of the child application being `/some/page`, we can write the code as follows:

```tsx
import { MicroAppWithMemoHistory } from 'umi';

export default function Page() {
  return <MicroAppWithMemoHistory name="app2" url="/some/page" />;
}
```

### Jumping Between Child Applications

If child applications are introduced **through the routing binding method**, inside other child applications, you can use `<MicroAppLink />` to jump to the corresponding route. Take child applications `app1` and `app2` as examples:

```tsx
// In app1
import { MicroAppLink } from 'umi';

export default function Page() {
  return (
    <>
      {/* The jump link is /app2/home */}
      <MicroAppLink name="app2" to="/home">
        <Button>go to app2</Button>
      </MicroAppLink>
    </>
  );
}
```

In the above example, after clicking the button, the parent application's routing becomes `/app2/home`, rendering the page of child application `app2` with an internal routing of `/home`. Similarly, if you want to go back to child application app1 from child application app2, you can write the code as follows:

```tsx
// In app2
import { MicroAppLink } from 'umi';

export default function Page() {
  return (
    <>
      {/* The jump link is /app1/project/home */}
      <MicroAppLink name="app1" to="/home">
        <Button>go to app1</Button>
      </MicroAppLink>
    </>
  );
}
```

You can also jump from the child application to the specified route of the parent application:

```tsx
// In the child application
import { MicroAppLink } from 'umi';

export default function Page() {
  return (
    <>
      {/* The jump link is /table */}
      <MicroAppLink isMaster to="/table">
        <Button>go to master app</Button>
      </MicroAppLink>
    </>
  );
}
```

## Child Application Lifecycle

Qiankun implemented some additional lifecycle hooks on the basis of single-spa. In the order of the micro application's lifecycle, the complete list of supported lifecycle hooks by Qiankun is as follows:

- `beforeLoad`, called **before the micro applications start fetching**. Initially, the micro application state is `NOT_LOADED`.
- [`load`](https://single-spa.js.org/docs/building-applications/#load), called **when the micro application is fetched**. The micro application state becomes `LOADING_SOURCE_CODE` when starting to fetch the micro application. If fetched successfully, the state becomes `NOT_BOOTSTRAPPED`; if the fetch fails, the state becomes `LOAD_ERROR`.
- [`bootstrap`](https://single-spa.js.org/docs/building-applications/#bootstrap), called **when the micro application finishes initializing**. The micro application state becomes `BOOTSTRAPPING` when starting to initialize the micro application. When initialization is finished, the state becomes `NOT_MOUNTED`.
- `beforeMount`, called **every time before the micro application starts mounting**.
- [`mount`](https://single-spa.js.org/docs/building-applications/#mount), called **every time when the micro application starts mounting**. The micro application state becomes `MOUNTING`.
- `afterMount`, called **every time when the micro application finishes mounting**. The micro application state becomes `MOUNTED`.
- `beforeUnmount`, called **every time before the micro application starts unmounting**.
- [`unmount`](https://single-spa.js.org/docs/building-applications/#unmount), called **every time when the micro application starts unmounting**. The micro application state becomes `UNMOUNTING`.
- `afterUnmount`, called **every time when the micro application finishes unmounting**. The micro application state becomes `NOT_MOUNTED`.
- [`unload`](https://single-spa.js.org/docs/building-applications/#unload), called **when the micro application is fully unloaded**. The micro application state becomes `NOT_LOADED`.

In addition, there is a special lifecycle hook `update`, which is effective only when introducing micro applications through the `<MicroApp />` or `<MicroAppWithMemoHistory />` component: it is called **manually when the micro application in the `MOUNTED` state is refreshed**. When starting to update, the micro application state becomes `UPDATING`; when the update is completed, the state becomes `MOUNTED` again.

You can refresh the child application manually like this:

```tsx
import { useRef } from 'react';
import { MicroApp } from 'umi';

export default function Page() {
  const microAppRef = useRef();

  // When this method is executed, the child application is updated
  const updateMicroApp = () => {
    microAppRef.current?.update();
  };

  return <MicroApp name="app1" ref={microAppRef} />;
}
```

When you need to add some custom logic in the lifecycle of the child application, you can configure it globally in the parent application as well as configure it individually in the child application.

### Parent Application Configures Lifecycle Hooks

Export the `qiankun` object in the `src/app.ts` of the parent application for global configuration. All child applications will implement these lifecycle hooks:

```ts
// src/app.ts
export const qiankun = {
  lifeCycles: {
    // For all child applications, print props information when mounting is finished
    async afterMount(props) {
      console.log(props);
    },
  },
};
```

### Child Application Configures Lifecycle Hooks

Export the `qiankun` object in the `src/app.ts` of the child application to implement lifecycle hooks. The child application supports configuring `bootstrap`, `mount`, and `unmount` hooks at runtime:

```ts
// src/app.ts
export const qiankun = {
  // Before the application loads
  async bootstrap(props) {
    console.log('app1 bootstrap', props);
  },
  // Triggered before the application render
  async mount(props) {
    console.log('app1 mount', props);
  },
  // Triggered after the application unmounts
  async unmount(props) {
    console.log('app1 unmount', props);
  },
};
```

## Communication Between Parent and Child Applications

There are two ways to implement communication between parent and child applications:

- Communication based on `useModel()`. This is the solution **recommended** by Umi.
- Communication based on configuration.

### Communication Based on `useModel()`

This communication method is based on the [data flow](https://github.com/umijs/umi/blob/master/packages/plugins/src/model.ts) plugin, which is already integrated into the `@umi/max` solution.

This communication method requires the child application to be **developed based on Umi** and to **introduce the data flow plugin**.

For detailed introduction to this plugin, see [Data Flow Guide](./data-flow).

#### The Main Application Passes Data

If child applications are introduced through the routing method, you need to export a function named `useQiankunStateForSlave()` in the `src/app.ts` of the parent application. The return value of this function will be passed to the child application:

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

If child applications are introduced through the component method, directly pass the data as component parameters to the child application:

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

#### Child Application Consumes Data

The child application will automatically generate a global Model, whose namespace is `@@qiankunStateFromMaster`. Through the `useModel()` method, child applications are allowed to get and consume the data passed by the parent application in any component, as follows:

```tsx
import { useModel } from 'umi';

export default function Page() {
  const masterProps = useModel('@@qiankunStateFromMaster');
  return <div>{JSON.stringify(masterProps)}</div>;
}
```

Or you can obtain and consume the data passed by the parent application through the higher-order method `connectMaster()`, as shown below:

```tsx
import { connectMaster } from 'umi';

function MyPage(props) {
  return <div>{JSON.stringify(props)}</div>;
}

export default connectMaster(MyPage);
```

The child application can also obtain and consume the `props` properties in the lifecycle hooks [configured according to the requirements](#child-application-configures-lifecycle-hooks).

Especially, when the parent application introduces the child application through the `<MicroApp />` or `<MicroAppWithMemoHistory />` component method, an additional `setLoading()` method will be passed to the child application. This allows the child application to execute this method at the appropriate time to mark the child application as loaded:

```tsx
const masterProps = useModel('@@qiankunStateFromMaster');
masterProps.setLoading(false);

// Or
function MyPage(props) {
  props.setLoading(false);
}
connectMaster(MyPage);
```

When the child application finishes mounting and becomes `MOUNTED`, it will automatically be marked as loaded.

### Communication Based on Configuration

When [registering the child application](#configure-the-parent-application) in the parent application configuration, the `props` attribute can be passed, transferring data to the child application.

For example, modify the `src/app.ts` of the parent application's `qiankun` export method as follows:

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

The child application can obtain and use the passed `props` in lifecycle hooks by [implementing the corresponding lifecycle hooks](#child-application-configures-lifecycle-hooks) as needed.

## Custom Child Applications

When a loading indicator or error boundary is enabled for a child application, the child application receives an additional `wrapperClassName` CSS class. The rendered structure is as follows:

```tsx
<div style={{ position: 'relative' }} className={wrapperClassName}>
  <MicroAppLoader loading={loading} />
  <ErrorBoundary error={e} />
  <MicroApp className={className} />
</div>
```

### Child Application Loading Indicator

After this capability is enabled, a loading indicator is displayed automatically while the child application is loading. When the child application finishes mounting and reaches the `MOUNTED` state, the loading state ends and the child application content is displayed.

#### antd-based Loading Indicator

If your project uses antd, pass the `autoSetLoading` property to the child application to enable its loading indicator. The plugin automatically uses antd's [`<Spin />` component](https://ant.design/components/spin) as the loader.

When introducing a child application through routing, configure it as follows:

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

When introducing a child application through a component, pass `autoSetLoading` directly:

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" autoSetLoading />;
}
```

#### Custom Loading Indicator

If your project does not use antd, or if you want to override the default loading style, provide a custom `loader` component for the child application.

Child applications introduced through routing support this option only in runtime configuration:

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

When introducing a child application through a component, pass `loader` directly:

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

The `loading` parameter is a `boolean`: `true` means that the child application is still loading, and `false` means that loading has finished.

To share one custom loading indicator across multiple child applications, configure `defaultLoader` in the parent application:

```ts
// .umirc.ts
qiankun: {
  master: {
    defaultLoader: '@/defaultLoader',
  },
},
```

`defaultLoader` is a file path. By convention, place the file in the [src directory](../guides/directory-structure#src-directory). In Umi, `@` represents the `src` directory.

`defaultLoader` has the same implementation as `loader` and receives a `boolean` `loading` parameter.

```tsx
// defaultLoader.tsx
import { Spin } from 'antd';

export default function (loading: boolean) {
  return <Spin spinning={loading} />;
}
```

Note: `loader` takes precedence over `defaultLoader`.

### Child Application Error Handling

After this capability is enabled, error information is displayed automatically when a child application fails to load.

#### antd-based Error Boundary

If your project uses antd, pass the `autoCaptureError` property to the child application to enable error handling. The plugin automatically uses antd's [`<Result />` component](https://ant.design/components/result) as the error boundary.

For example, the displayed language automatically follows the Umi locale configuration: <img src="https://mdn.alipayobjects.com/huamei_zvchwx/afts/img/A*gAAVRrAJJNEAAAAAAAAAAAAADuWEAQ/original">

When introducing a child application through routing, configure it as follows:

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

When introducing a child application through a component, pass `autoCaptureError` directly:

```tsx
import { MicroApp } from 'umi';

export default function Page() {
  return <MicroApp name="app1" autoCaptureError />;
}
```

#### Custom Error Boundary

If your project does not use antd, or if you want to override the default error boundary style, provide a custom `errorBoundary` component for the child application.

Child applications introduced through routing support this option only in runtime configuration:

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

When introducing a child application through a component, pass `errorBoundary` directly:

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

The `error` parameter is an `Error` object.

To share one custom error boundary across multiple child applications, configure `defaultErrorBoundary` in the parent application:

```ts
// .umirc.ts
qiankun: {
  master: {
    defaultErrorBoundary: '@/defaultErrorBoundary',
  },
},
```

`defaultErrorBoundary` is a file path. By convention, place the file in the [src directory](../guides/directory-structure#src-directory). In Umi, `@` represents the `src` directory.

`defaultErrorBoundary` has the same implementation as `errorBoundary` and receives an `Error` parameter.

```tsx
// defaultErrorBoundary.tsx
export default function (error: Error) {
  return <div>{error?.message}</div>;
}
```

Note: `errorBoundary` takes precedence over `defaultErrorBoundary`.

## Environment Variables

If you have configuration that cannot be written explicitly in `.umirc.ts` or `src/app.ts`, store it in an environment variable file. For example, define the parent application's `.env` file as follows:

```plaintext
INITIAL_QIANKUN_MASTER_OPTIONS="{\"apps\":[{\"name\":\"app1\",\"entry\":\"//localhost:7001\"},{\"name\":\"app2\",\"entry\":\"//localhost:7002\"}]}"
```

Internally, the micro frontend plugin runs `JSON.parse(process.env.INITIAL_QIANKUN_MASTER_OPTIONS)` and merges the result with the existing configuration. The environment variable above is equivalent to the following merged configuration:

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
      // ...other configuration from .umirc.ts
    },
  },
};
```

When the same option exists in both places, such as `apps`, the value in `.umirc.ts` **overrides** the value from the environment variable.

Similarly, a child application can define the following `.env` file:

```plaintext
INITIAL_QIANKUN_SLAVE_OPTIONS="{\"enable\":false}"
```

This is equivalent to the following configuration:

```ts
export default {
  qiankun: {
    slave: {
      enable: false,
      // ...other configuration from .umirc.ts
    },
  },
};
```

## API

### MasterOptions

| Property | Required | Description | Type | Default |
| --- | --- | --- | --- | --- |
| `enable` | No | Enables the Qiankun micro application plugin; set it to `false` to disable the plugin | `boolean` | `undefined` |
| `apps` | Yes | Micro application configuration | [`App[]`](#app) | `undefined` |
| `routes` | No | Runtime routes for micro applications | [`Route[]`](#route) | `undefined` |
| `defaultErrorBoundary` | No | Default error boundary for child applications, specified as a file path | `string` | - |
| `defaultLoader` | No | Default loading indicator for child applications, specified as a file path | `string` | - |
| `sandbox` | No | Whether to enable sandbox mode | `boolean \| { strictStyleIsolation: boolean, experimentalStyleIsolation: boolean }` | `true` |
| `prefetch` | No | Whether to prefetch micro applications | `boolean \| 'all' \| string[] \| (( apps: RegistrableApp[] ) => { criticalAppNames: string[]; minorAppsName: string[] })` | `true` |

For more information about sandboxing and prefetching, see the [Qiankun API documentation](https://qiankun.umijs.org/api/#startopts).

### SlaveOptions

| Property | Required | Description | Type | Default |
| --- | --- | --- | --- | --- |
| `enable` | No | Enables the Qiankun micro application plugin; set it to `false` to disable the plugin | `boolean` | `undefined` |

### App

| Property | Required | Description | Type | Default |
| --- | --- | --- | --- | --- |
| `name` | Yes | Name of the micro application | `string` | - |
| `entry` | Yes | HTML address of the micro application | `string` | `{ script: string[], styles: [] }` |
| `credentials` | No | Whether to include cookies when fetching the micro application; see the [Qiankun FAQ](https://qiankun.umijs.org/faq/) | `boolean` | `false` |
| `props` | No | Data passed from the parent application to the micro application; see [Communication Between Parent and Child Applications](#communication-between-parent-and-child-applications) | `object` | `{}` |

### Route

| Property | Required | Description | Type | Default |
| --- | --- | --- | --- | --- |
| `path` | Yes | Route path | `string` | - |
| `microApp` | Yes | Name of the associated micro application | `string` | - |
| `microAppProps` | No | Micro application configuration | [`MicroAppProps`](#microappprops) | `{}` |

### MicroAppProps

| Property | Required | Description | Type | Default |
| --- | --- | --- | --- | --- |
| `autoSetLoading` | No | Automatically manages the micro application's loading state | `boolean` | `false` |
| `loader` | No | Custom loading-state component for the micro application | `(loading) => React.ReactNode` | `undefined` |
| `autoCaptureError` | No | Automatically captures micro application errors | `boolean` | `false` |
| `errorBoundary` | No | Custom error boundary component for the micro application | `(error: any) => React.ReactNode` | `undefined` |
| `className` | No | CSS class for the micro application | `string` | `undefined` |
| `wrapperClassName` | No | CSS class for the wrapper around the loader, error boundary, and micro application; applies only when a loader or error boundary is enabled | `string` | `undefined` |

## FAQ

### Child Application Lifecycle Hooks Load, but the Page Does Not Render

If the page reports no errors and the child application's root DOM node exists but is empty, the current URL most likely does not match any route in the child application.

For example, suppose the parent application contains this configuration:

```js
{
  path: '/app1',
  microApp: 'app1',
}
```

And the child application contains this route:

```js
{
  path: '/user',
  component: './User',
}
```

You must visit `/app1/user` to access the child application's user page.
