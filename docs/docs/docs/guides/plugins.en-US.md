---
order: 16
toc: content
translated_at: '2024-03-17T10:25:42.549Z'
---

# Plugin Development
The essence of Umi lies in its plugin mechanism. Based on the plugin mechanism of Umi, you can enhance the build-time and runtime capabilities of your project. You can freely write plugins using the [Plugin API](../api/plugin-api) we provide, thus achieving rich functionalities like modifying the code packaging configuration, modifying startup code, convention directory structure, modifying HTML, etc.

## Core Concepts
The essence of a plugin is a method that receives one parameter: api. Within the plugin, you can call methods provided by api to register some hooks, which Umi will execute at specific times.

For example:
```js
import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'changeFavicon',
    config: {
      schema(joi) {
        return joi.string();
      },
    },
    enableBy: api.EnableBy.config
  });
  api.modifyConfig((memo)=>{
    memo.favicons = api.userConfig.changeFavicon;
    return memo;
  });
};
```
The purpose of this plugin is to change the favicons in the configuration based on the user-configured changeFavicon value (a very simple example with no practical use XD). As you can see, a plugin is essentially a method that receives the parameter api. In this method, we called `api.modifyConfig` to register a hook: `(memo)=>{...}`. After you have configured `changeFavicon` in the configuration, Umi will register the plugin. During Umi's configuration collection lifecycle, the hook we registered in the plugin will be executed, changing the `favicon` in the configuration to the `changeFavicon` configured by the user.

### plugin and preset
The role of a preset is to preset some plugins, which is typically used to register a batch of presets and plugins. In presets, the method mentioned above that accepts the api can have a return value, which is an object containing plugins and presets properties, for the purpose of registering the corresponding plugins or plugin sets.

For example:
```js
import { IApi } from 'umi';

export default (api: IApi) => {
  return {
    plugins: ['./plugin_foo','./plugin_bar'],
    presets: ['./preset_foo']
  }
};
```
Their registration order is worth noting: presets are always registered before plugins. Umi maintains two queues to register presets and plugins sequentially, the registered `preset_foo` in this example would be placed at the head of the presets queue, and `plugin_foo` and `plugin_bar` would be placed at the tail of the plugins queue one by one. The purpose of putting preset at the head is to ensure the order and relationship between presets are controllable.

Another noteworthy point is: in plugins, you can also return some plugins or presets, but Umi won't do anything about it.

### Plugin's id and key
Each plugin corresponds to an id and key.

The id is an abbreviation for the plugin's path and serves as the unique identifier of the plugin; while the key is the key name used for plugin configuration.

For example, the plugin `node_modules/@umijs/plugin-foo/index.js`, typically, its id is `@umijs/plugin-foo`, and the key is `foo`. This allows developers to configure the item with the key name `foo` in the configuration to configure the plugin.

## Enabling Plugins
There are two ways to enable plugins: enable in environment variables and enable in configuration. (Different from `umi@3`, we no longer support automatic enabling of plugins in the dependencies of `package.json`)

Note: Here we refer to third-party plugins, as Umi's built-in plugins are universally enabled in the configuration through their keys.

### Environment Variables
You can also register additional plugins through the environment variables `UMI_PRESETS` and `UMI_PLUGINS`.
For example:
```shell
$ UMI_PRESETS = foo/preset.js umi dev
```
Note: It is not recommended for use in projects, usually for secondary packaging based on Umi framework.

### Configuration
Plugins are configured in the configuration through `presets` and `plugins`, for example:
```js
export default {
  presets: ['./preset/foo','bar/presets'],
  plugins: ['./plugin', require.resolve('plugin_foo')]
}
```
The content of the configuration is the path of the plugin.

### Order of Plugins
The registration of Umi plugins follows a certain order:
- All presets are registered before plugins.
- Built-in plugins -> plugins in environment variables -> plugins in user config.
- Plugins registered at the same time (in the same array) are registered in sequence.
- Presets registered in a preset are executed immediately, while plugins registered are executed at the end.

## Disabling Plugins
There are two ways to disable plugins
### Configuring key as false
For example:
```js
export default{
  mock: false
}
```
This would disable Umi's built-in mock plugin.

### Disabling Other Plugins in a Plugin
This can be done by using `api.skipPlugins(pluginId[])`, see [Plugin API](../api/plugin-api) for more details.

## Viewing Plugin Registration Status
### Command Line
```shell
$ umi plugin list
```

## Configuring Plugins
Configure plugins through the key of the plugin, for example:
```js
export default{
  mock: { exclude: ['./foo'] }
}
```
Here mock is the key of Umi's built-in mock plugin.

For instance, if we install a plugin `umi-plugin-bar`, its default key is `bar`, then it can be configured:
```js
export default{
  bar: { ... }
}
```

### Default Naming Rules for Plugin Keys
If the plugin is a package, the default value of the key will be the package name without prefix. For example, the default key for `@umijs/plugin-foo` is `foo`, and the default key for `@alipay/umi-plugin-bar` is `bar`. It is worth noting that this default rule requires your package name to conform to the Umi plugin naming convention.

If the plugin is not a package, the default value of the key will be the filename of the plugin. For example, the default key for `./plugins/foo.js` is `foo`.

To avoid unnecessary trouble, we recommend that you explicitly declare the key for your own written plugins.

## The Mechanism and Lifecycle of Umi Plugins

![Umi Plugin Mechanism](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*GKNdTZgPQCIAAAAAAAAAAAAAARQnAQ)

### Lifecycle

- init stage: At this stage, Umi loads various configuration information. Including loading `.env` files; requiring `package.json`; loading user configurations; resolving all plugins (built-in plugins, environment variables, and user configs in sequence).
- initPresets stage: At this stage, Umi registers presets. Presets can register additional plugins by returning `{ presets, plugins }`, where presets will be added to the top of the presets queue, and plugins will be added to the end of the plugins queue.
- initPlugins stage: At this stage, Umi registers plugins. These plugins include additional plugins added by presets in the previous stage. A point worth noting is that even though plugins can also `return { presets, plugins }`, Umi will not do anything about it. The init of a plugin is essentially executing the plugin's code (but the essence of the plugin's code is just calling the api to register various hooks, and the execution of hooks does not occur at this stage, so this is called plugin registration).
- resolveConfig stage: At this stage, Umi organizes definitions of `config schema` from various plugins, then executes hooks like `modifyConfig`, `modifyDefaultConfig`, `modifyPaths` etc., to collect configurations.
- collectionAppData stage: At this stage, Umi executes the `modifyAppData` hook, to maintain the metadata of the App. (`AppData` is a new api added in `umi@4`)
- onCheck stage: At this stage, Umi executes the `onCheck` hook.
- onStart stage: At this stage, Umi executes the `onStart` hook.
- runCommand stage: At this stage, Umi runs the current cli command to be executed, (for example `umi dev`, here the dev command will be executed) The various core functionalities of Umi are implemented in the command. Including most of the hooks registered by our plugins calling the api.

The above is the overall process of Umi's plugin mechanism.

### `register()`, `registerMethod()`, and `applyPlugins()`

`register()` accepts a key and a hook, maintaining a `key-hook[]` map, each call to `register()` will register an additional hook for the key.

`register()` registered hooks are for use by applyPlugins. The execution sequence of these hooks follows [tapable](https://github.com/webpack/tapable).

`registerMethod()` accepts a key and a fn, it registers a method on the api. If no fn is passed to `registerMethod()`, it will register a "register" on the api: it will register the result of `register()` passed in key and curried as fn to the api. This allows for registering hooks for the key quickly by calling this "register".

For more specific use of the above api, please refer to [Plugin API](../api/plugin-api).

### The Principle of PluginAPI
Umi assigns a PluginAPI object to each plugin, which references both the plugin itself and Umi's service.

Umi has proxied the `get()` method of the PluginAPI object according to the following rules:
- pluginMethod: If prop is a method in Umi's maintained `pluginMethods[]` (methods registered through `registerMethod()`), then it returns this method.
- service props: If prop is an attribute in the serviceProps array (these attributes are properties that Umi allows plugins direct access to), then it returns the corresponding property of the service.
- static props: If prop is an attribute in the staticProps array (these attributes are static variables, such as some type definitions and constants), then it returns it.
- Otherwise, it returns the property of the api.

Therefore, most of the apis provided to plugins by Umi are implemented by relying on `registerMethod()`, you can directly use our apis to quickly register hooks in plugins. This is also a manifestation of Umi's decoupling of framework and functionalities: Umi's service only provides plugin management functionalities, while the apis all rely on plugins to provide.

### preset-umi
`umi-core` provides a set of plugin registration and management mechanisms. And Umi's core functionalities are all implemented by [preset-umi](https://github.com/umijs/umi/tree/master/packages/preset-umi).

`preset-umi` is essentially an inbuilt plugin set, which provides plugins in three categories:
- registerMethods, registering some of the "registers" mentioned above for developers to quickly register hooks, occupying most of the PluginAPI.
- features, providing Umi with some features, such as appData, lowImport, mock, etc.
- commands, registering various commands, providing various functionalities of Umi CLI. Umi's ability to operate normally in the terminal relies on the functionalities provided by commands.
