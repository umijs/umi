---
order: 19
toc: content
translated_at: '2024-03-17T10:28:01.027Z'
---

# MFSU

## What is MFSU

MFSU is a package acceleration solution based on the new feature of webpack5, Module Federation. Its core idea is to divide and conquer by separating the compilation of application source code and application dependencies, and building less frequently changed application dependencies into a Module Federation remote application, thus avoiding the compilation of dependencies during application hot updates.

Activating MFSU significantly reduces the time needed for hot updates; therefore, we have enabled the MFSU feature by default in Umi projects. Of course, you can also disable it by configuring `mfsu: false`.

## Two Strategies of MFSU

The key point of MFSU is how to analyze the actual dependencies used in the application code. MFSU has two working modes based on different analysis methods.

### Normal Strategy (Compile-time Analysis)

Use the following configuration to enable

```ts {2}
mfsu: {
  strategy: 'normal',
}
```

In modern front-end projects, code needs to be transpiled before it is used in production. During this process, the transpiler (like babel) will insert new dependencies into the code. These inserted dependencies are invisible at the project code level but are collected through the transpilation plugins.

The compile-time analysis working mode of MFSU first compiles the application project source code separately, collecting the project's own dependencies and the dependencies introduced during compilation. After the compilation of the project code is completed, the collected results are used to continue the construction of the project dependency part of the code.

The entire process is serial, as shown in the example of building React references in the diagram below.

![normal-process](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*VRdhQZDag1UAAAAAAAAAAAAAARQnAQ)

### Eager Strategy (Scanning Method)

```ts {2}
mfsu: {
  strategy: 'eager',
}
```

Different from the compile-time analysis method, the scanning analysis method first reads all source code files in the project, and then obtains the project dependencies through static analysis. This process is very fast, taking only about 700ms for a project with 170,000 lines of code and more than 1400 files. The cost of such fast analysis is that the collected dependencies will miss the dependencies inserted during project code compilation; these dependencies will eventually be compiled and packaged together with the project code.

After analyzing the project dependencies, Umi takes this dependency information and parallelly compiles both the project code and dependencies.

As you can see from the diagram below, the compilation part is parallel.

![eager-process](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*XtZ1Spa9hMEAAAAAAAAAAAAAARQnAQ)


## Two Build Tools

MFSU supports using Webpack or esbuild to build project dependencies. The default configuration uses Webpack, and it is very compatible with the Webpack ecosystem.
Esbuild can be enabled with `mfsu: { esbuild: true }` to enjoy the high-speed construction of Esbuild.


## How to Choose

The advantage of **compile-time analysis** is that the collected dependencies are complete, and the construction and packaging of project codes and dependency codes are completely separated; after modifying the project code, only the project code part needs to be constructed. The disadvantage is also obvious, the construction process is serial.

The advantage of the **scanning method** is that the time-consuming code build is all parallel, which greatly improves the cold start time for larger projects. The downside is that some runtime dependencies will be compiled together with the project code.

Based on the analysis of advantages and disadvantages, the following suggestions are given:

- If you do not use the Module Federation feature, and project dependencies do not change frequently, it is recommended to try esbuild build first
- If you are in a mono repo project, it is recommended to use the "normal" strategy; it is recommended to enable the configuration ["monoreporedirect"](../api/config#monoreporedirect)
- If your project is large and has a large code base, the "eager" strategy is recommended
- If your project is just starting and dependencies will frequently change, the "eager" strategy is recommended
- For other types of projects, feel free to choose.

## Common Issues

### Dependency Missing

```bash /lodash.capitalize/
error - [MFSU][eager] build worker failed AssertionError [ERR_ASSERTION]: filePath not found of lodash.capitalize
```

Check your dependencies to ensure that the corresponding dependency has been installed. (As in the example of `lodash.capitalize`)

### Multiple Instances of React

The following error occurs in the browser

![multi-react-instance](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*ScIJTZobWE4AAAAAAAAAAAAAARQnAQ)

The root cause is that in some complex scenarios, React's code is packaged multiple times, resulting in multiple React instances at runtime. The solution is to avoid multiple instances using the `shared` configuration of Module Federation.
If other dependencies also have multiple instances issues, they can be solved in a similar way.

```ts {3-5}
mfsu: {
  shared: {
    react: {
      singleton: true,
    },
  },
},
```
:::info{title=⚠️}
If the [MF plugin](../max/mf) is enabled, you need to enable `shared`, please [refer to](../max/mf#using-with-mfsu).
:::	

### Externals script Compatibility Issue

If project dependency A depends on B, and the project has configured an externals script type for B as follows.

```ts
externals: {
  b: ['script https://cdn/b.js', b]
}
```

It will cause an error when enabling MFSU.

```ts
import * as b from 'b';
console.log(b);
```

Normally, b should be Module information, but what is obtained is `Promise<Module>`. I understand this is a problem with webpack, which has not handled the compatibility issue between externals script and module federation well, possibly also because externals script is rarely known and used.

The solution is not to use it mixed with MFSU, only enable it when `process.env.NODE_ENV === 'production'`.

```ts
externals: {
  ...(process.env.NODE_ENV === 'production' ? {b: ['script https://cdn/b.js', b]} : {})
}
```

### Dependency Cycle Issue

#### Scenario 1

In a monorepo, the project depends on package A, A depends on package B, and B is provided by a subpackage in the project monorepo. This forms a situation where the project source code depends on A, and A depends back on the project source code.
In this case, it is recommended to use the MFSU's exclude configuration.

```ts {2-4}
mfsu: {
  exclude: [
    'B'
  ]
}
```

#### Scenario 2

An unreasonable implementation of a certain dependency in the project, the project relies on the functionality related to the Bigfish plugin (i.e., references the content under the `.umi` directory); after enabling MFSU, the project may not compile normally; The solution and Scenario 1 are a similar configuration. Add this package to the `mfsu.exclude` field.


### Worker Compatibility Issue

If the project code needs to be used in a Worker, then the dependencies required by the Worker need to be added to the MFSU's [`exclude` configuration](../api/config#mfsu).
Worker related dependencies can only be bypassed in this way, because Module Federation shares modules through the `window` object, so modules from Module Federation cannot be used in workers.
