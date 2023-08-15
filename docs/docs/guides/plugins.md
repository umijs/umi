# Developing Plugins

The core of Umi based on its plugin mechanism. Based on Umi's plugin mechanism, you can extend the capabilities of your project during both compile-time and runtime. You can use the [Plugin API](../api/plugin-api) provided by Umi to freely write plugins and achieve various functionalities such as modifying code bundling configuration, altering startup code, defining directory structures, and modifying HTML content.

## Core Concepts
A plugin in Umi is essentially a function that receives a parameter: `api`. Within a plugin, you can call methods provided by the `api` to register various hooks, which Umi will execute at specific times.

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
In this example, the plugin's purpose is to change the `favicons` configuration based on the user's `changeFavicon` value (a simple and non-functional example). As you can see, a plugin is essentially a function that accepts the `api` parameter. Within this function, we call `api.modifyConfig` to register a hook `(memo) => {...}`. When you configure `changeFavicon` in your configuration, Umi will register this plugin. During Umi's configuration collection lifecycle, the hooks registered within the plugin will be executed, and the `favicon` configuration will be modified according to the user's `changeFavicon`

### Plugin vs. Preset
A preset is used to set up a group of plugins. It's typically used to register a set of presets and plugins together. Inside a preset, the method that receives the `api` parameter can return an object containing `plugins` and `presets` properties, which registers the corresponding plugins or plugin sets.

For example:
```js
import { IApi } from 'umi';

export default (api: IApi) => {
  return {
    plugins: ['./plugin_foo', './plugin_bar'],
    presets: ['./preset_foo']
  }
};
```
The order of registration matters: presets are always registered before plugins. Umi maintains separate queues for registering presets and plugins. In the example above, the registered `preset_foo` will be placed at the front of the presets queue, while `plugin_foo` and `plugin_bar` will be placed at the end of the plugins queue. Placing presets at the front of the queue ensures that the order and relationship between presets are controlled.

It's important to note that presets registered within a plugin are immediately executed, whereas plugins registered within a preset are executed later.

### Plugin id and key
Each plugin has an id and a key.

id: The id of a plugin is a shorthand for the plugin's path, serves as a unique identifier for the plugin; key: The key of a plugin is used for configuring the plugin. It's the key under which you configure the plugin in your configuration.

For example, a plugin located at `node_modules/@umijs/plugin-foo/index.js` would have an ID of `@umijs/plugin-foo` and a key of `foo`. This allows you to configure the plugin using the key `foo`.

## Enabling Plugins
There are two ways to enable plugins: using environment variables and using configuration. (Unlike in `umi@3`, plugins in dependencies are no longer automatically enabled.)

Note: The term "plugin" here refers to third-party plugins. Umi's built-in plugins are all enabled through configuration by setting their keys.

### Environment Variables
You can also enable additional plugins using the `UMI_PRESETS` and `UMI_PLUGINS` environment variables.
For example:
```shell
$ UMI_PRESETS = foo/preset.js umi dev
```
Note: It's not recommended to use this in projects; it's usually used for secondary encapsulation of frameworks based on Umi.

### Configuration
In the configuration file, you can use the `presets` and `plugins` options to configure plugins. For example:
```js
export default {
  presets: ['./preset/foo','bar/presets'],
  plugins: ['./plugin', require.resolve('plugin_foo')]
}
```
The values provided in the configuration are the paths to the plugins.

### Plugin Loading Order
The registration of Umi plugins follows a specific order:
- All presets are registered before plugins.
- Built-in plugins -> Environment variable plugins -> User-configured plugins
- Plugins registered simultaneously (within the same array) are registered in order.
- Preset-registered presets are executed immediately, while preset-registered plugins are executed last.

## Disabling Plugins
There are two ways to disable plugins:
### Setting the Key to `false`
For example:
```js
export default{
  mock: false
}
```
This will disable the built-in `mock` plugin in Umi.

### Disabling Other Plugins Within a Plugin
It can be disabled by `api.skipPlugins(pluginId[])`, see [Plugin API](../api/plugin-api) for details.

## Viewing Plugin Registration
### Command line
```shell
$ umi plugin list
```

## Configuring Plugins
You can configure plugins using their keys. For example:
```js
export default{
  mock: { exclude: ['./foo'] }
}
```
Here, `mock` is the key for the built-in mock plugin in Umi.

If you install a plugin named `umi-plugin-bar`, and its key defaults to `bar`, you can configure it like this:
```js
export default{
  bar: { ... }
}
```

### Default Naming Convention for Plugin Keys
If a plugin is a package, the default key is the package name without the prefix. For instance, the key for `@umijs/plugin-foo` would be `foo`, and `@alipay/umi-plugin-bar` would have a default key of `bar`. Please note that the default naming convention assumes that your package name follows the Umi plugin naming convention.

If a plugin is not a package, the default key is the plugin's filename. For instance, `./plugins/foo.js` would have a default key of `foo`.

To avoid unnecessary complications, it's recommended to explicitly declare the key for your self-written plugins.

## Umi Plugin Mechanism and Its Lifecycle

![Umi Plugin Mechanism](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*GKNdTZgPQCIAAAAAAAAAAAAAARQnAQ)

### Lifecycle Stages

- init stage: In this stage, Umi loads various configuration information, including loading `.env` files, requiring `package.json`, loading user configuration, and resolving plugins (built-in plugins, environment variable plugins, and user-configured plugins).
- initPresets stage: In this stage, Umi registers presets. Presets can add additional plugins by returning `{ presets, plugins }` in their registration methods. Presets will be added to the front of the presets queue, while plugins will be added to the end of the plugins queue.
- initPlugins stage: In this stage, Umi registers plugins. This includes additional plugins added by presets in the previous stage. It's important to note that although plugins can also return `{ presets, plugins }`, Umi doesn't do anything with them in this stage. The `init` of a plugin is essentially executing the plugin's code, which mainly involves registering hooks through the `api`. The actual execution of these hooks doesn't happen in this stage, so it's referred to as the registration of the plugin.
- resolveConfig stage: In this stage, Umi organizes the `config schema` definitions from various plugins and then executes hooks such as `modifyConfig`, `modifyDefaultConfig`, and `modifyPaths` to collect configuration information.
- collectionAppData stage: In this stage, Umi executes the `modifyAppData` hook to maintain the app's metadata (the `AppData` is a new API introduced in `umi@4`).
- onCheck stage: In this stage, Umi executes the `onCheck` hook.
- onStart stage: In this stage, Umi executes the `onStart` hook.
- runCommand stage:  In this stage, Umi runs the current CLI command, such as `umi dev`. Umi's core functionalities are all implemented through commands. The various hooks registered by plugins through API calls are executed within this stage.

The above description outlines the entire process of Umi's plugin mechanism.

### `register()`, `registerMethod()`, and `applyPlugins()`

`register()` receives a key and a hook, it maintains a `key-hook[]` map, and whenever `register()` is called, an additional hook will be registered for the key.

`register()` registers hooks for use by applyPlugins. The execution order of these hooks refers to [tapable](https://github.com/webpack/tapable)

`registerMethod()` takes a key and a fn, it will register a method on the api. If you don't pass fn to `registerMethod()`, then `registerMethod()` will register a "registrar" on the api: it will pass `register()` into the key and curry the result as fn is registered on the api. In this way, the hook can be quickly registered for the key by calling this "registrar".

For more specific use of the above api, please refer to [Plugin API](../api/plugin-api)

### PluginAPI's Underlying Mechanism
Umi creates a PluginAPI object for each plugin. This object references both the plugin itself and Umi's service.

The `get()` method of the PluginAPI object is proxied by Umi and follows these rules:
- pluginMethod:  If the prop is one of Umi's `pluginMethods[]` (methods registered using `registerMethod()`), it returns that method.
- service props: If the property is in the serviceProps array (these are properties that Umi allows plugins to directly access), it returns the corresponding property from the service.
- static props: If the property is in the `staticProps` array (these are static variables like type definitions and constants), it returns that property.
- Otherwise, it returns the corresponding property from the API.

This way, Umi provides most of the API to plugins through `registerMethod()`, allowing you to quickly register hooks within plugins. This separation between the framework and functionality is evident: Umi's service only provides plugin management functionality, while the API relies on plugins to provide functionality.

### preset-umi
`umi-core` provides a plugin registration and management mechanism. Umi's core functionalities are actually implemented through [preset-umi](https://github.com/umijs/umi/tree/master/packages/preset-umi).

`preset-umi` is essentially a built-in plugin set. It provides three types of plugins:
- registerMethods: These plugins register some of the aforementioned "registerers," which allow developers to quickly register hooks. Most of the methods in `PluginAPI` fall into this category.
- features: These plugins provide specific features to Umi, such as appData, lowImport, and mock.
- commands: These plugins register various commands, providing different functionalities to the Umi CLI. Umi's ability to run in the terminal relies on these commands, which provide core functionalities to the CLI.
