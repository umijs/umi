---
nav:
  title: 插件
---

# 插件 API

## 核心方法

[Service](https://github.com/umijs/umi/blob/master/packages/core/src/Service/Service.ts) 和 [PluginAPI](https://github.com/umijs/umi/blob/master/packages/core/src/Service/PluginAPI.ts) 里定义的方法。

### applyPlugins({ key: string, type: api.ApplyPluginsType, initialValue?: any, args?: any })

取得 register 注册的 hooks 执行后的数据。

e.g.

```ts
const foo = await api.applyPlugins({
  key: 'foo',
  type: api.ApplyPluginsType.add,
  initialValue: [],
});
console.log(foo); // ['a', 'b']
```

### describe({ id?: string, key?: string, config?: { default, schema, onChange } })

注册阶段执行，用于描述插件或插件集的 id、key、配置信息、启用方式等。

e.g.

```ts
api.describe({
  key: 'history',
  config: {
    default: 'browser',
    schema(joi) {
      return joi.string();
    },
    onChange: api.ConfigChangeType.regenerateTmpFiles,
  },
  enableBy: api.EnableBy.config,
});
```

注：

- `config.default` 为配置的默认值，用户没有配置时取这个
- `config.schema` 用于声明配置的类型，基于 [joi](https://hapi.dev/family/joi/)，**如果你希望用户进行配置，这个是必须的**，否则用户的配置无效
- `config.onChange` 是 dev 阶段配置被修改后的处理机制，默认会重启 dev 进程，也可以修改为 `api.ConfigChangeType.regenerateTmpFiles` 只重新生成临时文件，还可以通过函数的格式自定义
- `enableBy` 为启用方式，默认是注册启用，可更改为 `api.EnableBy.config`，还可以用自定义函数的方式决定其启用时机（动态生效）

### register({ key: string, fn: Function, pluginId?: string, before?: string, stage?: number })

为 `api.applyPlugins` 注册可供其使用的 hook。

e.g.

```ts
// 可同步
api.register({
  key: 'foo',
  fn() {
    return 'a';
  },
});

// 可异步
api.register({
  key: 'foo',
  async fn() {
    await delay(100);
    return 'b';
  },
});
```

然后通过 `api.applyPlugins` 即可拿到 `['a', 'b']`，

```ts
const foo = await api.applyPlugins({
  key: 'foo',
  type: api.ApplyPluginsType.add,
  initialValue: [],
});
console.log(foo); // ['a', 'b']
```

注：

- fn 支持同步和异步，异步通过 Promise，返回值为 Promise 即为异步
- fn 里的内容需结合 `api.appyPlugins` 的 type 参数来看 _ 如果是 `api.ApplyPluginsType.add`，需有返回值，这些返回值最终会被合成一个数组 _ 如果是 `api.ApplyPluginsType.modify`，需对第一个参数做修改，并返回 \* 如果是 `api.ApplyPluginsType.event`，无需返回值
- stage 和 before 都是用于调整执行顺序的，参考 [tapable](https://github.com/webpack/tapable)
- stage 默认是 0，设为 -1 或更少会提前执行，设为 1 或更多会后置执行

### registerCommand({ name: string, alias?: string, fn: Function })

注册命令。

e.g.

```ts
api.registerCommand({
  name: 'generate',
  alias: 'g',
  fn: async ({ args }) => {
    await delay(100);
    return `hello ${api.args.projectName}`;
  },
});
```

注：

- `alias` 为别名，比如 generate 的别名 g
- `fn` 的参数为 `{ args }`，args 的格式同 [yargs](https://github.com/yargs/yargs) 的解析结果，需要注意的是 `_` 里的 command 本身被去掉了，比如执行 `umi generate page foo`，`args._` 为 `['page', 'foo']`

### registerMethod({ name: string, fn?: Function, exitsError?: boolean })

往 api 上注册方法。可以是 `api.register()` 的快捷使用方式，便于调用；也可以不是，如果有提供 `fn`，则执行 `fn` 定义的函数。

e.g.

```ts
api.registerMethod({
  name: 'foo',
  fn() {
    return 'foo';
  },
  exitsError: false,
});
```

注：

- 除 @umijs/preset-build-in 外，通常不建议注册额外的方法，因为没有 ts 提示，直接使用 `api.register()` 就好
- `exitsError` 默认为 true，如果方法存在则报错

### registerPresets(presets: string[])

注册插件集，参数为路径数组。

e.g.

```ts
api.registerPresets([
  { id: 'preset_2', key: 'preset2', apply: () => () => {} },
  require.resolve('./preset_3'),
]);
```

### registerPlugins(plugins: string[])

注册插件，参数为路径数组。

e.g.

```ts
api.registerPlugins([
  { id: 'preset_2', key: 'preset2', apply: () => () => {} },
  require.resolve('./preset_3'),
]);
```

### hasPlugins(pluginIds: string[])

判断是否有注册某个插件。

插件的 id 规则，

- id 默认为包名
- 文件级的插件，如果没有声明 id，默认为 name + 相对路径，比如 `@umijs/preset-react/lib/plugins/crossorigin/crossorigin`
- 内置插件以 `@@` 为前缀，比如 `@@/registerMethod`

注：

- 如果在注册阶段使用，只能判断**在他之前**是否有注册某个插件

e.g.

```ts
// 判断是否有注册 @umijs/plugin-dva
api.hasPlugins(['@umijs/plugin-dva']);
```

### hasPresets(presetIds: string[])

判断是否有注册某个插件集。

插件集的 id 规则，

e.g.

```ts
// 判断是否有注册 @umijs/preset-ui
api.hasPresets(['@umijs/preset-ui']);
```

注：

- 如果在注册阶段使用，只能判断**在他之前**是否有注册某个插件集

### skipPlugins(pluginIds: string[])

声明哪些插件需要被禁用，参数为插件 id 的数组。

e.g.

```ts
// 禁用 plugin-dva 插件
api.skipPlugins(['@umijs/plugin-dva']);
```

## 扩展方法

通过 `api.registerMethod()` 扩展的方法。

### addBeforeMiddlewares

添加在 webpack compiler 中间件之前的中间件，返回值格式为 express 中间件。

e.g.

```ts
api.addBeforeMiddlewares(() => {
  return (req, res, next) => {
    if (false) {
      res.end('end');
    } else {
      next();
    }
  };
});
```

### addDepInfo

添加依赖信息，包括 semver range 和别名信息。

```js
api.addDepInfo((memo) => {
  return {
    name: 'foo',
    range: pkg.dependencies.foo,
    alias: [pathToFooPackage],
  };
});
```

### addEntryCode

在入口文件最后添加代码。

e.g.

```ts
api.addEntryCode(() => {
  return `console.log('works!')`;
});
```

### addEntryCodeAhead

在入口文件最前面（import 之后）添加代码。

e.g.

```ts
api.addEntryCodeAhead(() => {
  return `console.log('works!')`;
});
```

### addEntryImports

在入口文件现有 import 的后面添加 import。

e.g.

```ts
api.addEntryImport(() => {
  return [
    {
      source: '/modulePath/xxx.js',
      specifier: 'moduleName',
    },
  ];
});
```

### addEntryImportsAhead

在入口文件现有 import 的前面添加 import。

e.g.

```ts
api.addEntryImportsAhead(() => [{ source: 'anypackage' }]);
```

### addHTMLMetas

在 HTML 中添加 meta 标签。

e.g.

```ts
api.addHTMLMetas(() => {
  return [
    {
      name: 'keywords',
      content: 'umi, umijs',
    },
  ];
});
```

### addHTMLLinks

在 HTML 中添加 Link 标签。

e.g.

```ts
api.addHTMLLinks(() => {
  return [
    {
      rel: 'shortcut icon',
      type: 'image/x-icon',
      href: api.config.favicon!,
    },
  ];
});
```

### addHTMLStyles

在 HTML 中添加 Style 标签。

e.g.

```ts
api.addHTMLStyles(() => {
  return [
    {
      content: `.className { }`,
    },
  ];
});
```

### addHTMLScripts

在 HTML 尾部添加脚本。

e.g.

```ts
api.addHTMLScript(() => {
  return [
    {
      content: '',
      src: '',
      // ...attrs
    },
  ];
});
```

### addHTMLHeadScripts

在 HTML 头部添加脚本。

e.g.

```ts
api.addHTMLHeadScripts(() => {
  return [
    {
      content: '',
      src: '',
      // ...attrs
    },
  ];
});
```

### addMiddlewares

添加在 webpack compiler 中间件之后的中间件，返回值格式为 express 中间件。

e.g.

```ts
api.addMiddlewares(async (ctx: Context, next: any) => {
  // do something before request
  await next();
  // do something after request
});
```

### addPolyfillImports

添加补充相关的 import，在整个应用的最前面执行。

e.g.

```ts
api.addPolyfillImports(() => [{ source: './core/polyfill' }]);
```

### addProjectFirstLibraries

添加以项目依赖为优先的依赖库列表，返回值为 `{ name: string; path: string }`。

e.g.

```ts
api.addProjectFirstLibraries(() => ({
  name: 'antd',
  path: dirname(require.resolve('antd/package.json')),
}));
```

比如：

- `api.addProjectFirstLibraries(() => ({ name: 'antd', path: dirname(require.resolve('antd/package.json')) }))`，然后用户依赖 antd 时，如果项目有依赖 antd，会用项目依赖的 antd，否则用内置的 antd

### addRuntimePlugin

添加运行时插件，返回值格式为表示文件路径的字符串。

e.g.

```ts
api.addRuntimePlugin(() => join(__dirname, './runtime'));
```

### addRuntimePluginKey

添加运行时插件的 key，返回值格式为字符串。

e.g.

```ts
api.addRuntimePluginKey(() => 'some');
```

内置的初始值有：

- patchRoutes
- rootContainer
- render
- onRouteChange

### addUmiExports

添加需要 umi 额外导出的内容，返回值格式为 `{ source: string, specifiers?: (string | { local: string, exported: string })[], exportAll?: boolean }`。

比如 `api.addUmiExports(() => { source: 'dva', specifiers: ['connect'] })`，然后就可以通过 `import { connect } from 'umi'` 使用 `dva` 的 `connect` 方法了。

### addTmpGenerateWatcherPaths

添加重新临时文件生成的监听路径。

e.g.

```ts
api.addTmpGenerateWatcherPaths(() => ['./app.ts']);
```

### chainWebpack(config, { webpack })

通过 [webpack-chain](https://github.com/neutrinojs/webpack-chain) 的方式修改 webpack 配置。

比如：

```ts
api.chainWebpack((config, { webpack, env, createCSSRule }) => {
  // Set alias
  config.resolve.alias.set('a', 'path/to/a');

  // Delete progress bar plugin
  config.plugins.delete('progress');

  return config;
});
```

注：

- 需要有返回值

### getPort()

获取端口号，dev 时有效。

e.g.

```ts
const Port = api.getPort();
```

### getHostname()

获取 hostname，dev 时有效。

e.g.

```ts
const hostname = api.getHostname();
```

### modifyBabelOpts

修改 babel 配置项。

e.g.

```ts
api.modifyBabelOpts((babelOpts) => {
  const hmr = api.config.dva?.hmr;
  if (hmr) {
    const hmrOpts = lodash.isPlainObject(hmr) ? hmr : {};
    babelOpts.plugins.push([require.resolve('babel-plugin-dva-hmr'), hmrOpts]);
  }
  return babelOpts;
});
```

### modifyBabelPresetOpts

修改 @umijs/babel-preset-umi 的配置项。

e.g.

```ts
api.modifyBabelPresetOpts((opts) => {
  return {
    ...opts,
    import: (opts.import || []).concat([
      { libraryName: 'antd', libraryDirectory: 'es', style: true },
      { libraryName: 'antd-mobile', libraryDirectory: 'es', style: true },
    ]),
  };
});
```

### modifyBundleConfig

修改 bundle 配置。

e.g.

```ts
api.modifyBundleConfig((bundleConfig, { env, type, bundler: { id } }) => {
  // do something
  return bundleConfig;
});
```

参数：

- `initialValue`：bundleConfig，可能是 webpack 的配置，通过 `bundler.id` 区分
- `args` _ `type`：现在有两个，ssr 和 csr _ `env`：即 api.env \* `bundler`：包含 id 和 version，比如：`{ id: 'webpack': version: 4 }`

### modifyBundleConfigs

修改 bundle 配置数组，比如可用于 dll、modern mode 的处理。

e.g.

```ts
api.modifyBundleConfigs(async (memo, { getConfig }) => {
  return [...memo];
});
```

参数：

- `args` _ `getConfig()`：用于获取额外的一份配置 _ `env`：即 api.env \* `bundler`：包含 id 和 version，比如：`{ id: 'webpack': version: 4 }`

### modifyBundleConfigOpts

修改获取 bundleConfig 的函数参数。

e.g.

```ts
api.modifyBundleConfigOpts((memo) => {
  memo.miniCSSExtractPluginPath = require.resolve('mini-css-extract-plugin');
  memo.miniCSSExtractPluginLoaderPath = require.resolve(
    'mini-css-extract-plugin/dist/loader',
  );
  return memo;
});
```

### modifyBundleImplementor

比如用于切换到 webpack@5 或其他。

e.g.

```ts
import webpack from 'webpack';

// 换成 webpack@5
api.modifyBundleImplementor(() => {
  return webpack;
});
```

### modifyBundler

比如用于切换到 parcel 或 rollup 做构建。

e.g.

```ts
api.modifyBundler(() => {
  return require('@umijs/bundler-rollup').Bundler;
});
```

### modifyConfig

修改最终配置。

e.g.

```ts
api.modifyConfig((memo) => {
  return {
    ...memo,
    ...defaultOptions,
  };
});
```

注：

- 修改后的值不会再做 schema 校验

### modifyDefaultConfig

修改默认配置。

e.g.

```ts
api.modifyDefaultConfig((memo) => {
  return {
    ...memo,
    ...defaultOptions,
  };
});
```

### modifyHTML

修改 HTML，基于 [cheerio](https://github.com/cheeriojs/cheerio) 的 ast。

e.g.

```ts
api.modifyHTML(($, { route }) => {
  $('h2').addClass('welcome');
  return $;
});
```

### modifyHTMLChunks

修改 html 中的 js 文件引入，可以用于不同的页面使用，不同的 [chunks](../config#chunks) 配置。

e.g.

```ts
api.modifyHTMLChunks(async (memo, opts) => {
  const { route } = opts;
  // do something
  return memo;
});
```

### modifyExportRouteMap <Badge>3.2+</Badge>

修改导出路由对象 `routeMap`（路由与输出 HTML 的映射关系），触发时机在 HTML 文件生成之前，默认值为 `[{ route: { path: '/' }, file: 'index.html' }]`。

参数：

- `html`：HTML 工具类实例

注：

- 只在 `umi build` 时起效

例如 `exportStatic` 插件根据路由生成对应 HTML：

```ts
api.modifyExportRouteMap(async (defaultRouteMap, { html }) => {
  return await html.getRouteMap();
});
```

### modifyDevHTMLContent <Badge>3.2+</Badge>

`umi dev` 时修改输出的 HTML 内容。

参数：

- `req`：Request 对象，可获取当前访问路径

例如希望 `/404` 路由直接返回 `Not Found`：

```ts
api.modifyDevHTMLContent(async (defaultHtml, { req }) => {
  if (req.path === '/404') {
    return 'Not Found';
  }
  return defaultHtml;
});
```

### modifyProdHTMLContent <Badge>3.2+</Badge>

`umi build` 时修改输出的 HTML 内容。

参数（相当于一个 `RouteMap` 对象）：

- `route`：路由对象
- `file`：输出 HTML 名称

例如可以在生成 HTML 文件前，做预渲染：

```ts
api.modifyProdHTMLContent(async (content, args) => {
  const { route } = args;
  const render = require('your-renderer');
  return await render({
    path: route.path,
  });
});
```

### modifyPaths

修改 paths 对象。

e.g.

```ts
api.modifyPaths(async (paths) => {
  return memo;
});
```

参数：

- `initialValue`: paths 对象

### modifyRendererPath

修改 renderer 路径，用于使用自定义的 renderer。

e.g.

```ts
api.modifyRendererPath(() => {
  return dirname(require.resolve('@umijs/renderer-mpa/package.json'));
});
```

### modifyPublicPathStr

修改 publicPath 字符串。

e.g.

```ts
api.modifyPublicPathStr(() => {
  return api.config.publicPath || '/';
});
```

参数：

- `route`: 当前路由

注：

- 仅在配置了 runtimePublicPath 或 exportStatic?.dynamicRoot 时有效

### modifyRoutes

修改路由。

e.g.

```ts
api.modifyRoutes((routes: any[]) => {
  return resetMainPath(routes, api.config.mainPath);
});
```

### onPatchRoute({ route, parentRoute })

修改路由项。

e.g.

```ts
api.onPatchRoute(({ route }) => {
  if (!api.config.exportStatic?.htmlSuffix) return;
  if (route.path) {
    route.path = addHtmlSuffix(route.path, !!route.routes);
  }
});
```

### onPatchRouteBefore({ route, parentRoute })

修改路由项。

e.g.

```ts
api.onPatchRouteBefore(({ route }) => {
  if (!api.config.exportStatic?.htmlSuffix) return;
  if (route.path) {
    route.path = addHtmlSuffix(route.path, !!route.routes);
  }
});
```

### onPatchRoutes({ routes, parentRoute })

修改路由数组。

e.g.

```ts
api.onPatchRoutes(({ routes }) => {
  // copy / to /index.html
  let rootIndex = null;
  routes.forEach((route, index) => {
    if (route.path === '/' && route.exact) {
      rootIndex = index;
    }
  });
  if (rootIndex !== null) {
    routes.splice(rootIndex, 0, {
      ...routes[rootIndex],
      path: '/index.html',
    });
  }
});
```

### onPatchRoutesBefore({ routes, parentRoute })

修改路由数组。

e.g.

```ts
api.onPatchRoutesBefore(({ routes }) => {
  // copy / to /index.html
  let rootIndex = null;
  routes.forEach((route, index) => {
    if (route.path === '/' && route.exact) {
      rootIndex = index;
    }
  });
  if (rootIndex !== null) {
    routes.splice(rootIndex, 0, {
      ...routes[rootIndex],
      path: '/index.html',
    });
  }
});
```

### onBuildComplete({ err?, stats? })

构建完成时可以做的事。

e.g.

```ts
api.onBuildComplete(({ err }) => {
  if (!err) {
    // do something
  }
});
```

注：

- 可能是失败的，注意判断 err 参数

### onDevCompileDone({ isFirstCompile: boolean, stats: webpack.Stats })

编译完成时可以做的事。

e.g.

```ts
api.onDevCompileDone(({ stats, type }) => {
  // don't need ssr bundler chunks
  if (type === BundlerConfigType.ssr) {
    return;
  }
  // store client build chunks
  sharedMap.set('chunks', stats.compilation.chunks);
});
```

注：

- 不包含编译失败

### onGenerateFiles

生成临时文件，触发时机在 webpack 编译之前。

e.g.

```ts
api.onGenerateFiles(() => {
  api.writeTmpFile({
    path: 'any.ts',
    content: '',
  });
});
```

### onPluginReady()

在插件初始化完成触发。在 `onStart` 之前，此时还没有 config 和 paths，他们尚未解析好。

e.g.

```ts
api.onPluginReady(() => {
  // do something
});
```

### onStart()

在命令注册函数执行前触发。可以使用 config 和 paths。

e.g.

```ts
api.onStart(() => {
  // do something
});
```

### onExit()

dev 退出时触发。

e.g.

```ts
api.onExit(() => {
  // do something
});
```

参数：

- `signal`: 值为 SIGINT、SIGQUIT 或 SIGTERM

注：

- 只针对 dev 命令有效

### writeTmpFile({ path: string, content: string, skipTSCheck?: boolean })

写临时文件。

e.g.

```ts
api.onGenerateFiles(() => {
  api.writeTmpFile({
    path: 'any.ts',
    content: '',
  });
});
```

参数：

- `path`：相对于临时文件夹的路径
- `content`：文件内容
- `skipTSCheck`：默认为 `true`，`path` 为 ts 或 tsx 文件，不检查 TypeScript 类型错误，如果希望插件对用户项目进行 TypeScript 类型检查，可以设置为 `false`。

注：

- 不能在注册阶段使用，通常放在 `api.onGenerateFiles()` 里，这样能在需要时重新生成临时文件
- 临时文件的写入做了缓存处理，如果内容一致，不会做写的操作，以减少触发 webpack 的重新编译

## 属性

### args

命令行参数。

### babelRegister.setOnlyMap({ key: string, value: string[] })

设置需要走 babel 编译的文件列表。

注：

- 如果有 watch 操作，每次重复设置时请保持 key 相同

### config

用户配置。

注：

- 注册阶段不能获取到，所以不能在外面 `const { config } = api;` 然后在函数体里使用，而是需要在里面通过 `api.paths.cwd` 使用

### cwd

当前路径。

### env

即 process.env.NODE_ENV，可能有 `development`、`production` 和 `test`。

比如，

- 命令行 `umi dev --foo`，args 为 `{ _: [], foo: true }`
- 命令行 `umi g page index --typescript --less`，args 为 `{ _: ['page', 'index'], typescript: true, less: true }`

### id

插件 id，通常是包名。

### logger

插件日志类，包含 `api.logger.(log|info|debug|error|warn|profile)`

其中 `api.logger.profile` 可用于性能耗时记录，例如：

```ts
export default (api) => {
  api.logger.profile('barId');
  setTimeout(() => {
    api.logger.profile('barId');
  });
};

// => [PROFILE] Completed in *ms
```

### key

插件的配置 key，通常是包名的简写。

比如 `@umijs/plugin-dva`，其 key 为 `dva`；比如 `umi-plugin-antd`，其 key 为 `antd`。

### paths

相关路径，包含：

- `cwd`，当前路径
- `absSrcPath`，src 目录绝对路径，需注意 src 目录是可选的，如果没有 src 目录，`absSrcPath` 等同于 `cwd`
- `absPagesPath`，pages 目录绝对路径
- `absTmpPath`，临时目录绝对路径
- `absOutputPath`，输出路径，默认是 `./dist`
- `absNodeModulesPath`，node_modules 目录绝对路径
- `aliasedTmpPath`，以 `@` 开头的临时路径，通常用于

注：

- 注册阶段不能获取到，所以不能在外面 `const { paths } = api;` 然后在函数体里 `paths.cwd` 使用，而是需要在里面通过 `api.paths.cwd` 使用

### pkg

当前项目的 package.json，格式为 Object。

### service

Service 实例。通常不需要用到，除非你知道为啥要用。

### stage

Service 运行阶段。

### userConfig

纯用户配置，就是 `.umirc` 或 `config/config` 里的内容，没有经过 defaultConfig 以及插件的任何处理。

注：

- 和 config 的区别是，可以在注册阶段取到

### utils

utils 方法，详见 [@umijs/utils/src/index.ts](https://github.com/umijs/umi/blob/master/packages/utils/src/index.ts)。包含外部库：

- `lodash` : 导出自 `lodash`, 实用的 js 工具库。
- `got` : 导出自 `got`, 轻量级的请求库。
- `deepmerge` : 导出自 `deepmerge`, 将两个对象的可以枚举属性深度合并。
- `semver` : 导出自 `semver`, 用于实现版本号的解析和比较，规范版本号的格式。常见于版本过低提示用户升级等场景。
- `Mustache` : 导出自 `mustache`, 无逻辑的模版语法，是 JavaScript 中的 mustache 模板系统的零依赖实现。
- `address` : 导出自 `address`, 用于获取当前计算机的 IP ，MAC 和 DNS 服务器地址等。
- `cheerio` : 导出自 `cheerio`, 用于方便的处理爬取到的网页内容，在服务端对 DOM 结构进行方便的操作。
- `clipboardy` : 导出自 `clipboardy`, 用于对剪贴板内容写入与读取的处理。
- `chokidar` : 导出自 `chokidar`, 用于监听文件的变化。
- `createDebug`, `Debugger` : 导出自 `debug`, 用于控制调试日志的输出。
- `chalk` : 导出自 `chalk`, 常用于在终端中输出彩色文字，支持链式调用，能够设置文本样式、颜色、背景色等。
- `signale` : 导出自 `signale`, 用于日志记录、状态报告以及处理其他 Node 模块和应用的输出渲染方式。
- `portfinder` : 导出自 `portfinder`, 常用于在判断端口是否被占用或者获取没有被占用的端口等场景。
- `glob` : 导出自 `glob`, 用于获取匹配对应规则的文件。
- `pkgUp` : 导出自 `pkg-up`, 查找最近的 package.json 文件。
- `resolve` : 导出自 `resolve`, 实现了 node 的 require.resolve() 算法, 提供了方便处理获取模块完整路径相关需求的方法。
- `spawn` : 导出自 `cross-spawn` , 已经封装好了 Node.js 子进程（child_process）模块下 `spawn` 函数的跨平台写法的相关细节, 直接使用其调用系统上的命令如 `npm` 即可。
- `execa`: 导出自 `execa`, 更好的子进程管理工具。相当于衍生一个 shell，传入的 command 字符串在该 shell 中直接处理。
- `mkdirp` : 导出自 `mkdirp`, node 中 `mkdir -p` 功能的实现, 用于在 Node.js 中递归式创建目录及其子目录。
- `rimraf` : 导出自 `rimraf`, node 中 `rm -rf` 功能的实现,
- `yargs` : 导出自 `yargs`, 用于创建交互式命令行工具，能够方便的处理命令行参数。
- `yParser` : 导出自 `yargs-parser`, `yargs` 使用的强大 option 解析器, 用于解析命令行参数。
- `parser` : 导出自 `@babel/parser`, 解析代码生成 AST 抽象语法树。
- `traverse` : 导出自 `@babel/traverse`, 对 AST 节点进行递归遍历。
- `t` : 导出自 `@babel/types`, 用于 AST 节点的 Lodash 式工具库。它包含了构造、验证以及变换 AST 节点的方法。 该工具库包含考虑周到的工具方法，对编写处理 AST 逻辑非常有用。

内部工具方法

- `isBrowser`, 判断是否在浏览器环境。
- `isWindows`, 判断当前是否是 windows 系统。
- `isSSR`, whether SSR success in client。
- `isLernaPackage`, 判断是否存在 `lerna.json` 文件。
- `winPath`, 将文件路径转换为兼容 window 的路径，用于在代码中添加 `require('/xxx/xxx.js')` 之类的代码。
- `winEOL`, 在 windows 环境下，很多工具都会把换行符 lf 自动改成 crlf, 为了测试精准需要将换行符转化一下。
- `compatESModuleRequire`, 兼容 ESModule 以及 Require 为 Require。
- `mergeConfig`, 对象合并。
- `randomColor`, 随机生成颜色。
- `delay`, 延迟函数。
- `Generator`, `mustache` 模版代码生成。
- `BabelRegister`, `@babel/register` 的简易封装。
- `parseRequireDeps`, 获取特定文件的本地依赖。
- `cleanRequireCache`, 清理特定 Module 在 require cache 以及 parent.children 中的引用。
- `getWindowInitialProps`, 获取 window.g_initialProps。
- `getFile`, 获取特定目录中文件的完整扩展名，javascript 文件的匹配顺序 `['.ts', '.tsx', '.js', '.jsx']`，css 文件的匹配顺序 `['.less', '.sass', '.scss', '.stylus', '.css']`。
- `routeToChunkName`, transform route component into webpack chunkName。

类型

- `ArgsType<T extends (...args: any[]) => any>`, 获取函数参数数组类型。
- `PartialKeys<T>`, 找出 T 中类型是 undefined 的 key。
- `PartialProps<T>`, 取出 T 中类型是 undefined 的属性。
- `NodeEnv`: 联合类型 'development' | 'production' | 'test'。
- `Omit<T, U>`, 排除 T 中的 U key。

注：

- 原则上同类功能的方法不允许使用其他的，以降低整体尺寸，比如请求用 got，参数处理用 yargs
- 编写插件时，除了 `api.utils`，还可通过 `import { utils } from 'umi'` 取到，通常用于非插件主入口的文件

### ApplyPluginsType

为 `api.applyPlugins()` 提供 type 参数的类型，包含三种：

- add
- modify
- event

### ConfigChangeType

为 `api.describe()` 提供 config.onChange 的类型，目前包含两种：

- restart，重启 dev 进程，默认是这个
- regenerateTmpFiles，重新生成临时文件

### EnableBy

插件的启用方式，包含三种，

- register
- config
- Function

### Html

### ServiceStage

`stage` 的枚举类型，通常用于和 `stage` 的比较。

## 环境变量

可以用到的环境变量。

- UMI_VERSION，umi 版本号
- UMI_DIR，`umi/package.json` 所在的文件夹路径
