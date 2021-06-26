# MFSU（Module Federation Speed Up）

Version requirement: 3.5+

## What is a MFSU

MFSU is a speed-up package solution based on the new WebPack5 feature Module Federation. The core principle is to build application dependencies as a Module Federation Remote application to eliminate the need to compile dependencies when the application is hot updated.

Therefore, turning on MFSU can significantly reduce the time required for hot updates. In production mode, you can also greatly improve deployment efficiency by compiling dependencies ahead of time.

## Speed up Effect

Take the ANTD-Pro initialization project as an example:

### dev phase

The testing process：

1. `yarn create umi`, select Ant-design-pro V5 to initialize the project.
2. `yarn` install dependencies and start testing Normal mode.
3. Delete `.umi` cache directory, open MFSU to test MFSU mode.

![测试](https://img.alicdn.com/imgextra/i3/O1CN01HMNHEV1PSJ3N0tm9L_!!6000000001839-2-tps-1234-453.png)

After MFSU is enabled, hot start is improved by **10 times**; Hot update increases **50%** more!

As the number of dependencies increases, the improvement will be more pronounced!

> _**Time is life.**_ ———Lu xun

### build phase

<img src="https://img.alicdn.com/imgextra/i4/O1CN01oOSedp1PPYg64lvCB_!!6000000001833-2-tps-1304-936.png" width="50%" />

When MFSU production mode is enabled, it is recommended to pre-build in the local environment and synchronize the production to Git, so that the speed of deployment on the server can be increased by about **30**!

> Due to unstable equipment performance, there may be partial error in the test.

## Usage

### The development phase

1. Initialize an UMI application.
2. Add `webpack5:{}`, `dynamicImport:{}` and `mfsu:{}` to config.ts.
3. `umi dev` starts the project. MFSU's progress bar appears while the dependency is being built. At this point the application may be suspended or the dependency may not exist. Please wait.
4. When cooperating with multiple people, you can configure `mfsu.development.output` to precompile the dependency output directory and add it to Git. When other developers start up, you can avoid the process of compiling the dependency again.

#### features

- Precompilation: By default, precompilation will build dependencies under `~/.umi/.cache/.mfsu`. The Webpack cache is also used to reduce the time required to recompile dependencies.
- Diff: When precompiled, this dependency information is built into `~/.mfsu/ mfsu_cache. json` for the dependency diff.
- Persistent cache: For requests with pre-compiled dependencies, `cache-control: max-age=31536000,immutable` is enabled, reducing the time it takes for the browser to refresh and pull dependencies.

### The construction phase

> warning: Since the precompiled dependencies implement part of Tree-shaking, it is not recommended to enable production mode in a package size sensitive project.

1. Configure config.ts: `mfsu.production = {}` to start production mode.
2. Execution: `umi build`. By default, production dependencies will be precompiled into `~/.mfsu-production`.
3. UMI builds the dependencies into `~/dist`, and MFSU moves the production precompiled dependencies into the output directory.
4. You can add `~/.mfsu-production` to Git using MFSU production mode. At deployment time, only the application files are compiled, which is extremely fast.

## Did I turn on MFSU correctly?

To get the best out of MFSU, all dependencies should be precompiled.

It is recommended that you check if the project dependencies are fully overwritten by the MFSU when you first start up. We can use Umi's own Webpack-Analyze for dependency analysis.

- `ANALYZE=1 umi dev` Start the project, check if it starts normally. If you have a problem, you can ask an issue or check the FAQ below.
- Check webpack-analyze for dependencies loaded from `./node_modules`. If not, the project is dependent and overridden by MFSU.
- If it still exists, please give us feedback through issue. We look forward to working with you to make MFSU better.

## Used in ANTD - Pro

MFSU already has perfect support for ANTD-Pro and Dumi. Enabling MFSU in the default ANTD-Pro is as easy as using it in any other project:

```js
mfsu: {},
```

## Q&A

### 1. react: Invalid hook call. Hooks can only be called inside of the body of a function component

MFSU precompiles import and import() dependencies. If a project exports a copy of React from precompile and `node_modules` at the same time due to some unexpected syntax, there will be a multi-instance problem with React.

Such as:

```js
// file 1
import React from 'react';
// compiled
const { default: React } = await import('react');

// file 2
var React = _interopRequireDefault('react'); // mfsu cannot recognize
```

Because of the Hooks implementation mechanism, React will throw errors.

When the project is started in `ANALYZE=1 umi dev`, you can determine whether the project introduces React in `node_modules`. If so, you need to try modifying the import statement.

### 2. React-router-dom: You should not use \<Link\> outside a \<Router\>

Umi is a dynamic definition that consists of fixed exports and plugins, so it cannot be precompiled.

There are static exports in umi, such as `Link` of react-router-dom. Similar to the problem above, this problem will occur if the `Context` is exported from the react-router-dom but the `Link` is exported from the node_modules/react-router-dom.

Inside MFSU, this problem was solved by a Babel plugin `babel-import-redirect-plugin` that redirected the `Link` exported from umi to `react-router-dom`.

If you encounter this problem, try `ANALYZE=1 umi dev` to ANALYZE the dependency source.
