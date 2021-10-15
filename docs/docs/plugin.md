
# Plugin


## The id and key of the plug-in

Each plug-in corresponds to an id and a key. **id is a shorthand for path**, and **key is a unique value for configuration after further simplification**.

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

Typically used in various situations:

1. Project relative path plugin
2. Plugins for non-npm package entry files 

Notice:

* Please do not configure the plug-in of the npm package, otherwise it will report a duplicate registration error

### Environment variable

It is also possible to register additional plugins through the environment variables `UMI\_PRESETS` and `UMI\_PLUGINS`.

for example:

```bash
$ UMI_PRESETS=/a/b/preset.js umi dev
```

Notice:

* It is not recommended in the project, it is usually used for secondary packaging based on the umi framework

## Check plug-in registration

### Via command line 

You can execute the following commands,

```bash
$ umi plugin list

# By the way, see which keys they use respectively 
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

Other plug-ins can be perceived through `api.hasPlugins(pluginId[])` and `api.hasPresets(pluginId[])`, please refer to the plug-in API for details.

## Disable plugin

There are two ways to disable plugins,

### Configure key to false 

for example:

```js
export default {
  mock: false,
}
```

Umi's built-in mock plugin and its functions will be disabled.

### Disable other plugins in the plugin

It can be disabled by `api.skipPlugins(pluginId[])`, see the plugin API for details.

## Configure plugin

Configure the plug-in through its key, such as:

```js
export default {
  mock: { exclude: ['./foo'] }
}
```

The mock here is the key of the mock plugin.

For another example, if we install a plug-in `umi-plugin-bar`, its key default is `bar`, so it can be configured like this,

```js
export default {
  bar: { ...balabala },
}
```
