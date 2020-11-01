---
translateHelp: true
---

# Plugin API

## Core method

[Service](https://github.com/umijs/umi/blob/master/packages/core/src/Service/Service.ts) and [PluginAPI](https://github.com/umijs/umi/blob /master/packages/core/src/Service/PluginAPI.ts).

### applyPlugins({ key: string, type: api.ApplyPluginsType, initialValue?: any, args?: any })

Obtain the data after the hooks registered by the register are executed.

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

The registration phase is executed to describe the id, key, configuration information, activation method, etc. of the plug-in or plug-in set.

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

Note:

- `config.default` is the default value of the configuration, which is used when the user has no configuration
- `config.schema` is used to declare the type of configuration, based on [joi](https://hapi.dev/family/joi/), **If you want users to configure, this is required**, otherwise users Invalid configuration
- `config.onChange` is the processing mechanism after the dev stage configuration is modified. The dev process will be restarted by default, or it can be modified to ʻapi.ConfigChangeType.regenerateTmpFiles` to regenerate only temporary files, and can also be customized by the format of the function
- ʻEnableBy` is the enable method, the default is to register and enable it, and it can be changed to ʻapi.EnableBy.config`, and you can also use a custom function to determine its enablement time (dynamic effect)

### register({ key: string, fn: Function, pluginId?: string, before?: string, stage?: number })

Register the hooks available for ʻapi.applyPlugins`.

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

Then you can get `['a','b']` through ʻapi.applyPlugins`,

```ts
const foo = await api.applyPlugins({
  key: 'foo',
  type: api.ApplyPluginsType.add,
  initialValue: [],
});
console.log(foo); // ['a', 'b']
```

Note:

- fn supports both synchronization and asynchrony. Passing Promise asynchronously, the return value of Promise is asynchronous
- The content in fn needs to be combined with the type parameter of ʻapi.appyPlugins`_ if it is ʻapi.ApplyPluginsType.add`, it needs to have a return value, and these return values ​​will eventually be combined into an array_ if it is ʻapi.ApplyPluginsType. modify`, need to modify the first parameter, and return \* If it is ʻapi.ApplyPluginsType.event`, no return value is required
- Both stage and before are used to adjust the execution order, please refer to [tapable](https://github.com/webpack/tapable)
- stage is 0 by default, set to -1 or less will execute in advance, set to 1 or more will execute later

### registerCommand({ name: string, alias?: string, fn: Function })

Register the command.

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

Note:

-ʻAlias` is an alias, such as the alias g of generate
-The parameter of `fn` is `{ args }`, and the format of args is the same as the parsing result of [yargs](https://github.com/yargs/yargs). Note that the command itself in `_` is removed , Such as executing ʻumi generate page foo`, ʻargs._` is `['page','foo']`

### registerMethod({ name: string, fn?: Function, exitsError?: boolean })

Register the method on the api. It can be a shortcut to use ʻapi.register()` for easy calling; or not. If `fn` is provided, the function defined by `fn` will be executed. e.g.: 

```ts
api.registerMethod({
    name: 'foo',
    fn() { return 'foo'; },
    exitsError: false,
  });
```

Note:

-Except @umijs/preset-build-in, it is generally not recommended to register additional methods, because there is no ts prompt, just use ʻapi.register()` directly
-ʻExitsError` defaults to true, and an error is reported if the method exists

### registerPresets(presets: string[])

Register the plug-in set, the parameter is a path array.

e.g.

```ts
api.registerPresets([
    { id: 'preset_2', key: 'preset2', apply: () => () => {} },
    require.resolve('./preset_3'),
  ]);
```

### registerPlugins(plugins: string[])

Register the plug-in, the parameter is a path array. e.g.: 

```ts
api.registerPlugins([
    { id: 'preset_2', key: 'preset2', apply: () => () => {} },
    require.resolve('./preset_3'),
  ]);
```

### hasPlugins(pluginIds: string[])

Determine whether a plug-in is registered.

Id rules for plugins,

- id defaults to the package name
- File-level plugins, if no id is declared, the default is name + relative path, such as `@umijs/preset-react/lib/plugins/crossorigin/crossorigin`
- Built-in plugins are prefixed with `@@`, such as `@@/registerMethod`

Note:

- If you use it during the registration stage, you can only judge whether a plug-in was registered **before it**. e.g.: 

```ts
// 判断是否有注册 @umijs/plugin-dva
api.hasPlugins(['@umijs/plugin-dva']);
```

### hasPresets(presetIds: string[])

Determine whether a certain plug-in set is registered.

The id rule of the plugin set,

e.g.

```ts
// Determine if there is a registration @umijs/preset-ui
api.hasPresets(['@umijs/preset-ui']);
```

Note:

- If you use it during the registration stage, you can only judge whether a certain plugin set has been registered **before him**. 

### skipPlugins(pluginIds: string[])

Declare which plugins need to be disabled, and the parameter is an array of plugin id.

e.g.

```ts
// Disable plugin-dva plugin
api.skipPlugins(['@umijs/plugin-dva']);
```

## Extension method

A method extended by ʻapi.registerMethod()`.

### addBeforeMiddewares

Middleware added before webpack compiler middleware, the return value format is express middleware.

e.g.

```ts
api.addBeforeMiddewares(() => {
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

Add dependency information, including semver range and alias information.

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

Add code at the end of the entry file.

e.g.

```ts
api.addEntryCode(() => {
  return `console.log('works!')`
})
```

### addEntryCodeAhead

Add code at the beginning of the entry file (after import).

e.g.

```ts
api.addEntryCodeAhead(() => {
  return `console.log('works!')`
})
```

### addEntryImports

Add import after the existing import in the entry file.

e.g.

```ts
api.addEntryImport(() => {
  return [
    {
      source: '/modulePath/xxx.js',
      specifier: 'moduleName',
    }
  ]
});
```

### addEntryImportsAhead

Add import before the existing import of the entry file.

e.g.

```ts
api.addEntryImportsAhead(() => [{ source: 'anypackage' }]);
```

### addHTMLMetas

Add meta tags in HTML.

e.g.

```ts
api.addHTMLMetas(() => {
  return [{
      name: 'keywords',
      content: 'umi, umijs'
    },
  ];
});
```

### addHTMLLinks

Add the Link tag in the HTML.

e.g.

```ts
api.addHTMLLinks(() => {
  return [{
      rel: 'shortcut icon',
      type: 'image/x-icon',
      href: api.config.favicon!,
    },
  ];
});
```

### addHTMLStyles

Add the Style tag to the HTML.

e.g.

```ts
api.addHTMLStyles(() => {
  return [{
    content:`.className { }`
  }];
});
```

### addHTMLScripts

Add script at the end of HTML.

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

Add script to the HTML head.

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

### addMiddewares

The middleware added after the webpack compiler middleware, the return value format is express middleware.

e.g.

```ts
api.addMiddewares(async (ctx: Context, next: any) => {
  // do something before request
  await next();
  // do something after request
});
```

### addPolyfillImports

Add supplementary related imports and execute them at the top of the entire application.

e.g.

```ts
api.addPolyfillImports(() => [{ source: './core/polyfill' }]);
```

### addProjectFirstLibraries

Add a list of dependent libraries that give priority to project dependencies, and the return value is `{ name: string; path: string }`。

e.g.

```ts
api.addProjectFirstLibraries(() => ({
  name: 'antd',
  path: dirname(require.resolve('antd/package.json')),
}));
```

such as:

- `api.addProjectFirstLibraries(() => ({ name: 'antd', path: dirname(require.resolve('antd/package.json')) }))`，Then when the user depends on antd, if the project depends on antd, it will use the antd that the project depends on, otherwise the built-in antd

### addRuntimePlugin

Add a runtime plug-in, and the return value format is a string representing the file path.

e.g.

```ts
api.addRuntimePlugin(() => join(__dirname, './runtime'));
```

### addRuntimePluginKey

Add the key of the runtime plug-in, and the return value format is a string.

e.g.

```ts
api.addRuntimePluginKey(() => 'some');
```

The built-in initial values ​​are：

- patchRoutes
- rootContainer
- render
- onRouteChange

### addUmiExports

Add the content that needs to be exported by umi, the return value format is `{ source: string, specifiers?: (string | { local: string, exported: string })[], exportAll?: boolean }`。

For example, ʻapi.addUmiExports(() => {source:'dva', specifiers: ['connect'] })`, then you can use `dva`'s `connect` via ʻimport {connect} from'umi'` Way out.

### addTmpGenerateWatcherPaths

Add the monitoring path for re-temporary file generation. e.g.: 

```ts
api.addTmpGenerateWatcherPaths(() => [
    './app.ts',
]);
```

### chainWebpack(config, { webpack })

Modify the webpack configuration via [webpack-chain](https://github.com/neutrinojs/webpack-chain).

such as:

```ts
api.chainWebpack((config, { webpack, env, createCSSRule }) => {
  // Set alias
  config.resolve.alias.set('a', 'path/to/a');

  // Delete progress bar plugin
  config.plugins.delete('progress');

  return config;
});
```

Note:

- Need to have a return value

### getPort()

Get the port number, valid for dev. e.g.: 

```ts
const Port = api.getPort()
```

### getHostname()

Get hostname, valid when dev.

e.g.

```ts
const hostname = api.getHostname()
```

### modifyBabelOpts

Modify babel configuration items.

e.g.

```ts
api.modifyBabelOpts(babelOpts => {
    const hmr = api.config.dva?.hmr;
    if (hmr) {
      const hmrOpts = lodash.isPlainObject(hmr) ? hmr : {};
      babelOpts.plugins.push([
        require.resolve('babel-plugin-dva-hmr'),
        hmrOpts,
      ]);
    }
    return babelOpts;
  });
```

### modifyBabelPresetOpts

Modify the configuration items of @umijs/babel-preset-umi.

e.g.

```ts
api.modifyBabelPresetOpts(opts => {
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

Modify the bundle configuration.

e.g.

```ts
api.modifyBundleConfig((bundleConfig, { env, type, bundler: { id } }) => {
    // do something
    return bundleConfig;
});
```

parameter:

- ʻInitialValue`: bundleConfig, which may be the configuration of webpack, distinguished by `bundler.id`
- ʻArgs` _ `type`: now there are two, ssr and csr _ ʻenv`: namely api.env \* `bundler`: contains id and version, for example: `{ id:'webpack': version: 4 }`

### modifyBundleConfigs

Modify the bundle configuration array, for example, it can be used for dll and modern mode processing.

e.g.

```ts
api.modifyBundleConfigs(async (memo, { getConfig }) => {
  return [...memo];
});
```

parameter:

- ʻArgs` _ `getConfig()`: used to obtain an additional configuration _ ʻenv`: ie api.env \* `bundler`: contains id and version, for example: `{ id:'webpack': version : 4 }`

### modifyBundleConfigOpts

Modify the function parameters to get bundleConfig.

e.g.

```ts
api.modifyBundleConfigOpts(memo => {
  memo.miniCSSExtractPluginPath = require.resolve('mini-css-extract-plugin');
  memo.miniCSSExtractPluginLoaderPath = require.resolve(
    'mini-css-extract-plugin/dist/loader',
  );
  return memo;
});
```

### modifyBundleImplementor

For example, it is used to switch to webpack@5 or others.

e.g.

```ts
import webpack from 'webpack';

// 换成 webpack@5
api.modifyBundleImplementor(() => {
  return webpack;
});
```

### modifyBundler

For example, it is used to switch to parcel or rollup for construction.

e.g.

```ts
api.modifyBundler(() => {
  return require('@umijs/bundler-rollup').Bundler;
});
```

### modifyConfig

Modify the final configuration。

e.g.

```ts
api.modifyConfig((memo) => {
  return {
    ...memo,
    ...defaultOptions,
  };
});
```

Note:

- The modified value will no longer be schema verified

### modifyDefaultConfig

Modify the default configuration. e.g.: 

```ts
api.modifyDefaultConfig((memo) => {
  return {
    ...memo,
    ...defaultOptions,
  };
});
```

### modifyHTML

Modify HTML, based on the ast of [cheerio](https://github.com/cheeriojs/cheerio). e.g.: 

```ts
api.modifyHTML(($, { routs }) => {
  $('h2').addClass('welcome');
  return $;
});
```

### modifyHTMLChunks

Modify the js file in html to import, which can be used for different pages and different [chunks](../config#chunks) configurations. e.g.: 

```ts
api.modifyHTMLChunks(async (memo, opts) => {
  const { route } = opts;
  // do something
  return memo;
});
```

### modifyExportRouteMap <Badge>3.2+</Badge>

Modify the exported route object `routeMap` (the mapping relationship between routing and output HTML), the trigger time is before the HTML file is generated, the default value is `[{ route: {path:'/' }, file:'index.html' }] `.

parameter:

- `html`: HTML tool class example

Note:

- Only works during ʻumi build`

For example, the ʻexportStatic` plugin generates corresponding HTML according to the route:

```ts
api.modifyExportRouteMap(async (defaultRouteMap, { html }) => {
  return await html.getRouteMap();
});
```

### modifyDevHTMLContent <Badge>3.2+</Badge>

Modify the output HTML content when ʻumi dev`.

parameter:

- `req`: Request object, you can get the current access path

For example, we want the `/404` route to directly return `Not Found`:

```ts
api.modifyDevHTMLContent(async (defaultHtml, { req }) => {
  if (req.path === '/404') {
    return 'Not Found';
  }
  return defaultHtml;
})
```

### modifyProdHTMLContent <Badge>3.2+</Badge>

Modify the HTML output during ʻumi build`.

Parameters (equivalent to a `RouteMap` object):

- `route`: route object
- `file`: output HTML name

For example, you can do pre-rendering before generating the HTML file:

```ts
api.modifyProdHTMLContent(async (content, args) => {
  const { route } = args;
  const render = require('your-renderer');
  return await render({
    path: route.path,
  })
});
```

### modifyPaths

Modify the paths object.

e.g.

```ts
api.modifyPaths(async (paths) => {
  return memo;
});
```

parameter:

- ʻInitialValue`: paths object

### modifyRendererPath

Modify the renderer path to use a custom renderer.

e.g.

```ts
api.modifyRendererPath(() => {
  return dirname(require.resolve('@umijs/renderer-mpa/package.json'));
});
```

### modifyPublicPathStr

Modify the publicPath string.

e.g.

```ts
api.modifyPublicPathStr(() => {
  return api.config.publicPath ||'/';
});
```

parameter:

-`route`: current route

Note:

- Only valid when runtimePublicPath or exportStatic?.dynamicRoot is configured

### modifyRoutes

Modify routing.

e.g.

```ts
api.modifyRoutes((routes: any[]) => {
  return resetMainPath(routes, api.config.mainPath);
});
```

### onPatchRoute({ route, parentRoute })

Modify routing items. e.g.: 

```ts
api.onPatchRoute(({ route }) => {
  if (!api.config.exportStatic?.htmlSuffix) return;
  if (route.path) {
    route.path = addHtmlSuffix(route.path, !!route.routes);
  }
});
```

### onPatchRouteBefore({ route, parentRoute })

Modify routing items. e.g.: 

```ts
api.onPatchRouteBefore(({ route }) => {
  if (!api.config.exportStatic?.htmlSuffix) return;
  if (route.path) {
    route.path = addHtmlSuffix(route.path, !!route.routes);
  }
});
```


### onPatchRoutes({ routes, parentRoute })

Modify the routing array. e.g.:

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

Modify the routing array. e.g.: 

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

Things you can do when the build is complete. e.g.: 

```ts
api.onBuildComplete(({ err }) => {
  if (!err) {
    // do something
  }
});
```

Note:

- It may fail, pay attention to judging the err parameter

### onDevCompileDone({ isFirstCompile: boolean, stats: webpack.Stats })

Things you can do when the compilation is complete. e.g.:

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

Note:

- Does not include compilation failure

### onGenerateFiles

Generate temporary files, the trigger time is before webpack compiles. e.g.:

```ts
api.onGenerateFiles(() => {
    api.writeTmpFile({
      path:'any.ts',
      content:'',
    });
  });
```

### onPluginReady()

Triggered when the plugin is initialized. Before ʻonStart`, there are no config and paths at this time, and they have not been resolved. e.g.:

```ts
api.onPluginReady(() => {
  // do something
});
```

### onStart()

Triggered before the command registration function is executed. You can use config and paths.

e.g.

```ts
api.onStart(() => {
  // do something
});
```

### onExit()

Fires when dev exits. e.g.: 

```ts
api.onExit(() => {
  // do something
});
```

parameter:

-`signal`: value is SIGINT, SIGQUIT or SIGTERM

Note:

-Only valid for dev command

### writeTmpFile({ path: string, content: string, skipTSCheck?: boolean })

Write temporary files. e.g.: 

```ts
api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'any.ts',
      content: '',
    });
  });
```

parameter:

- `path`: the path relative to the temporary folder
- `content`: file content
- `skipTSCheck`: The default is `true`, `path` is a ts or tsx file, and TypeScript type errors are not checked. If you want the plugin to perform TypeScript type checking on user projects, you can set it to `false`.

Note:

- Cannot be used in the registration phase, usually placed in ʻapi.onGenerateFiles()`, so that temporary files can be regenerated when needed
- The writing of temporary files is cached. If the content is the same, no write operation will be performed to reduce the triggering of webpack recompilation

## Attributes

### args

Command line parameters.

### babelRegister.setOnlyMap({ key: string, value: string[] })

Set the list of files that need to be compiled by babel.

Note:

- If there is a watch operation, please keep the key the same every time you repeat the setting

### config

User configuration.

Note:

- It cannot be obtained during the registration phase, so it cannot be used outside `const {config} = api;` and then used in the function body, but needs to be used inside through ʻapi.paths.cwd`

### cwd

The current path.

### env

That is process.env.NODE_ENV, there may be `development`, `production` and `test`.

such as,

- Command line ʻumi dev --foo`, args is `{ _: [], foo: true }`
- Command line ʻumi g page index --typescript --less`, args is `{ _: ['page','index'], typescript: true, less: true }`

### id

The plugin id, usually the package name.

### logger

Plug-in log class, including ʻapi.logger.(log|info|debug|error|warn|profile)`

Among them, ʻapi.logger.profile` can be used to record the energy consumption, for example:

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

The configuration key of the plug-in is usually a shorthand for the package name.

For example, `@umijs/plugin-dva`, its key is `dva`; for example, ʻumi-plugin-antd`, its key is ʻantd`.

### paths

Related paths, including:

- `cwd`, ​​current path
- ʻAbsSrcPath`, the absolute path of the src directory. Note that the src directory is optional. If there is no src directory, ʻabsSrcPath` is equivalent to `cwd`
- ʻAbsPagesPath`, the absolute path of the pages directory
- ʻAbsTmpPath`, the absolute path of the temporary directory
- ʻAbsOutputPath`, output path, default is `./dist`
- ʻAbsNodeModulesPath`, the absolute path of the node_modules directory
- ʻAliasedTmpPath`, a temporary path beginning with `@`, usually used

Note:

- It cannot be obtained during registration, so it cannot be used outside `const {paths} = api;` and then used in `paths.cwd` in the function body, but needs to be used inside ʻapi.paths.cwd`

### pkg

The package.json of the current project, the format is Object.

### service

Service instance. Usually you don't need to use it unless you know why.

### stage

Service operation phase.

### userConfig

Pure user configuration is the content in `.umirc` or `config/config`, without any processing by defaultConfig or plugins.

Note:

-The difference with config is that you can get it during the registration phase

### utils

For the utils method, see [@umijs/utils/src/index.ts](https://github.com/umijs/umi/blob/master/packages/utils/src/index.ts) for details.
Contains external libraries:

- `lodash`: derived from `lodash`, a practical js tool library.
- `got`: derived from `got`, a lightweight request library.
- `deepmerge`: derived from `deepmerge`, deep merge the enumerable properties of two objects.
- `semver`: Exported from `semver`, used to realize version number parsing and comparison, and standardize the format of version number. It is common in scenarios where the version is too low and prompts users to upgrade.
- `Mustache`: Derived from `mustache`, a non-logic template syntax, and a zero-dependency implementation of the mustache template system in JavaScript.
- ʻAddress`: derived from ʻaddress`, used to obtain the current computer's IP, MAC and DNS server addresses, etc.
- `cheerio`: exported from `cheerio`, used to conveniently process the crawled web content, and perform convenient operations on the DOM structure on the server side.
- `clipboardy`: Exported from `clipboardy`, used to write and read the contents of the clipboard.
- `chokidar`: Exported from `chokidar`, used to monitor file changes.
- `createDebug`, `Debugger`: exported from `debug`, used to control the output of the debug log.
- `chalk`: Exported from `chalk`, it is often used to output colored text in the terminal, supports chain call, and can set text style, color, background color, etc.
- `signale`: Exported from `signale`, used for logging, status reporting, and processing output rendering methods of other Node modules and applications.
- `portfinder`: exported from `portfinder`, often used in scenarios such as judging whether a port is occupied or obtaining unoccupied ports.
- `glob`: Exported from `glob`, used to obtain files matching the corresponding rules.
- `pkgUp`: Export from `pkg-up`, find the nearest package.json file.
- `resolve`: Derived from `resolve`, implements the require.resolve() algorithm of node, and provides a convenient method for processing the requirements related to obtaining the complete path of the module.
- `spawn`: Exported from `cross-spawn`, the details of the cross-platform writing of the `spawn` function under the Node.js child process (child_process) module have been encapsulated, directly using the commands on the calling system such as `npm `OK.
- ʻExeca`: derived from ʻexeca`, a better tool for sub-process management. It is equivalent to deriving a shell, and the incoming command string is processed directly in the shell.
- `mkdirp`: derived from `mkdirp`, the implementation of the `mkdir -p` function in node, used to recursively create directories and subdirectories in Node.js.
- `rimraf`: derived from `rimraf`, implementation of `rm -rf` function in node,
- `yargs`: exported from `yargs`, used to create interactive command line tools, which can handle command line parameters conveniently.
- `yParser`: derived from `yargs-parser`, a powerful option parser used by `yargs`, used to parse command line parameters.
- `parser`: derived from `@babel/parser`, parse code to generate AST abstract syntax tree.
- `traverse`: derived from `@babel/traverse`, traverse AST nodes recursively.
- `t`: derived from `@babel/types`, a Lodash-style tool library for AST nodes. It contains methods for constructing, verifying, and transforming AST nodes. The tool library contains thoughtful tools and methods, which are very useful for writing and processing AST logic.

Internal tool approach

-ʻIsBrowser`, to determine whether it is in the browser environment.
-ʻIsWindows`, to determine whether it is currently a windows system.
-ʻIsSSR`, whether SSR success in client.
-ʻIsLernaPackage`, to determine whether there is a `lerna.json` file.
-`winPath`, convert the file path to a window compatible path, used to add code like `require('/xxx/xxx.js')` to the code.
-`winEOL`, in the windows environment, many tools will automatically change the newline character lf to crlf. In order to test accurately, you need to convert the newline character.
-`compatESModuleRequire`, compatible with ESModule and Require is Require.
-`mergeConfig`, merge objects.
-`randomColor`, generate colors randomly.
-`delay`, delay function.
-`Generator`, `mustache` template code generation.
-`BabelRegister`, a simple package of `@babel/register`.
-`parseRequireDeps`, get the local dependency of a specific file.
-`cleanRequireCache`, clean up the references of specific Module in require cache and parent.children.
-`getWindowInitialProps`, get window.g_initialProps.
-`getFile`, get the full extension of files in a specific directory, the matching order of javascript files `['.ts','.tsx','.js','.jsx']`, the matching order of css files` ['.less','.sass','.scss','.stylus','.css']`.
-`routeToChunkName`, transform route component into webpack chunkName.

Types of

-ʻArgsType<T extends (...args: any[]) => any>`, get the function parameter array type.
-`PartialKeys<T>`, find the key in T whose type is undefined.
-`PartialProps<T>`, take out the properties of T whose type is undefined.
-`NodeEnv`: Union type'development' |'production' |'test'.
-ʻOmit<T, U>`, exclude the U key in T.

Note:

-In principle, methods with similar functions are not allowed to use other methods to reduce the overall size, such as got for requests and yargs for parameter processing
-When writing a plug-in, in addition to ʻapi.utils`, it can also be accessed through ʻimport {utils} from'umi'`, usually used for files that are not the main entrance of the plug-in

### ApplyPluginsType

Provide the type of type parameter for ʻapi.applyPlugins()`, including three types:

-add
-modify
-event

### ConfigChangeType

Provide config.onChange type for ʻapi.describe()`, currently contains two types:

-restart, restart the dev process, the default is this
-regenerateTmpFiles, regenerate temporary files

### EnableBy

There are three ways to enable the plug-in,

- register
- config
- Function

### Html

### ServiceStage

The enumeration type of `stage` is usually used for comparison with `stage`.

## Environment variables

Environment variables that can be used.

-UMI_VERSION, umi version number
-UMI_DIR, the folder path where ʻumi/package.json` is located
