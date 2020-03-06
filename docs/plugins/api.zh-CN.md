---
nav:
  title: 插件
---

# 插件 API

## 核心方法

[Service](https://github.com/umijs/umi/blob/master/packages/core/src/Service/Service.ts) 和 [PluginAPI](https://github.com/umijs/umi/blob/master/packages/core/src/Service/PluginAPI.ts) 里定义的方法。

### applyPlugins({ key: string, type: api.ApplyPluginsType, initialValue?: any, args?: any })

TODO。

### describe({ id?: string, key?: string, config?: { default, schema, onChange } })

注册阶段执行，用于描述插件或插件集的 id、key、配置信息、启用方式等。

e.g.

```js
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

```js
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

```js
const foo = await api.applyPlugins({
  key: 'foo',
  type: api.ApplyPluginsType.add,
  initialValue: [],
});
console.log(foo); // ['a', 'b']
```

注：

- fn 支持同步和异步，异步通过 Promise，返回值为 Promise 即为异步
- fn 里的内容需结合 `api.appyPlugins` 的 type 参数来看 _ 如果是 `api.ApplyPluginsType.add`，需有返回值，这些返回值最终会被合成一个数组 _ 如果是 `api.ApplyPluginsType. modify`，需对第一个参数做修改，并返回 \* 如果是 `api.ApplyPluginsType. event`，无需返回值
- stage 和 before 都是用于调整执行顺序的，参考 [tapable](https://github.com/webpack/tapable)
- stage 默认是 0，设为 -1 或更少会提前执行，设为 1 或更多会后置执行

### registerCommand({ name: string, alias?: string, fn: Function })

注册命令。

注：

- `alias` 为别名，比如 generate 的别名 g
- `fn` 的参数为 `{ args }`，args 的格式同 [yargs](https://github.com/yargs/yargs) 的解析结果，需要注意的是 `_` 里的 command 本身被去掉了，比如执行 `umi generate page foo`，`args._` 为 `['page', 'foo']`

### registerMethod({ name: string, fn?: Function, exitsError?: boolean })

往 api 上注册方法。可以是 `api.register()` 的快捷使用方式，便于调用；也可以不是，如果有提供 `fn`，则执行 `fn` 定义的函数。

注：

- 除 @umijs/preset-build-in 外，通常不建议注册额外的方法，因为没有 ts 提示，直接使用 `api.register()` 就好
- `exitsError` 默认为 true，如果方法存在则报错

### registerPresets(presets: string[])

注册插件集，参数为路径数组。

### registerPlugins(plugins: string[])

注册插件，参数为路径数组。

### hasPlugins(pluginIds: string[])

判断是否有注册某个插件。

插件的 id 规则，

- id 默认为包名
- 文件级的插件，如果没有声明 id，默认为 name + 相对路径，比如 `@umijs/preset-react/lib/plugins/crossorigin/crossorigin`
- 内置插件以 `@@` 为前缀，比如 `@@/registerMethod`

注：

- 如果在注册阶段使用，只能判断**在他之前**是否有注册某个插件

e.g.

```js
// 判断是否有注册 @umijs/plugin-dva
api.hasPlugins(['@umijs/plugin-dva']);
```

### hasPresets(presetIds: string[])

判断是否有注册某个插件集。

插件集的 id 规则，

e.g.

```js
// 判断是否有注册 @umijs/preset-ui
api.hasPresets(['@umijs/preset-ui']);
```

注：

- 如果在注册阶段使用，只能判断**在他之前**是否有注册某个插件集

### skipPlugins(pluginIds: string[])

声明哪些插件需要被禁用，参数为插件 id 的数组。

e.g.

```js
// 禁用 plugin-dva 插件
api.skipPlugins(['@umijs/plugin-dva']);
```

## 扩展方法

通过 `api.registerMethod()` 扩展的方法。

### addBeforeMiddewares

添加在 webpack compiler 中间件之前的中间件，返回值格式为 express 中间件。

### addEntryCode

在入口文件最后添加代码。

### addEntryCodeAhead

在入口文件最前面（import 之后）添加代码。

### addEntryImports

在入口文件现有 import 的后面添加 import。

### addEntryImportsAhead

在入口文件现有 import 的前面添加 import。

### addHTMLMetas

在 HTML 中添加 meta 标签。

### addHTMLLinks

在 HTML 中添加 Link 标签。

### addHTMLStyles

在 HTML 中添加 Style 标签。

### addHTMLScripts

在 HTML 尾部添加脚本。

```js
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

### addMiddewares

添加在 webpack compiler 中间件之后的中间件，返回值格式为 express 中间件。

### addPolyfillImports

添加补充相关的 import，在整个应用的最前面执行。

### addProjectFirstLibraries

添加以项目依赖为优先的依赖库列表，返回值为 `{ name: string; path: string }`。

比如：

- `api.addProjectFirstLibraries(() => ({ name: 'antd', path: dirname(require.resolve('antd/package.json')) }))`，然后用户依赖 antd 时，如果项目有依赖 antd，会用项目依赖的 antd，否则用内置的 antd

### addRuntimePlugin

添加运行时插件，返回值格式为表示文件路径的字符串。

### addRuntimePluginKey

添加运行时插件的 key，返回值格式为字符串。

内置的初始值有：

- patchRoutes
- rootContainer
- render
- onRouteChange

### addUmiExports

添加需要 umi 额外导出的内容，返回值格式为 ``{ source: string, specifiers?: (string | { local: string, exported: string })[], exportAll?: boolean }```。

比如 `api.addUmiExports(() => { source: 'dva', specifiers: ['connect'] })`，然后就可以通过 `import { connect } from 'umi'` 使用 `dva` 的 `connect` 方法了。

### addTmpGenerateWatcherPaths

添加重新临时文件生成的监听路径。

### chainWebpack(config, { webpack })

通过 [webpack-chain](https://github.com/neutrinojs/webpack-chain) 的方式修改 webpack 配置。

比如：

```js
api.chainWebpack((config, { webpack }) => {
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

### getHostname()

获取 hostname，dev 时有效。

### modifyBabelOpts

修改 babel 配置项。

### modifyBabelPresetOpts

修改 @umijs/babel-preset-umi 的配置项。

### modifyBundleConfig

修改 bundle 配置。

参数：

- `initialValue`：bundleConfig，可能是 webpack 的配置，通过 `bundler.id` 区分
- `args` _ `type`：现在有两个，ssr 和 csr _ `env`：即 api.env \* `bundler`：包含 id 和 version，比如：`{ id: 'webpack': version: 4 }`

### modifyBundleConfigs

修改 bundle 配置数组，比如可用于 dll、modern mode 的处理。

参数：

- `args` _ `getConfig()`：用于获取额外的一份配置 _ `env`：即 api.env \* `bundler`：包含 id 和 version，比如：`{ id: 'webpack': version: 4 }`

### modifyBundleConfigOpts

修改获取 bundleConfig 的函数参数。

### modifyBundleImplementor

比如用于切换到 webpack@5 或其他。

### modifyBundler

比如用于切换到 parcel 或 rollup 做构建。

### modifyConfig

修改最终配置。

注：

- 修改后的值不会再做 schema 校验

### modifyDefaultConfig

修改默认配置。

### modifyHTML

修改 HTML，基于 [cheerio](https://github.com/cheeriojs/cheerio) 的 ast。

```js
api.modifyHTML(($, { routs }) => {
  $('h2').addClass('welcome');
  return $;
});
```

### modifyHTMLChunks

TODO

### modifyPaths

修改 paths 对象。

参数：

- `initialValue`: paths 对象

### modifyPublicPathStr

修改 publicPath 字符串。

参数：

- `route`: 当前路由

注：

- 仅在配置了 runtimePublicPath 或 exportStatic?.dynamicRoot 时有效

### modifyRoutes

修改路由。

### onPatchRoute({ route })

修改路由项。

### onPatchRoutes({ routes })

修改路由数组。

### onBuildCompelete({ err?, stats? })

构建完成时可以做的事。

注：

- 可能是失败的，注意判断 err 参数

### onDevCompileDone({ isFirstCompile: boolean, stats: webpack.Stats })

编译完成时可以做的事。

注：

- 不包含编译失败

### onGenerateFiles

生成临时文件，触发时机在 webpack 编译之前。

### onPluginReady()

在插件初始化完成触发。在 `onStart` 之前，此时还没有 config 和 paths，他们尚未解析好。

### onStart()

在命令注册函数执行前触发。可以使用 config 和 paths。

### onExit()

dev 退出时触发。

参数：

- `signal`: 值为 SIGINT、SIGQUIT 或 SIGTERM

注：

- 只针对 dev 命令有效

### writeTmpFile({ path: string, content: string })

写临时文件。

参数：

- `path`：相对于临时文件夹的路径
- `content`：文件内容

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
export default api => {
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

utils 方法，详见 [@umijs/utils/src/index.ts](https://github.com/umijs/umi/blob/master/packages/utils/src/index.ts)。

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
