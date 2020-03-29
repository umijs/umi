# Plugin


## id and key of the plugin

Each plugin will have an id and a key, where **id is short for path**, and **key is the only value used for configuration after further simplification**.

For example, the plugin `/node_modules/@umijs/plugin-foo/index.js`, generally speaking, its id is `@umijs/plugin-foo`, and its key is `foo`.

## Enable plugin

There are multiple ways to enable plugins.

### package.json dependencies

Umi will automatically detect umi plugins in `dependencies` and `devDependencies`, such as:

```json
{
  "dependencies": {
    "@umijs/preset-react": "1"
  }
}
```

Then `@ umijs/preset-react` will be registered automatically, there is no need to repeat the declaration in the configuration.

### Configuration

In the configuration, you can configure plugins through `presets` and `plugins`, such as:

```js
export default {
  presets: ['./preset', 'foo/presets'],
  plugins: ['./plugin'],
}
```

It is usually used in several situations:

1. Project relative path plugin
2. Non-npm package entry files

note:

* Please don't configure the plugin of npm package, otherwise it will report duplicate registration error

### Environment variable

Additional plugins can also be registered via the environment variables `UMI\_PRESETS` and `UMI\_PLUGINS`.

such as:

```bash
$ UMI_PRESETS=/a/b/preset.js umi dev
```

note:

* Not recommended in the project, usually used for secondary packaging of umi-based framework

## Check plugin registration

### Via command line

You can execute the following command,

```bash
$ umi plugin list

# By the way, see which keys they use respectively
$ umi plugin list --key
```

The results are usually as follows,

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

Other plugins can be perceived by means of `api.hasPlugins(pluginId[])` and `api.hasPresets(pluginId[])`. For details, please refer to the plugin API.

## Disable plugin

There are two ways to disable the plugin,

### Configure key to false

such as:

```js
export default {
  mock: false,
}
```

Umi's built-in mock plugin and its features will be disabled.

### Disable other plugins in the plugin

It can be disabled by means of `api.skipPlugins(pluginId[])`, see the plugin API for details.

## Configure the plugin

Configure the plugin by its key, such as:

```js
export default {
  mock: { exclude: ['./foo'] }
}
```

The mock here is the key of the mock plugin.

For another example, we install a plugin `umi-plugin-bar`, whose key is `bar` by default, which can be configured like this,

```js
export default {
  bar: { ...balabala },
}
```
