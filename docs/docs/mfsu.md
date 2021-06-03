# mfsu（Module Federation Speed Up）

Version requirement: 3.5+

## What is a mfsu

MFSU is a speed-up package solution based on the new WebPack5 feature Module Federation.

Let's say our application is A. The MFSU builds a virtual application B that exposes all dependencies, and then prebuilds B. A then uses the pre-compiled dependencies in B. Thus, the compilation time of A is saved and the compilation is accelerated.

## The effect of speeding up

Take the ANTD-Pro initialization project as an example:

### Dev phase

![standard](https://img.alicdn.com/imgextra/i1/O1CN01HwndzM1Y9pc4X1iFK_!!6000000003017-55-tps-1000-376.svg)

![large dependency](https://img.alicdn.com/imgextra/i1/O1CN01Kq9Omc1uWCVJx9QaT_!!6000000006044-55-tps-1000-376.svg)

With MFSU enabled, the cold start speed is slightly increased. The hot start and hot update speeds are greatly improved, especially as the number of dependencies increases.

### Build phase

![build](https://img.alicdn.com/imgextra/i3/O1CN01OCwtuh1U2j0N4vTUU_!!6000000002460-55-tps-500-376.svg)

The first build was slow due to the MFSU full-volume compile dependency. It is recommended to complete the pre-build in the local environment, and synchronize the product to Git, so that the deployment time on the server will be compressed to about 5S!

> Since Dumi support has not yet been added, this test was removed `@umijs/preset-dumi`.
>
> Due to unstable equipment performance, there may be partial error in the test.

## Start

1. Initialize an umi application.
2. Add `webpack5:{}`,`dynamicImport:{}` and `mfsu:{}` to config.ts.
3. `umi dev` start the project.

## Features

### dev mode

- With MFSU enabled, precompilation of MFSU will be performed before the project starts.
- MFSU will listen for dependencies and peerDependencies changes in package.json and diff dependencies. If the project adds a dependency or changes the dependency version, it will cause the dependency to be reprecompiled. At the same time, for a lighter development experience, if the project only reduces dependencies, it will not be recompiled.
- Umi strongly caches MFSU dependencies and refreshing the browser will not cause a re-request of the dependencies.
- Precompiled dependencies can be configured to synchronize with Git, or to reduce compilation of dependencies while others synchronize projects.
- Thanks to the precompilation of dependencies, only the project files are recompiled during startup and hot update, making the development process extremely easy.

### prod mode

> Warning: Since the precompiled dependency does not enable tree-shaking, it is not recommended to enable production mode in a package size sensitive project.

- When 'umi build' is performed, it will start producing MFSU precompiled dependencies, which will then be merged into umi's output directory.
- Similarly, when 'build' is executed again, the MFSU will be diff with the previous artifact. If the dependency is not changed, MFSU will not be precompiled again.
- As the project stabilizes, dependencies are added less. Using MFSU's PROD mode can speed up the production build process extremely quickly.

## Did I turn on MFSU correctly?

To get the best out of MFSU, all dependencies should be precompiled.

Because MFSU currently only supports handling dependencies introduced by static import statements, dependencies introduced by other methods (such as require and await import) cannot be covered. If other import statements are used in a library, MFSU will not perform at its best, such as `@umijs/preset-dumi`.

On the other hand, some dependencies are introduced by Umi's plugin, but not included in package.json, so they are not overridden by MFSU.

Therefore, you need to check that the project dependencies are fully overridden by the MFSU. We can use Umi's own Webpack-Analyze for dependency analysis.

- `ANALYZE=1 umi dev` Start the project, check if it starts normally. If you have a problem, you can ask an issue or check the FAQ below.
- Check if there are dependencies loaded from `./node_modules`. If not, the project is dependent and overridden by MFSU.
- Add this dependency to the configuration if it still exists: `mfsu:{includes: [...] }`.

## Used in ANTD-Pro

To enable MFSU in the default ANTD-Pro, you need to add the following configuration:

```js
mfsu: {
  includes: [
    'rc-util/es/hooks/useMergedState',
    'swagger-ui-react',
    'moment',
    'moment/locale/*',
    'events',
    'lodash',
    '@ant-design/pro-layout/es/PageLoading',
    'antd/es/locale/*',
    'querystring',
  ],
  redirect: {
    '@umijs/plugin-request/lib/ui': {
      message: 'antd',
      notification: 'antd',
    },
  },
},
```

Also, because `dumi` is not yet compatible, you need to remove `@umijs/preset-dumi`.

## Additional configuration instructions

- In Includes, you can obfuscate precompiling all dependencies by using `moment/locale/*`, e.g. `moment/locale/zhCn`. But in the actual internationalization scenario, it is not necessary to carry out all the internationalization processing. Therefore, this is not a recommended way to write it, and you need to add a corresponding internationalization package for your project requirements.

## Q&A

### Multiinstance problem

#### Source of problem

Take `React` for example. After opening mfsu, the files in the project will be processed by `@umijs/import-to-await-require-plugin`:

```ts
// code written
import React from 'react';

// processed code
const { default: React } = await import('mf/react');
```

However, some libraries are not introduced using ES Module, such as `require`:

```js
// library code
const React = require('react');
```

Such code is not properly recognized by the plug-in, resulting in a different instance of React being used in the library and in the code. In this way, the React hooks mechanism will not execute correctly. `Invalid hook call. Hooks can only be called inside of the body of a function component.`.

Also, in some libraries, some hooks are exported, but are not correctly recognized, such as `rc-util`:

```js
import useMergedState from 'rc-util/es/hooks/useMergedState';
```

Because `rc-util` does not have a total export file, the dependency is not compiled correctly, so multiple instances are generated.

On the one hand, the problem of multiple instances can cause the project to not run correctly. On the one hand, because this library uses React, React will still be compiled normally, so MFSU can not play its own effect.

#### The solution

In the configuration, MFSU implements the following configuration:

```js
{
  mfsu: {
    includes: ['rc-util/es/hooks/useMergedState'],
  }
}
```

In this way, the import is added to the precompile and the entry is provided, solving the multi-instance problem.

Other related dependencies on alias can also be placed in appDepInfo, which MFSU will read at startup.

> If you want to import deep dependencies, import from 'es' instead of' lib 'directory.

### Umi's dynamic plugin

#### Source of problem

Umi's plugin mechanism generates a series of.umi/plugin-xxx files that define umi's exports. UMI cannot be precompiled by MFSU.

However, there are some static exports in umi, such as `Link` in `react-router-dom`. In the application, the common use methods are as follows:

```js
import { Link } from 'umi';
// In fact, after compiling
var { Link } = __webpack_require__('./node_module/react-router-dom');

// but router is
var { BrowserRouter: Router } = await import('mf/react-router-dom');
```

But since Link needs to use the Context of the Router, which is the precompiled version of MFSU. Link did not find the correct Context, resulting in an error.

In essence, this is a multi-instance problem.

#### The solution

In the configuration, MFSU implements the following configuration:

```js
{
  mfsu: {
    redirect: {
      // Redirect umi's Link export to 'react-router-dom'
      umi : {
        Link : 'react-router-dom',
      }
    }
  }
}
```

So, the code you write will compile to:

```js
import umi, { Link } from 'umi';

// compiled
import umi from 'umi';
import { Link } from 'react-router-dom';
```

In this way, you can ensure that the dependencies are imported correctly.
