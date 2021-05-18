# MFSU (Module Federation Speed Up)

## What is MFSU

MFSU is a speed-up package solution based on the new WebPack5 feature Module Federation.

Let's say our application is A. The MFSU builds a virtual application B that exposes all dependencies, and then prebuilds B. A then uses the pre-compiled dependencies in B. Thus, the compilation time of A is saved and the compilation is accelerated.

## Speed up effect

Take ANTD-Pro as an example:

- Secondary startup: normal startup time '54s', MFSU startup time' 14s'
- Hot update: Ordinary hot update time '1s', MFSU hot update time' 300ms'

Turning on MFSU improves application startup and hot update performance by about three times.

## implementation in umi

- 'webpack5' and 'dynamicImport' must be enabled.
- Dependencies will be built under '.umi/.mfsu '. You can see many files starting with '.umi/.mfsu'. These are the pre-built dependencies of a built virtual application. The main entry is' \_\_umi_mfsu_remotEentry.js'.
- A recompile is triggered each time 'dependencies' and 'peerdenPendencies' in applied 'package.json' change.

## Did I turn on MFSU correctly?

Some libraries, such as' plugin-dumi ', are not yet MFSU compatible and cannot be used properly in MFSU mode. And some dependencies may not be included correctly, resulting in not being overridden by the MFSU.

Because, you need to check that the following items are turned on correctly.

- Start the project and check if it starts properly. If you have a problem, you can ask an issue or check the FAQ below.
- Open Network and check the source of dependency load `Initiator`.
- Dependencies will be loaded by `load_script` instead of `devScript`.

If part of a dependency is loaded by `devScript`, it is not overwritten correctly. You need to find the name and location of the dependency and add it to `addDepInfo` or `extraDeps` or ` redirect`.

## Frequently Asked Questions

### Multi-instance problem

#### source of problem

Take `React` for example. After opening mfsu, the files in the project will be processed by `@umijs/import-to-await-require-plugin`:

```ts
// write the code
import React from 'react';

// Processed code
const { default: React } = await import('mf/react');
```

But some libraries may use strange postures:

```js
// library code
const React = require('react');
```

Such code is not properly recognized by the plug-in, resulting in a different instance of React being used in the library and in the code. In this way, the React hooks mechanism will not execute correctly. `Invalid hook call. Hooks can only be called inside of the body of a function component`.

Also, in some libraries, some hooks are exported, but are not correctly recognized, such as ` rc-util`:

```js
import useMergedState from 'rc-util/es/hooks/useMergedState';
```

Because `rc-util` does not have a total export file, the dependency is not compiled correctly, so multiple instances are generated.

On the one hand, the problem of multiple instances can cause the project to not run correctly. On the one hand, because this library uses React, React will still be compiled normally, so MFSU can not play its own effect.

#### Solution

In the configuration, MFSU implements the following configuration:

```js
{
  mfsu: {
    extraDeps: ['rc-util/es/hooks/useMergedState'],
  }
}
```

In this way, the import is added to the precompile and the entry is provided, solving the multi-instance problem.

Other related dependencies on alias can also be placed in appDepInfo, which MFSU will read at startup.

### umi dynamic plugin

#### source of problem

Umi's plugin mechanism generates a series of.umi/plugin-xxx files that define umi's exports. UMI cannot be precompiled by MFSU.

However, there are some static exports in umi, such as `Link` in `react-router-dom`. In the application, the common use methods are as follows:

```js
import { Link } from 'umi';
// actually compile
var { Link } = __webpack_require__('./node_module/react-router-dom');

// But the router is
var { BrowserRouter: Router } = await import('mf/react-router-dom');
```

But since Link needs to use the Context of the Router, which is the precompiled version of MFSU. Link did not find the correct Context, resulting in an error.

In essence, this is a multi-instance problem.

#### Solution

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

// the compiled
import umi from 'umi';
import { Link } from 'react-router-dom';
```

In this way, you can ensure that the dependencies are imported correctly.
