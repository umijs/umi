---
translateHelp: true
---

# Plugin


## Plug-in id and key

Each plug-in corresponds to an id and a key, **id is shorthand for path**, **key is a unique value for configuration after further simplified**.

For example, the plugin `/node_modules/@umijs/plugin-foo/index.js`, usually, its id is `@umijs/plugin-foo` and its key is `foo`.

## Enable plugin

There are multiple ways to enable plugins,

### package.json dependencies

Umi will automatically detect the umi plugins in `dependencies` and `devDependencies`, for example:

```json
{
  "dependencies": {
    "@umijs/preset-react": "1"
  }
}
```

Then `@umijs/preset-react` will be automatically registered, no need to repeat the declaration in the configuration.

### Configuration

In the configuration, plugins can be configured through `presets` and `plugins`, for example:

```js
export default {
  presets: ['./preset', 'foo/presets'],
  plugins: ['./plugin'],
}
```

Usually used in several situations:

1. Project relative path plugin
2. Plug-ins for non-npm package entry files

note:

* Please do not configure the plug-in of the npm package, otherwise it will report a duplicate registration error

### Environment variables

You can also register additional plugins through the environment variables ʻUMI\_PRESETS` and ʻUMI\_PLUGINS`.

such as:

```bash
$ UMI_PRESETS=/a/b/preset.js umi dev
```

note:

* Not recommended in the project, usually used for secondary packaging based on umi framework

## Check plugin registration

### Via the command line

You can execute the following commands,

```bash
$ umi plugin list

# By the way, see which keys they use
$ umi plugin list --key
```

The result is usually as follows,

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

### Perceive other plugins in the plugin

You can perceive other plug-ins by means of ʻapi.hasPlugins(pluginId[])` and ʻapi.hasPresets(pluginId[])`, see the plug-in API for details.

## Disable plugin

There are two ways to disable plugins,

### Configure key to false

such as:

```js
export default {
  mock: false,
}
```

Umi's built-in mock plugin and its functions will be disabled.

### Disable other plugins in the plugin

It can be disabled by means of ʻapi.skipPlugins(pluginId[])`, see plugin API for details.

## Configure plugin

Configure the plug-in through its key, such as:

```js
export default {
  mock: { exclude: ['./foo'] }
}
```

The mock here is the key of the mock plugin.

For another example, if we install a plug-in ʻumi-plugin-bar`, its key default is `bar`, so it can be configured like this,

```js
export default {
  bar: { ...balabala },
}
```
