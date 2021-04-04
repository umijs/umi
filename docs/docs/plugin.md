---
translateHelp: true
---

# Plugin


## The id and key of the plug-in

Each plug-in have an `id` and a `key`

`id` is a shorthand for path

`key` is a unique value for configuration after further simplification.


For example, in the plug-in `/node_modules/@umijs/plugin-foo/index.js`，usually, its id is `@umijs/plugin-foo`，and its key is `foo`.

## Enabling the plugin

There are multiple ways to enable plugin

### package.json dependencies

Umi will automatically detect the umi plugins in `dependencies` and `devDependencies`, for example:

```json
{
  "dependencies": {
    "@umijs/preset-react": "1"
  }
}
```

Then `@umijs/preset-react` will be automatically registered without repeating the declaration in the configuration.

### Configuration

In the configuration, plugins can be configured through `presets` and `plugins` value, for example:

```js
export default {
  presets: ['./preset', 'foo/presets'],
  plugins: ['./plugin'],
}
```

This is usually used in two situations:

1. Projects with relative path plugins 
2. Plugins with no npm package entry file

note：

* Do not configure the plug-in with both methods, otherwise it will report a duplicate registration error

### Environment variables

It is also possible to register additional plugins through the environment variables `UMI\_PRESETS` and `UMI\_PLUGINS`.

Example：

```bash
$ UMI_PRESETS=/a/b/preset.js umi dev
```

note：

* This method is not intended to be used as primary register method, it is usually used for secondary packaging based on the umi framework 

## Check plug-in registration

### Via command line

You can execute the following commands:

```bash
$ umi plugin list

# By the way, see which keys they use respectively 
$ umi plugin list --key
```

The result is usually as follows:

```bash
  Plugins:

    - @umijs/preset-built-in [key: builtIn] (preset)
    - @@/registerMethods [key: registerMethods]
    - @@/routes [key: routes]
    - @@/generateFiles/core/history [key: history]
    - @@/generateFiles/core/plugin [key: plugin]
    - @@/generateFiles/core/routes [key: routes]
    - ...
```

### Verify others plugins in your plugin

You can check the existence of other plugins through `api.hasPlugins(pluginId[])` and `api.hasPresets(pluginId[])`, please refer to the plug-in API for more details.

## Disable plugin

There are two ways to disable plugins:

### Configure key to false 

Example：

```js
export default {
  mock: false,
}
```

Umi's built-in mock plugin and its functions will be disabled. 

### Disable other plugins in the plugin 

It can be disabled by `api.skipPlugins(pluginId[])`, see the plugin API for details. 

## Configure plugin

Configure the plug-in through its key, example 

```js
export default {
  mock: { exclude: ['./foo'] }
}
```

The value mock here is the key of the mock plugin. 

For another example, if we install a plug-in `umi-plugin-bar`, its default key is `bar`, so it can be configured as 

```js
export default {
  bar: { ...balabala },
}
```
