# Plugin API


## Core approach

[Service](https://github.com/umijs/umi/blob/master/packages/core/src/Service/Service.ts) and [PluginAPI](https://github.com/umijs/umi/blob/master/packages/core/src/Service/PluginAPI.ts).

### applyPlugins({ key: string, type: api.ApplyPluginsType, initialValue?: any, args?: any })

TODO

### describe({ id?: string, key?: string, config?: { default, schema, onChange } })

The registration phase is performed and is used to describe the id, key, configuration information, and activation method of the plug-in or plug-in set.

Example,

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

Note:

- `config.default` is the default value for configuration, this is taken when the user has not configured
- `config.schema` is used to declare the type of configuration, based on [joi](https://hapi.dev/family/joi/), **This is required if you want the user to configure**, otherwise the configuration will be invalid.
- `config.onChange` is the processing mechanism after the configuration of the dev stage is modified. The dev process will be restarted by default. It can also be changed to` api.ConfigChangeType.regenerateTmpFiles`. It only regenerates temporary files.
- `enableBy` is the enable method. It is registered and enabled by default. You can change it to` api.EnableBy.config`. You can also use a custom function to determine the enable time (dynamic effect)

### register({ key: string, fn: Function, pluginId?: string, before?: string, stage?: number })

Register hooks for `api.applyPlugins` to use.

Example,

```js
// Synchronizable
api.register({
  key: 'foo',
  fn() {
    return 'a';
  },
});

// Asynchronous
api.register({
  key: 'foo',
  async fn() {
    await delay(100);
    return 'b';
  },
});
```

Then you can get `['a', 'b']` via `api.applyPlugins`,

```js
const foo = await api.applyPlugins({
  key: 'foo',
  type: api.ApplyPluginsType.add,
  initialValue: [],
});
console.log(foo); // ['a', 'b']
```

Note:

- fn supports synchronous and asynchronous, asynchronous through Promise, the return value is Promise is asynchronous
- The content in fn needs to be combined with the type parameter of api.appyPlugins _ If it is api.ApplyPluginsType.add, there is a return value, These return values ​​will eventually be combined into an array _ if it is `api.ApplyPluginsType.modify`, Need to modify the first parameter and return \* If it is `api.ApplyPluginsType.event`, no return value is required
- stage and before are used to adjust the execution order, see [tapable](https://github.com/webpack/tapable)
- The stage default is 0, set to -1 or less will be executed early, set to 1 or more will be executed later

### registerCommand({ name: string, alias?: string, fn: Function })

Registration order.

Note:

- `alias` is an alias, such as the alias g of generate
- The parameter of `fn` is `{args}`. The format of args is the same as that of [yargs](https://github.com/yargs/yargs). Note that the command itself in` _` has been removed For example, execute `umi generate page foo`, and` args._` is `['page', 'foo']`

### registerMethod({ name: string, fn?: Function, exitsError?: boolean })

Register method on api. It can be a shortcut of `api.register()`, which is easy to call. Or it can be not. If `fn` is provided, the function defined by` fn` is executed.

Note:

- Except for @umijs/preset-build-in, it is generally not recommended to register additional methods, because there is no ts prompt, just use `api.register()`.
- `exitsError` is true by default, and an error is reported if the method exists

### registerPresets(presets: string[])

Register the plugin set, the parameter is an array of paths.

### registerPlugins(plugins: string[])

Register the plugin, the parameter is an array of paths.

### hasPlugins(pluginIds: string[])

Determine whether a plugin has been registered.

Plugin id rules,

- id defaults to the package name
- File-level plugins, if no id is declared, the default is name + relative path, such as `@ umijs/preset-react/lib/plugins/crossorigin/crossorigin`
- Built-in plugins are prefixed with `@@`, such as `@@/registerMethod`

Note:

- If it is used during the registration phase, it can only be judged **before him** whether a certain plugin is registered

Example,

```js
// Determine if there is a registration @umijs/plugin-dva
api.hasPlugins(['@umijs/plugin-dva']);
```

### hasPresets(presetIds: string[])

Determine if a plugin set is registered.

Plugin set id rules,

Example,

```js
// Determine if there is registration @umijs/preset-ui
api.hasPresets(['@umijs/preset-ui']);
```

Note:

- If it is used during the registration phase, it can only be judged whether **before him** has registered a certain plugin set

### skipPlugins(pluginIds: string[])

Declare which plugins need to be disabled. The parameter is an array of plugin ids.

Example,

```js
// Disable plugin-dva plugin
api.skipPlugins(['@umijs/plugin-dva']);
```

## Extension method

Methods extended by `api.registerMethod()`.

### addBeforeMiddewares

Add the middleware before the webpack compiler middleware, and the return value format is express middleware.

### addEntryCode

Add code at the end of the entry file.

### addEntryCodeAhead

Add code at the top of the entry file (after import).

### addEntryImports

Add import after the existing import in the entry file.

### addEntryImportsAhead

Add import in front of the existing import in the entry file.

### addHTMLMetas

Add meta tags to your HTML.

### addHTMLLinks

Add a Link tag to your HTML.

### addHTMLStyles

Add a Style tag to your HTML.

### addHTMLScripts

Add script at the end of the HTML.

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

Add a script to the HTML header.

### addMiddewares

Add the middleware after the webpack compiler middleware, and the return value format is express middleware.

### addPolyfillImports

Add supplementary related imports and execute them at the front of the entire application.

### addProjectFirstLibraries

Add a list of dependent libraries with project dependencies as the priority. The return value is `{name: string; path: string}`.

such as:

- `api.addProjectFirstLibraries(() => ({ name: 'antd', path: dirname(require.resolve('antd/package.json')) }))`, and then when the user depends on antd, if the project has a dependency on antd, the project's dependent antd will be used, otherwise the built-in antd

### addRuntimePlugin

Add a runtime plugin, the return value is a string representing the file path.

### addRuntimePluginKey

Add the key of the runtime plugin, and the return value format is string.

The built-in initial values ​​are:

- patchRoutes
- rootContainer
- render
- onRouteChange

### addUmiExports

Add the content that needs umi extra export, the return value format is ```{ source: string, specifiers?: (string | { local: string, exported: string })[], exportAll?: boolean }```.

For example, `api.addUmiExports(() => {source: 'dva', specifiers: ['connect']})`, then you can use `connect` of` dva` via `import {connect} from 'umi'` Method.

### addTmpGenerateWatcherPaths

Add the listening path generated by re-temporary files.

### chainWebpack(config, { webpack })

Modify webpack configuration through [webpack-chain](https://github.com/neutrinojs/webpack-chain).

such as:

```js
api.chainWebpack((config, { webpack, env, createCSSRule }) => {
  // Set alias
  config.resolve.alias.set('a', 'path/to/a');

  // Delete progress bar plugin
  config.plugins.delete('progress');

  return config;
});
```

Note:

- Requires a return value

### getPort()

Gets the port number. Effective for dev.

### getHostname()

Get hostname, valid for dev.

### modifyBabelOpts

Modify babel configuration items.

### modifyBabelPresetOpts

Modify @umijs/babel-preset-umi configuration items.

### modifyBundleConfig

Modify the bundle configuration.

parameter:

- `initialValue`：bundleConfig, which may be the configuration of webpack, distinguished by `bundler.id`
- `args` _ `type`：Now there are two, ssr and csr _ `env`: ie api.env \* `bundler`: contains id and version, for example: `{id: 'webpack': version: 4}`

### modifyBundleConfigs

Modify the bundle configuration array, for example, it can be used for dll and modern mode processing.

parameter:

- `args` _ `getConfig()`：Used to get an additional configuration _ `env`: ie api.env \* `bundler`: contains id and version, for example: `{id: 'webpack': version: 4}`

### modifyBundleConfigOpts

Modify the function parameters to get bundleConfig.

### modifyBundleImplementor

For example to switch to webpack@5 or other.

### modifyBundler

For example to switch to parcel or rollup for build.

### modifyConfig

Modify the final configuration.

Note:

- Modified values ​​will no longer undergo schema validation

### modifyDefaultConfig

Modify the default configuration.

### modifyHTML

Modify HTML, based on ast by [cheerio](https://github.com/cheeriojs/cheerio).

```js
api.modifyHTML(($, { routs }) => {
  $('h2').addClass('welcome');
  return $;
});
```

### modifyHTMLChunks

TODO

### modifyPaths

Modify the paths object.

parameter:

- `initialValue`: paths object

### modifyPublicPathStr

Modify the publicPath string.

parameter:

- `route`: Current route

Note:

- Only valid when runtimePublicPath or exportStatic?.dynamicRoot is configured

### modifyRoutes

Modify the route.

### onPatchRoute({ route, parentRoute })

Modify routing entries.

### onPatchRouteBefore({ route, parentRoute })

Modify routing entries.

### onPatchRoutes({ routes, parentRoute })

Modify the routing array.

### onPatchRoutesBefore({ routes, parentRoute })

Modify the routing array.

### onBuildCompelete({ err?, stats? })

Things you can do when the build is complete.

Note:

- May be failed, pay attention to judging the err parameter

### onDevCompileDone({ isFirstCompile: boolean, stats: webpack.Stats })

Things you can do when compilation is complete.

Note:

- Does not include compilation failure

### onGenerateFiles

Generate a temporary file and trigger it before webpack compiles.

### onPluginReady()

Triggered when the plugin initialization is complete. Before `onStart`, there were no config and paths at this time, they were not resolved yet.

### onStart()

Fires before the command registration function executes. You can use config and paths.

### onExit()

Triggered when dev exits.

parameter:

- `signal`: Values ​​are SIGINT, SIGQUIT, or SIGTERM

Note:

- Only valid for dev commands

### writeTmpFile({ path: string, content: string })

Write temporary files.

parameter:

- `path`: Path relative to the temporary folder
- `content`:document content

Note:

- Cannot be used during the registration phase, usually placed in `api.onGenerateFiles()`, so that temporary files can be regenerated when needed
- The writing of the temporary file is cached. If the contents are consistent, the writing operation will not be performed to reduce the trigger of recompiling of webpack.

## Attributes

### args

Command line parameters.

### babelRegister.setOnlyMap({ key: string, value: string[] })

Set the list of files that need to be compiled by babel.

Note:

- If there is a watch operation, keep the same key every time you repeat the setting

### config

User configuration.

Note:

- It cannot be obtained during the registration phase, so it cannot be used outside `const {config} = api;` and then used in the function body, but it needs to be used inside `api.paths.cwd`

### cwd

The current path.

### env

That is, process.env.NODE_ENV, there may be `development`,` production`, and `test`.

such as,

- Command line `umi dev --foo`, args is` {_: [], foo: true} `
- Command Line `umi g page index --typescript --less`, args is `{ _: ['page', 'index'], typescript: true, less: true }`

### id

The plugin id, usually the package name.

### logger

Plugin log class, containing `api.logger.(log|info|debug|error|warn|profile)`

The `api.logger.profile` can be used to record the energy consumption, for example:

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

The configuration key of the plugin, usually a shorthand for the package name.

For example, `@umijs/plugin-dva`, whose key is `dva`; for example, `umi-plugin-antd`, whose key is `antd`.

### paths

Related paths, including:

- `cwd`, ​​the current path
- `absSrcPath`, absolute path of src directory. Note that src directory is optional. If there is no src directory,` absSrcPath` is equivalent to `cwd`.
- `absPagesPath`, pages directory absolute path
- `absTmpPath`, the absolute path of the temporary directory
- `absOutputPath`, the output path, the default is`. / dist`
- `absNodeModulesPath`, absolute path to the node_modules directory
- `aliasedTmpPath`, a temporary path starting with` @ `, usually used

Note:

- It cannot be obtained during the registration phase, so it cannot be used outside `const {paths} = api;` and then used in `paths.cwd` in the function body, but needs to be used in` api.paths.cwd` inside

### pkg

The package.json for the current project, in the format Object.

### service

Service instance. It is usually not needed unless you know why.

### stage

Service operation phase.

### userConfig

Pure user configuration is the content in `.umirc` or` config/config`, without any processing by defaultConfig and plugins.

Note:

- The difference from config is that it can be obtained during the registration phase

### utils

For the utils method, see [@umijs/utils/src/index.ts](https://github.com/umijs/umi/blob/master/packages/utils/src/index.ts).

Note:

- In principle, methods of the same function are not allowed to use other ones to reduce the overall size, such as got for requests and yargs for parameter processing
- When writing plugins, in addition to `api.utils`, you can also get them via` import {utils} from 'umi'`, which is usually used for files that are not the main entrance of the plugin

### ApplyPluginsType

Provide the type of the type parameter for `api.applyPlugins()`, including three types:

- add
- modify
- event

### ConfigChangeType

Provide the type of config.onChange for `api.describe ()`, currently contains two types:

- restart, restart the dev process, the default is this
- regenerateTmpFiles, regenerate temporary files

### EnableBy

There are three ways to enable the plugin,

- register
- config
- Function

### Html

### ServiceStage

The enumeration type of `stage` is usually used for comparison with `stage`.

## Environment variable

Environment variables that can be used.

- UMI_VERSION, umi version
- UMI_DIR，`umi/package.json` folder path
