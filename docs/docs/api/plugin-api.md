# Plugin API

The core of Umi lies in its plugin mechanism. Based on Umi's plugin mechanism, you can extend the capabilities of your project at both compile time and runtime. Below is a list of all the plugin APIs we provide to help you freely write plugins.

Before looking at the Umi plugin APIs, we recommend that you read the [Plugins](../guides/plugins) section to understand the mechanism and principles of Umi plugins. This will help you better utilize the plugin API.

> For easier searching, the following content is sorted alphabetically.

## Core APIs
Methods defined in `service` and `PluginAPI`.

### applyPlugins
```ts
api.applyPlugins({ key: string, type?: api.ApplyPluginsType, initialValue?: any, args?: any })
```
Retrieve the data after the execution of hooks registered with `register()`. This is an asynchronous function, so it returns a Promise. Examples and explanations of this method can be found in the [register](#register) API.

### describe
```ts
api.describe({ key?:string, config?: { default , schema, onChange }, enableBy? })
```
Executed during the plugin registration phase (initPresets or initPlugins stage), used to describe the key, configuration information, and enablement method of the plugin or plugin set.

- `key` is the key under which the plugin is configured in the configuration.
- `config.default` is the default value of the plugin configuration. When the user does not configure the key in the configuration, the default configuration will take effect.
- `config.schema` declares the type of the configuration, based on [joi](https://joi.dev/). **This is required if you want users to configure it**, otherwise the user's configuration will be invalid.
- `config.onChange` is the handling mechanism after the configuration is modified in dev mode. The default value is `api.ConfigChangeType.reload`, which means that the dev process will be restarted when the configuration item is modified. You can also change it to `api.ConfigChangeType.regenerateTmpFiles`, which means that only temporary files will be regenerated. You can also pass in a function to customize the processing mechanism.
- `enableBy` is the enabling method of the plugin, defaulting to `api.EnableBy.register`, which means register to enable, i.e., the plugin will be enabled as long as it is registered. You can change it to `api.EnableBy.config`, which means configuration to enable, and only the configuration items of the plugin will enable the plugin. You can also customize a method that returns a boolean value (true for enable) to determine when it should be enabled. This is usually used to achieve dynamic activation.

e.g.
```ts
api.describe({
  key: 'foo',
  config: {
    schema(joi){
      return joi.string();
    },
    onChange: api.ConfigChangeType.regenerateTmpFiles,
  },
  enableBy: api.EnableBy.config,
})
```
In this example, the plugin key is `foo`, so the key in the configuration is `foo`. The type of the configuration is a string. When the configuration `foo` changes, dev will only regenerate temporary files. This plugin will only be enabled if the user configures `foo`.

### isPluginEnable
```ts
api.isPluginEnable( key：string)
```
Determine whether the plugin is enabled. The parameter passed in is the key of the plugin.

### register
```ts
api.register({ key: string, fn, before?: string, stage?: number})
```
Register hooks that can be used by `api.applyPlugins`.

- `key` is the category name of the registered hook. You can use `register` multiple times to register hooks under the same `key`, and they will be executed in sequence. This `key` is also used when collecting hook data using `applyPlugins`. Note: **The key here has no connection with the key of the plugin.**
- `fn` is the definition of the hook, which can be synchronous or asynchronous (returning a Promise).
- `stage` is used to adjust the execution order, defaulting to 0. Setting it to -1 or lower will execute it in advance, while setting it to 1 or higher will execute it after.
- `before` is also used to adjust the execution order. The value passed in is the name of the registered hook. Note: **The name of the hook registered by `register` is the id of the Umi plugin it belongs to.** For more usage of `stage` and `before`, please refer to [tapable](https://github.com/webpack/tapable).

Note: Compared to `umi@3`, `umi@4` has removed the `pluginId` parameter.

The writing of `fn` needs to be combined with the `type` parameter of the upcoming `applyPlugins` to determine:
- `api.ApplyPluginsType.add` `applyPlugins` will concatenate their return values into an array in hook order. In this case, `fn` needs to have a return value, and `fn` will receive `args` of `applyPlugins` as its own parameters. The `initialValue` of `applyPlugins` must be an array, and its default value is an empty array. When the `key` starts with `'add'` and `type` is not explicitly declared, `applyPlugins` will default to execute according to this type.
- `api.ApplyPluginsType.modify` `applyPlugins` will sequentially change the `initialValue` received by `applyPlugins` according to the hook order. Therefore, **`initialValue` is required in this case**. In this case, `fn` needs to receive a `memo` as its first parameter and will receive `args` of `applyPlugins` as its second parameter. `memo` is the result of modifying `initialValue` by a series of previous hooks, and `fn` needs to return the modified `memo`. When the `key` starts with `'modify'` and `type` is not explicitly declared, `applyPlugins` will default to execute according to this type.
- `api.ApplyPluginsType.event` `applyPlugins` will execute sequentially according to the hook order. In this case, you don't need to pass in `initialValue`. `fn` doesn't need to have a return value, and it will receive `args` of `applyPlugins` as its own parameters. When the `key` starts with `'on'` and `type` is not explicitly declared, `applyPlugins` will default to execute according to this type.

e.g.1 add type
```ts
api.register({
  key: 'addFoo',
  // Synchronous
  fn: (args) => args
});

api.register({
  key: 'addFoo',
  // Asynchronous
  fn: async (args) => args * 2
})

api.applyPlugins({
  key: 'addFoo',
  // key is of add type, no need to explicitly declare it as api.ApplyPluginsType.add
  args: 1
}).then((data)=>{
  console.log(data); // [1,2]
})
```
e.g.2 modify type
```ts
api.register({
  key: 'foo',
  fn: (memo, args) => ({ ...memo, a: args})
})
api.register({
  key: 'foo',
  fn: (memo) => ({...memo, b: 2})
})
api.applyPlugins({ 
  key: 'foo', 
  type: api.ApplyPluginsType.modify,
  // initialValue is required
  initialValue: { 
    a: 0,
    b: 0
  },
  args: 1
}).then((data) => {
    console.log(data); // { a: 1, b: 2 }
});
```

### registerCommand
```ts
api.registerCommand({
  name: string,
  description? : string,
  options? : string,
  details? : string,
  fn,
  alias? : string | string[]
  resolveConfigMode? : 'strict' | 'loose'
})
```
Register a command.
- `alias` is the alias, e.g., the alias of `generate` is `g`.
- The parameter of `fn` is `{ args }`, where the format of `args` is the parsing result of [yargs](https://github.com/yargs/yargs), and it should be noted that the command itself in `_` has been removed, for example, when executing `umi generate page foo`, `args._` is `['page','foo']`.
- The `resolveConfigMode` parameter controls the way configuration is resolved when executing the command. In `strict` mode, the content of the Umi project's configuration file is strongly validated, and the command execution is interrupted if there is any illegal content; in `loose` mode, the validation check of the configuration file is not executed.

### registerMethod
```ts
api.registerMethod({ name: string, fn? })
```
Register a method on the `api` with the name `'name'`.

- When `fn` is provided, execute `fn`.
- When `fn` is not provided, `registerMethod` will use `'name'` as the `key` for `api.register` and curry it as `fn`. In this case, it is equivalent to registering a shortcut for `register`, which facilitates hook registration.

Note:
- Compared to `umi@3`, `umi@4` has removed the `exitsError` parameter.
- It is generally not recommended to register additional methods, as they won't have TypeScript prompts. Using `api.register()` directly is a safer approach.

e.g.1
```ts
api.registerMethod({
  name: foo,
  // With fn
  fn: (args) => {
    console.log(args);
  }
})
api.foo('hello, umi!'); // hello, umi!
```
In this example, we registered a method named `foo` on the `api`, which will log the arguments to the console.

e.g.2
```ts
import api from './api';

api.registerMethod({
  name: 'addFoo'
  // Without fn
})

api.addFoo( args => args );
api.addFoo( args => args * 2 );

api.applyPlugins({
  key: 'addFoo',
  args: 1
}).then((data)=>{
  console.log(data); // [ 1, 2 ]
});
```
In this example, we didn't provide an `fn` to `api.registerMethod`. In this case, we essentially registered a "register" method on the `api`: `addFoo`. Each time this method is called, it's equivalent to calling `register({ key: 'addFoo', fn })`. Therefore, when we use `api.applyPlugins` (since our method is of the add type, we don't need to explicitly declare its type), we can retrieve the value of the just registered hook.

### registerPresets
```ts
api.registerPresets( presets: string[] )
```
Register plugin sets, where the parameter is an array of paths. This API must be executed during the `initPresets` stage, which means you can only register other presets in presets.

e.g.
```ts
api.registerPresets([
  './preset',
  require.resolve('./preset_foo')
])
```

### registerPlugins
```ts
api.registerPlugins( plugins: string[] )
```
Register plugins, where the parameter is an array of paths. This API must be executed during the `initPresets` and `initPlugins` stages.

e.g.
```ts
api.registerPlugins([
  './plugin',
  require.resolve('./plugin_foo')
])
```

Note: Compared to `umi@3`, `umi@4` no longer supports directly passing plugin objects in `registerPresets` and `registerPlugins`. Now, only the paths of the plugins are allowed to be passed in.

### registerGenerator

### skipPlugins
```ts
api.skipPlugins( keys: string[])
```
Declare which plugins need to be skipped. The parameter is an array of plugin keys.

## Extension Methods
Methods extended through `api.registerMethod()`. Their purpose is to register hooks for use, so they all need to accept an `fn`. Most of these methods are named in the format of `add-`, `modify-`, and `on-`, which correspond to the three types of `api.ApplyPluginsType`. The differences in the `fn` received for different types are not quite the same; see the [register](#register) section for details.

Note: All the `fn` mentioned below can be synchronous or asynchronous (returning a Promise). The `fn` can also be replaced with:

```ts
{
  fn,
  name?: string,
  before?: string | string[],
  stage: number,
}

```
Where the roles of various parameters are detailed in [tapable](https://github.com/webpack/tapable).

### addBeforeBabelPlugins
Add additional Babel plugins. The provided `fn` doesn't require any parameters and should return a Babel plugin or an array of plugins.
```ts
api.addBeforeBabelPlugins(() => {
  // Return a Babel plugin (from Babel's official example)
  return () => {
    visitor: {
      Identifier(path) {
        const name = path.node.name;
        path.node.name = name.split("").reverse().join("");
      }
    }
  }
})
```

### addBeforeBabelPresets
Add additional Babel presets. The provided `fn` doesn't require any parameters and should return a Babel preset or an array of presets.
```ts
api.addBeforeBabelPresets(() => {
  // Return a Babel preset
  return () => {
    return {
      plugins: ["Babel_Plugin_A","Babel_Plugin_B"]
    }
  }
})
```

### addBeforeMiddlewares
Add middleware before webpack-dev-middleware. The provided `fn` doesn't require any parameters and should return an express middleware or an array of middlewares.
```ts
api.addBeforeMiddlewares(() => {
  return (req, res, next) => {
    if(false) {
      res.end('end');
    }
    next();
  }
})
```

### addEntryCode
Add code to the end of the entry file (after render). The provided `fn` doesn't require any parameters and should return a string or an array of strings.
```ts
api.addEntryCode(() => `console.log('I am after render!')`);
```

### addEntryCodeAhead
Add code to the beginning of the entry file (before render, after imports). The provided `fn` doesn't require any parameters and should return a string or an array of strings.
```ts
api.addEntryCodeAhead(() => `console.log('I am before render!')`)
```

### addEntryImports
Add import statements to the entry file (after the last import). The provided `fn` doesn't require any parameters and should return an object `{source: string, specifier?: string}` or an array of such objects.
```ts
api.addEntryImports(() => ({
  source: '/modulePath/xxx.js',
  specifier: 'moduleName'
}))
```

### addEntryImportsAhead
Add import statements to the entry file (before the first import). The provided `fn` doesn't require any parameters and should return an object `{source: string, specifier?: string}` or an array of such objects.
```ts
api.addEntryImportsAhead(() => ({
  source: 'anyPackage'
}))
```

### addExtraBabelPlugins
Add additional Babel plugins. The provided `fn` doesn't require any parameters and should return a Babel plugin or an array of plugins.

### addExtraBabelPresets
Add additional Babel presets. The provided `fn` doesn't require any parameters and should return a Babel preset or an array of presets.

### addHTMLHeadScripts
Add scripts to the `<head>` element of the HTML. The provided `fn` doesn't require any parameters and should return a string (the code you want to add) or an object or an array of objects with properties like `async`, `charset`, `crossOrigin`, `defer`, `src`, `type`, or `content`.
```ts
api.addHTMLHeadScripts(() => `console.log('I am in HTML-head')`)
```

### addHTMLLinks 
Add Link tags to the HTML. The provided `fn` doesn't require any parameters and should return an object with properties like `as`, `crossOrigin`, `disabled`, `href`, `hreflang`, `imageSizes`, `imageSrcset`, `integrity`, `media`, `referrerPolicy`, `rel`, `rev`, `target`, or `type`.
```ts
{  
  as?: string, crossOrigin: string | null, 
  disabled?: boolean,
  href?: string,
  hreflang?: string,
  imageSizes?: string,
  imageSrcset?: string,
  integrity?: string,
  media?: string,
  referrerPolicy?: string,
  rel?: string,
  rev?: string,
  target?: string,
  type?: string 
}
```

### addHTMLMetas
Add Meta tags to the HTML. The provided `fn` doesn't require any parameters and should return an object with properties like `content`, `http-equiv`, `name`, or `scheme`.
```ts
{
  content?: string,
  'http-equiv'?: string,
  name?: string,
  scheme?: string  
}
```

### addHTMLScripts
Add scripts to the end of the HTML. The provided `fn` doesn't require any parameters and should return an object with properties like `async`, `charset`, `crossOrigin`, `defer`, `src`, `type`, or `content`.

### addHTMLStyles
Add style tags to the HTML. The provided `fn` doesn't require any parameters and should return a string (the content of the style tag) or an object with properties like `type` or `content`.
```ts
api.addHTMLStyles(() => 'body { background-color: red; }')
```

### addLayouts
Add global layout components. The provided `fn` doesn't require any parameters and should return an object `{ id?: string, file: string }`.

### addMiddlewares
Add middlewares after route middlewares. The provided `fn` doesn't require any parameters and should return an express middleware.

### addPolyfillImports
Add polyfill imports, executed at the very beginning of the application. The provided `fn` doesn't require any parameters and should return an object `{ source: string, specifier?: string }`.

### addPrepareBuildPlugins

### addRuntimePlugin
Add runtime plugins. The provided `fn` doesn't require any parameters and should return a string representing the plugin's path.

### addRuntimePluginKey
Add keys for runtime plugins. The provided `fn` doesn't require any parameters and should return a string representing the plugin's path.

### addTmpGenerateWatcherPaths
Add paths to watch. When changed, temporary files will be regenerated. The provided `fn` doesn't require any parameters and should return a string representing the path to be watched.

### addOnDemandDeps
Add on-demand installed dependencies. They will be checked for installation when the project starts:

```ts
api.addOnDemandDeps(() => [{ name: '@swc/core', version: '^1.0.0', dev: true }])
```

### chainWebpack
Modify webpack configuration using [webpack-chain](https://github.com/neutrinojs/webpack-chain). Pass a function as an argument to this method; this function doesn't require a return value. It will receive two parameters:
- `memo`, corresponding to the webpack config from webpack-chain.
- `args: { webpack, env }`, where `args.webpack` is the webpack instance, and `args.env` represents the current environment.

e.g.
```ts
api.chainWebpack((memo, { webpack, env}) => {
  // set alias
  memo.resolve.alias.set('a','path/to/a');
  // Delete progess bar plugin
  memo.plugins.delete('progess');
})
```

### modifyAppData (Added in `umi@4`)

Modify app metadata. The provided `fn` receives `appData` and should return it.
```ts
api.modifyAppData((memo) => {
  memo.foo = 'foo';
  return memo;
})
```

### modifyConfig
Modify the configuration. Compared to the user's configuration, this is the configuration passed to Umi for use. The provided `fn` receives `config` as the first parameter and should return it. Additionally, the `fn` can receive `{ paths }` as the second parameter. `paths` contains various paths of Umi.
```ts
api.modifyConfig((memo, { paths }) => {
  memo.alias = {
    ...memo.alias,
    '@': paths.absSrcPath
  }
  return memo;
})
```

### modifyDefaultConfig
Modify the default configuration. The provided `fn` receives `config` and should return it.

### modifyHTML
Modify the HTML based on cheerio's AST. The provided `fn` receives the cheerio API and should return it. Additionally, `fn` can also receive `{ path }` as its second parameter, which represents the route's path.
```ts
api.modifyHTML(($, { path }) => {
  $('h2').addClass('welcome');
  return $;
})
```

### modifyHTMLFavicon
Modify the HTML's favicon path. The provided `fn` receives the original favicon path (as a string) and should return it.

### modifyPaths
Modify paths, such as `absOutputPath` and `absTmpPath`. The provided `fn` receives `paths` and should return it.

The interface for `paths` is as follows:
```ts
paths: {
  cwd?: string;
  absSrcPath?: string;
  absPagesPath?: string;
  absTmpPath?: string;
  absNodeModulesPath?: string;
  absOutputPath?: string;
}
```

### modifyRendererPath
Modify the renderer path. The passed `fn` receives the original path (of type `string`) and returns it.

### modifyServerRendererPath
Modify the server renderer path. The passed `fn` receives the original path (of type `string`) and returns it.

### modifyRoutes
Modify routes. The passed `fn` receives the `id-route` map and returns it. The interface of the `route` is as follows:
```ts
interface IRoute {
  path: string;
  file?: string;
  id: string;
  parentId?: string;
  [key: string]: any;
}
```
e.g.
```ts
api.modifyRoutes((memo) => {
  Object.keys(memo).forEach((id) => {
    const route = memo[id];
    if(route.path === '/'){
      route.path = '/redirect'
    }
  });
  return memo;
})
```

### modifyTSConfig

Modify the contents of the tsconfig file in the temporary directory.

```ts
api.modifyTSConfig((memo) => {
  memo.compilerOptions.paths['foo'] = ['bar'];
  return memo;
});
```

### modifyViteConfig
Modify the final Vite configuration. The passed `fn` receives the Vite Config object as the first parameter and returns it. Additionally, the `fn` can also receive `{ env }` as the second parameter, allowing you to access the current environment.
```ts
api.modifyViteConfig((memo, { env }) => {
  if(env === 'development'){
    // do something
  }
  return memo;
})
```
### modifyWebpackConfig
Modify the final Webpack configuration. The passed `fn` receives the Webpack Config object as the first parameter and returns it. Additionally, the `fn` can also receive `{ webpack, env }` as the second parameter, where `webpack` is the Webpack instance and `env` represents the current environment.

```ts
api.modifyWebpackConfig((memo, { webpack, env }) => {
  // do something
  
  return memo;
})
```

### onBeforeCompiler
After generate, before webpack/vite compiler. The passed `fn` doesn't receive any parameters.

### onBeforeMiddleware
Provides the ability to execute custom middleware inside the server before all other middlewares. This can be used to define custom handlers, for example:

```ts
api.onBeforeMiddleware(({ app }) => {
  app.get('/some/path', function (req, res) {
    res.json({ custom: 'response' });
  });
});
```

### onBuildComplete
When build is completed. The passed `fn` receives `{ isFirstCompile: boolean, stats, time: number, err?: Error }` as parameters.

### onBuildHtmlComplete
After build is completed and HTML is built.

### onCheck
During checking, executed before `onStart`. The passed `fn` doesn't receive any parameters.

### onCheckCode
During code checking. The passed `fn` receives the following parameter interface:
```ts
args: {
  file: string;
  code: string;
  isFromTmp: boolean;
  imports: {
    source: string;
    loc: any;
    default: string;
    namespace: string;
    kind: babelImportKind;
    specifiers: Record<string, { name: string; kind: babelImportKind }>;
  }[];
  exports: any[];
  cjsExports: string[]; 
}
```

### onCheckConfig
During checking configuration. The passed `fn` receives `{ config, userConfig }` as parameters, where they represent the actual configuration and the user's configuration respectively.

### onCheckPkgJSON
During checking package.json. The passed `fn` receives `{origin?, current}` as parameters. Both are package.json objects.

### onDevCompileDone
When dev is completed. The passed `fn` receives the following parameter interface:
```ts
args: {
  isFirstCompile: boolean;
  stats: any;
  time: number; 
}
```

### onGenerateFiles
When generating temporary files, this event can trigger frequently due to file changes, and it is cached. The passed `fn` receives the following parameter interface:
```ts
args: {
  isFirstTime?: boolean;
  files?: {
    event: string;
    path: string;
  } | null;
}
```


### onPatchRoute
Matches a single route and can modify the route, applying patches to it.


### onPkgJSONChanged
When package.json changes. The passed `fn` receives `{origin?, current}` as parameters. Both are package.json objects.

### onPrepareBuildSuccess

### onStart
When starting. The passed `fn` doesn't receive any parameters.


### writeTmpFile
The type of the `type` parameter for `api.writeTmpFile()`.

- `content`: The text content to write, if provided, the template won't be used.
- `context`: The template context.
- `noPluginDir`: Whether to use the plugin name as a directory.
- `path`: The path to write the file.
- `tpl`: Use a template string, if no template path is provided.
- `tplPath`: Use a template file path.


## Properties
Attributes that can be directly accessed from the `api`, some of which come from the `service`.

### appData

### args
Command-line arguments, excluding the command itself.

e.g.
- `$ umi dev --foo`,

 args are `{ _:[], foo: true }`
- `$ umi g page index --typescript --less`, args are `{ _: [ 'page', 'index''], typescript: true, less: true }`

### config
Final configuration (depends on the context of access, possibly the current collected final configuration).

### cwd
Current working directory.

### env
Equivalent to `process.env.NODE_ENV`, can be `development`, `production`, or `test`.

### logger
Plugin logging object, containing `{ log, info, debug, error, warn, profile }`, all of which are methods. `api.logger.profile` can be used for profiling performance time.

```ts
api.logger.profile('barId');
setTimeout(() => {
  api.logger.profile('barId');
})
// profile - barId Completed in 6254ms
```

### name
Name of the current command, for example, `$ umi dev `, `name` is `dev`.

### paths
Project-related paths:
- `absNodeModulesPath`: Absolute path to the node_modules directory.
- `absOutputPath`: Output path, default is `./dist`.
- `absPagesPath`: Absolute path to the pages directory.
- `absSrcPath`: Absolute path to the src directory. Note that the src directory is optional. If there's no src directory, `absSrcPath` is the same as `cwd`.
- `absTmpPath`: Absolute path to the temporary directory.
- `cwd`: Current working directory.

Note: Cannot be accessed during the registration stage. So, it can't be directly accessed in plugins, only in hooks.

### pkg
`package.json` object of the current project.

### pkgPath
Absolute path to the `package.json` of the current project.

### plugin
Object of the current plugin.
- `type`: Plugin type, either preset or plugin.
- `path`: Plugin path.
- `id`: Plugin id.
- `key`: Plugin key.
- `config`: Plugin configuration.
- `enableBy`: Plugin enable method.

Note: The plugin object used during the registration stage is the one before your `describe`.

### service
Umi's `Service` instance. Generally not needed unless you know why.

### userConfig
User's configuration, read from `.umirc` or `config/config`, without any processing from defaultConfig or plugins. Can be used during the registration stage.

### ApplyPluginsType
Type parameter for `api.applyPlugins()`. Contains:
- `add`
- `modify`
- `event`

### ConfigChangeType
Type for `config.onChange` in `api.describe()`, currently contains two types:
- `restart`, restart the dev process (default).
- `regenerateTmpFiles`, regenerate temporary files.

### EnableBy
Plugin enable method, contains three methods:
- `register`
- `config`

### ServiceStage
Umi service run stages. Contains stages like:
- uninitialized
- init
- initPresets
- initPlugins
- resolveConfig
- collectAppData
- onCheck
- onStart
- runCommand