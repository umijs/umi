---
order: 5
toc: content
translated_at: '2024-03-17T10:39:12.468Z'
---

# Plugin API

The core of Umi lies in its plugin mechanism. With Umi's plugin mechanism, you can gain the ability to extend your project's compile-time and runtime capabilities. The following lists all the plugin APIs we provide for you, to help you freely write plugins.

Before using the Umi plugin API, we suggest you first read the [Plugin](../guides/plugins) section to understand the mechanism and principle of umi plugins, this will help you better use the plugin API.

> For ease of lookup, the contents below are sorted alphabetically.

## Core API
Methods defined in service and PluginAPI.

### applyPlugins
```ts
api.applyPlugins({ key: string, type?: api.ApplyPluginsType, initialValue?: any, args?: any })
```
Get the data after the execution of hooks registered by `register()`, this is an asynchronous function, so it will return a Promise. An example and detailed explanation of this method see [register](#register) api

### describe
```ts
api.describe({ key?: string, config?: { default, schema, onChange }, enableBy? })
```
Executed in the plugin registration stage (initPresets or initPlugins stage), used to describe the key, configuration information, and enable mode of the plugin or set of plugins.

- `key` is the key name of the plugin configuration in the configuration
- `config.default` is the default value of the plugin configuration, when the user does not configure the key in the configuration, the default configuration will take effect.
- `config.schema` is used to declare the type of configuration, based on [joi](https://joi.dev/). **If you want the user to configure, this is mandatory**, otherwise the user's configuration is ineffective
- `config.onChange` is the processing mechanism after the configuration is modified in dev mode. The default value is `api.ConfigChangeType.reload`, indicating that the dev process will restart when the configuration item is modified in dev mode. You can also change it to `api.ConfigChangeType.regenerateTmpFiles`, indicating only regenerating temporary files. You can also pass in a method to customize the processing mechanism.
- `enableBy` is the enable mode of the plugin, the default is `api.EnableBy.register`, indicating that it is enabled by registration, i.e., the plugin will be enabled as long as it is registered. Can be changed to `api.EnableBy.config`, indicating enabled by configuration, the plugin is enabled only when the user configures the plugin's configuration items. You can also customize a method that returns a boolean value (true for enable) to decide its enable timing, this is commonly used to implement dynamic effects.

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
In this example, the `key` of the plugin is `foo`, so the key name in the configuration is `foo`, the type of configuration is a string, when the configuration `foo` changes, dev will only regenerate temporary files. This plugin will only be enabled after the user configures `foo`.

### isPluginEnable
```ts
api.isPluginEnable(key: string)
```
Determine whether the plugin is enabled, the parameter is the key of the plugin

### register
```ts
api.register({ key: string, fn, before?: string, stage?: number})
```
Register hooks available for use by `api.applyPlugins`.

- `key` is the category name of the registered hook, you can use `register` multiple times to register hooks to the same `key`, they will be executed in sequence. This `key` is also used when using `applyPlugins` to collect hooks data. Note: **This key has no relation to the plugin's key.**
- `fn` is the definition of the hook, which can be synchronous or asynchronous (just return a Promise)
- `stage` is used to adjust the execution order, the default is 0, setting it to -1 or less will execute in advance, setting it to 1 or more will execute later.
- `before` is also used to adjust the order of execution, the value passed in is the name of the registered hook. Note: **The name of the hook registered by `register` is the id of the Umi plugin.** For more usage of stage and before, refer to [tapable](https://github.com/webpack/tapable)

Note: Compared to `umi@3`, `umi@4` has removed the `pluginId` parameter.

The writing method of fn needs to be determined in combination with the type parameter that will be used by applyPlugins:
- `api.ApplyPluginsType.add` `applyPlugins` will concatenate their return values into an array according to the hook order. At this point, `fn` needs to have a return value, `fn` will get the parameter `args` of `applyPlugins` as its own parameter. `applyPlugins`'s `initialValue` must be an array, its default value is an empty array. When `key` starts with `'add'` and `type` is not explicitly declared, `applyPlugins` will default to execute in this type.
- `api.ApplyPluginsType.modify` `applyPlugins` will sequentially change the `applyPlugins` received `initialValue` according to the hook order, therefore **`initialValue` is mandatory** at this point. At this time `fn` needs to receive a `memo` as its first parameter, and will take the parameter `args` of `applyPlugins` as its second parameter. `memo` is the result of a series of hooks modifying `initialValue` before, `fn` needs to return the modified `memo`. When `key` starts with `'modify'` and `type` is not explicitly declared, `applyPlugins` will default to execute in this type.
- `api.ApplyPluginsType.event` `applyPlugins` will execute in sequence according to the hook order. At this time, `initialValue` does not need to be passed in. `fn` does not need to have a return value and will take the parameter `args` of `applyPlugins` as its own parameter. When `key` starts with `'on'` and `type` is not explicitly declared, `applyPlugins` will default to execute in this type.

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
  // key is add type, no need to explicitly declare as api.ApplyPluginsType.add
  args: 1
}).then((data)=>{
  console.log(data); // [1, 2]
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
  description?: string,
  options?: string,
  details?: string,
  fn,
  alias?: string | string[],
  resolveConfigMode?: 'strict' | 'loose'
})
```
Register a command.
- `alias` is the alias, such as the alias g for generate
- `fn`'s parameter is `{ args }`, args' format is the same as the result of parsing by [yargs](https://github.com/yargs/yargs), it should be noted that the command itself is removed from `_`, such as executing `umi generate page foo`, `args._` is `['page', 'foo']`
- `resolveConfigMode` parameter controls the way of configuration parsing when executing commands, under `strict` mode it strictly verifies the content of the Umi project's configuration file, if there is illegal content the command execution is interrupted; under `loose` mode, the verification check of the configuration file is not performed.

### registerMethod
```ts
api.registerMethod({ name: string, fn? })
```
Register a method named `'name'` on api.

- When fn is passed, execute fn
- When fn is not passed, `registerMethod` will treat `name` as the `key` for `api.register` and curry it as `fn`. In this situation, it is equivalent to registering a quick call method for `register`, convenient for registering hook.

Note: 
- Compared to `umi@3`, `umi@4` has removed the exitsError parameter.
- It is generally not recommended to register additional methods, because they will not have ts hints, directly using `api.register()` is a safer approach.

e.g.1
```ts
api.registerMethod({
  name: foo,
  // has fn
  fn: (args) => {
    console.log(args);
  }
})
api.foo('hello, umi!'); // hello, umi!
```
In this example, we register a foo method on the api, which will console the parameter to the console.

e.g.2
```ts
import api from './api';

api.registerMethod({
  name: 'addFoo'
  // no fn
})

api.addFoo(args => args);
api.addFoo(args => args * 2);

api.applyPlugins({
  key: 'addFoo',
  args: 1
}).then((data)=>{
  console.log(data); // [1, 2]
});
```
In this example, we did not pass fn to `api.registerMethod`. At this time, we have registered a "registrar" on the api: `addFoo`. Each call to this method is equivalent to calling `register({ key: 'addFoo', fn })`. Therefore, when we use `api.applyPlugins` (since our method is an add type, we can not explicitly declare its type) we can get the values of the hooks we just registered.

### registerPresets
```ts
api.registerPresets(presets: string[])
```
Register a set of plugins, the parameter is an array of paths. This api must be executed in the initPresets stage, i.e. it can only register other presets in preset

e.g.
```ts
api.registerPresets([
  './preset',
  require.resolve('./preset_foo')
])
```

### registerPlugins
```ts
api.registerPlugins(plugins: string[])
```
Register plugins, the parameter is an array of paths. This api must be executed in the initPresets and initPlugins stage.

e.g.
```ts
api.registerPlugins([
  './plugin',
  require.resolve('./plugin_foo')
])
```

Note: Compared to `umi@3`, `umi@4` no longer supports passing plugin objects directly in `registerPresets` and `registerPlugins`, now only allows passing the path of the plugin.

### registerGenerator

Register a micro-generator to quickly generate template code.

Example:

```ts
import { GeneratorType } from '@umijs/core';
import { logger } from '@umijs/utils';
import { join } from 'path';
import { writeFileSync } from 'fs';

api.registerGenerator({
  key: 'editorconfig',
  name: 'Create .editorconfig',
  description: 'Setup editorconfig config',
  type: GeneratorType.generate,
  fn: () => {
    const configFilePath = join(api.cwd, '.editorconfig')
    if (existsSync(configFilePath)) {
      logger.info(`The .editorconfig file already exists.`)
      return
    }
    writeFileSync(
      configFilePath,
      `
# 🎨 http://editorconfig.org
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
`.trimStart(),
      'utf-8'
    )
    logger.info(`Generate .editorconfig file successful.`)
  }
})
```

More examples see [`Existing generator source code`](https://github.com/umijs/umi/tree/master/packages/preset-umi/src/commands/generators) .

### skipPlugins
```ts
api.skipPlugins(keys: string[])
```
Declare which plugins need to be disabled, the parameter is an array of plugin keys

## Extended Methods
Methods extended through `api.registerMethod()`, their role are to register some hooks for use, so they all need to receive a fn. Most of these methods are named in the manner of `add-` `modify-` `on-`, corresponding to the three methods of `api.ApplyPluginsType`, and the fns they receive are slightly different, see the section [register](#register) for details.

Note: All the fns mentioned below can be synchronous or asynchronous (just return a Promise). fn can be replaced by

```ts
{
  fn,
  name?: string,
  before?: string | string[],
  stage: number,
}

```
Where each parameter's role is detailed in [tapable](https://github.com/webpack/tapable)

### addBeforeBabelPlugins
Add additional Babel plugins. The fn passed in does not need parameters and needs to return a Babel plugin or array of plugins.
```ts
api.addBeforeBabelPlugins(() => {
  // Return a Babel plugin (from a Babel official website example)
  return () => {
    visitor: {
      Identifier(path) {
        const name = path.node.name;
        // Reverse the name
        path.node.name = name.split("").reverse().join("");
      }
    }
  }
})
```

### addBeforeBabelPresets
Add additional Babel preset collections. The fn passed in does not need parameters and needs to return a Babel preset collection (presets) or array of preset collections.
```ts
api.addBeforeBabelPresets(() => {
  // Return a Babel preset collection
  return () => {
    return {
      plugins: ["Babel_Plugin_A","Babel_Plugin_B"]
    }
  }
})
```

### addBeforeMiddlewares
Add middleware before webpack-dev-middleware. The fn passed in does not need parameters and needs to return an express middleware or its array.
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
Add code at the end of the entry file (after render). The fn passed in does not need parameters and needs to return a string or array of strings.
```ts
api.addEntryCode(() => `console.log('I am after render!')`);
```

### addEntryCodeAhead
Add code at the beginning of the entry file (after import, before render). The fn passed in does not need parameters and needs to return a string or array of strings.
```ts
api.addEntryCodeAhead(() => `console.log('I am before render!')`)
```

### addEntryImports
Add import statements in the entry file (at the end of import). The fn passed in does not need parameters, it needs to return a `{source: string, specifier?: string}` or its array.
```ts
api.addEntryImports(() => ({
  source: '/modulePath/xxx.js',
  specifier: 'moduleName'
}))
```

### addEntryImportsAhead
Add import statements in the entry file (at the beginning of import). The fn passed in does not need parameters, it needs to return a `{source: string, specifier?: string}` or its array.
```ts
api.addEntryImportsAhead(() => ({
  source: 'anyPackage'
}))
```

### addExtraBabelPlugins
Add extra Babel plugins. The fn passed in does not need parameters and needs to return a Babel plugin or plugin array.

### addExtraBabelPresets
Add extra Babel preset collections. The fn passed in does not need parameters and needs to return a Babel preset collection or its array.

### addHTMLHeadScripts
Add scripts to the `<head>` element of HTML. The fn passed in does not need parameters and needs to return a string (the code to be added) or a `{ async?: boolean, charset?: string, crossOrigin?: string | null, defer?: boolean, src?: string, type?: string, content?: string }` or its array.
```ts
api.addHTMLHeadScripts(() => `console.log('I am in HTML-head')`)
```

### addHTMLLinks 
Add Link tags to HTML. The fn passed in does not need parameters, the returned object or its array interface is as follows:
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
Add Meta tags to HTML. The fn passed in does not need parameters, the returned object or its array interface is as follows:
```ts
{
  content?: string,
  'http-equiv'?: string,
  name?: string,
  scheme?: string  
}
```

### addHTMLScripts
Add scripts to the end of HTML. The fn passed in does not need parameters, the returned object interface is the same as [addHTMLHeadScripts](#addHTMLHeadScripts)

### addHTMLStyles
Add Style tags to HTML. The fn passed in does not need parameters, returning a string (code in the style tag) or `{ type?: string, content?: string }` or its array.


### addLayouts
Add global layout components. The fn passed in does not need parameters, returns `{ id?: string, file: string }`

### addMiddlewares
Add middleware, after the route middleware. The fn passed in does not need parameters, returns express middleware.

### addPolyfillImports
Add polyfill imports, executed at the very beginning of the application. The fn passed in does not need parameters, returns `{ source: string, specifier?:string }`

### addPrepareBuildPlugins

### addRuntimePlugin
Add runtime plugin, the fn passed in does not need parameters, returns a string, indicating the path of the plugin.

### addRuntimePluginKey
Add runtime plugin key, the fn passed in does not need parameters, returns a string, indicating the path of the plugin.

### addTmpGenerateWatcherPaths
Add watching paths, changes will re-generate temporary files. The fn passed in does not need parameters, returns a string, indicating the path to be watched.

### addOnDemandDeps
Add dependencies for on-demand installation, which will
