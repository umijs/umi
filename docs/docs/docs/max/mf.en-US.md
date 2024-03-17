---
order: 17
toc: content
translated_at: '2024-03-17T08:55:33.242Z'
---

# Module Federation Plugin

Using Module Federation functionality in Umi projects.

:::warning{title=🚨}
Module Federation functionality requires browser support for `Top Level Await` feature. Please pay attention to browser support ([Browser support status](https://caniuse.com/?search=top%20level%20await)) when using it in production environment.
:::

## Configuration

### Configuring the use of remote modules

@umijs/max projects

```ts
// .umirc.ts
import { defineConfig } from '@umijs/max';

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
  // Module Federation plugin is already built-in, just enable the configuration
  mf: {
    remotes: [
      {
        // Optional, if not configured, the current remotes[].name field is used
        aliasName: 'mfNameAlias',
        name: 'theMfName',
        entry: 'https://to.the.remote.com/remote.js',
      },
    ],

    // Configure MF shared modules
    shared,
  },
});
```

Regular Umi projects

```ts
// .umirc.ts
import { defineConfig } from 'umi';

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
  plugins: ['@umijs/plugins/dist/mf'], // Import plugin
  mf: {
    remotes: [
      {
        // Optional, if not configured, the current remotes[].name field is used
        aliasName: 'mfNameAlias',
        name: 'theMfName',
        entry: 'https://to.the.remote.com/remote.js',
      },
    ],

    // Configure MF shared modules
    shared,
  },
});
```

In the project, you can now use `import XXX from 'mfNameAlias/XXXX'` to use the content of remote modules.

#### Runtime remote module loading

If you need to decide the remote module's loading address at runtime (based on the running environment), you can configure it as follows:

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

- When using runtime remote module loading logic, do not configure `remotes[]#entry`, the plugin will prioritize this field.
- `keyResolver` is used to decide which key of `entries` to use at runtime; using an _Immediately Invoked Function Expression_ is recommended and can implement more complex functionality in the function. Does not support asynchronous functions.
- `keyResolver` can also use static values, configured as `keyResolver: '"PROD"'`

### Configuration for exporting remote modules

For the current project to provide remote modules, use the following configuration field for the module name

```ts
// .umirc.ts
// Extracting the variable is for consistent configuration with MFSU
const remoteMFName = 'remoteMFName';

defineConfig({
  mf: {
    name: remoteMFName,

    // Optional, library type of remote module, if the module needs to be used in a Qiankun sub-application, the suggested value is recommended,
    // Note that the name here must be consistent with the final MF module name
    // library: { type: "window", name: "exportMFName" },
  },
});
```

:::info{title=🚨}
The configured module name must be a valid Javascript variable name!
:::

The modules exported follow the convention, taking the directory names under `src/exposes` as the export items, and the export file is the index file under that directory, for example

```txt
src/exposes/
├── Button
│   └── index.jsx
├── Head
│   └── index.ts
└── Form
    └── index.tsx
```

The corresponding Module Federation exposes are

```js
{
  './Button': 'src/exposes/Button/index.jsx',
  './Button': 'src/exposes/Head/index.ts',
  './Form'  : 'src/exposes/Form/index.tsx',
}
```

### Disabling MF product hash

By default, when the user enables `hash: true`, the entry file in the MF product will automatically carry a hash, such as `remote.123abc.js`. You can disable it by setting `remoteHash: false` (resulting in `remote.js`), at which point you may need to modify nginx/CDN/gateway response header configuration to remove the cache for the `remote.js` file, otherwise the new build will not take effect.

Note: More harm without hash and recommended practices are detailed in [issue #11711](https://github.com/umijs/umi/issues/11711)


```ts
mf: {
  remoteHash: false
}
```

## Runtime API

### When to use runtime API?

Configuring with `import()` can easily use the Module Federation functionality. However, consider using runtime API if you have the following needs:

- When loading a remote module fails, the page needs to use a fallback component
- The loading address of the remote module cannot be determined by a synchronous function (requires asynchronous call)
- The loading address and module name of the remote module need to be determined at runtime

### safeMfImport

A fail-safe remote module loading function, interface definition as follows:

```ts
safeMfImport(moduleSpecifier: string, fallback: any): Promise<any>
```

Combined with `React.lazy` can implement lazy loading of remote modules

```ts
import { safeMfImport } from '@umijs/max';
import React, { Suspense } from 'react';

const RemoteCounter = React.lazy(() => {
  return safeMfImport('remoteCounter/Counter', { default: () => 'Fallback' });
});

export default function Page() {
  return (
    <Suspense fallback="loading">
      <RemoteCounter />
    </Suspense>
  );
};
```

:::info{title=🚨}
- Note that the fallback ***component*** needs to be wrapped in the object's `default` field to mimic a module.
- `remoteCounter/Counter` needs to correspond with the configuration.
:::

[Example code](https://github.com/umijs/umi/blob/master/examples/mf-host/src/pages/safe-import.tsx)

### safeRemoteComponent

This API is a higher-order component that encapsulates `safeMfImport`, interface definition as follows:

```ts
safeRemoteComponent<T extends React.ComponentType<any>>
  (opts: {
      moduleSpecifier:string;
      fallbackComponent: React.ComponentType<any>;  // Fallback component if remote component fails to load
      loadingElement: React.ReactNode ;             // Loading display for component loading
    } ): T
```

Example:

```ts
const RemoteCounter = safeRemoteComponent<React.FC<{ init?: number }>>({
  moduleSpecifier: 'remoteCounter/Counter',
  fallbackComponent: () => 'fallbacked',
  loadingElement: 'Loading',
});

export default function Page() {
  return (
    <div>
      <RemoteCounter init={808} />
    </div>
  );
};
```

[Example code](https://github.com/umijs/umi/blob/master/examples/mf-host/src/pages/safe-remote-component.tsx)

### rawMfImport

Loading remote modules, interface as follows.

```ts
rawMfImport(opts: {
  entry: string;
  remoteName: string;
  moduleName: string;
}): Promise<any>
```

Example

```ts
const RemoteCounter = React.lazy(() => {
  return rawMfImport({
    entry: 'http://localhost:8001/remote.js',
    moduleName: 'Counter',
    remoteName: 'remoteCounter',
  });
});
```

[Example code](https://github.com/umijs/umi/blob/master/examples/mf-host/src/pages/raw-mf-import.tsx)

### safeRemoteComponentWithMfConfig

A higher-order component that encapsulates `rawMfImport`:

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

Example

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

export default function Page() {
  return <RemoteCounter />;
};
```

[Example code](https://github.com/umijs/umi/blob/master/examples/mf-host/src/pages/raw-mf-component.tsx)

### registerMfRemote

Dynamically registers Module Federation module remote configurations.

```ts
type MFModuleRegisterRequest = { entry: string; remoteName: string; aliasName?:string; }
registerMfRemote (opts: MFModuleRegisterRequest): void
```

When using `safeMfImport` or `safeRemoteComponent`, `moduleSpecifier` must be a configured remote module. While calling `rawMfImport` is somewhat verbose, `registerMfRemote` can be used to register first, then use the succinct `safeMfImport` and `safeRemoteComponent`.

```ts
registerMfRemote({
  aliasName: 'registered',
  remoteName: 'remoteCounter',
  entry: 'http://127.0.0.1:8001/remote.js',
});

const RemoteCounter = React.lazy(() => {
  return safeMfImport('registered/Counter', { default: null });
});
```

[Example code](https://github.com/umijs/umi/blob/master/examples/mf-host/src/pages/register-then-import.tsx)

## Using with MFSU

The Module Federation plugin automatically modifies MFSU's **default** configuration based on plugin configuration to allow both features to work normally during the development stage, the principle is as follows:

Assume we have the following mf plugin configuration

```ts
// .umirc.ts
export default defineConfig({
  mf: {
    name: 'remoteMFName',
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
    shared: {
      react: {
        singleton: true,
        eager: true,
      },
      'react-dom': {
        singleton: true,
        eager: true,
      },
    }
  },
});
```

The corresponding final effective configuration is as follows

```ts
{
  mfsu: {
    // mf plugin automatically fills in the following default configurations compatible with MFSU
    // MFSU can also debug MF modules in the DEV stage
    remoteName: 'remoteMFName', 
    remoteAliases: ['remote1', 'aliasRemote'],
    shared: {
      react: {
        singleton: true,
        eager: true,
      },
      'react-dom': {
        singleton: true,
        eager: true,
      },
    }
  },
  mf: {
    name: 'remoteMFName',
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
    shared: {
      react: {
        singleton: true,
        eager: true,
      },
      'react-dom': {
        singleton: true,
        eager: true,
      },
    },
  },
}
```
