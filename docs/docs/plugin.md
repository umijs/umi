---
translateHelp: true
---

# Plugin


## Id and key of the plugin

Each plugin will have an id and a key. *Id is a shorthand for the path* and *key is the only value used for configuration after further simplifying*.

For example, a plugin `plug-` in `/node_modules/@umijs/plugin-foo/index.js`，usually has an `id` named `@umijs/plugin-foo` and a key `foo`.

## Enable plugin

There are multiple ways to enable plugins.

### package.json dependencies

Umi automatically detects `dependencies` and `devDependencies` inside umi plug-ins, such as:

```json
{
  "dependencies": {
    "@umijs/preset-react": "1"
  }
}
```

`@umijs/preset-react` is automatically registered, no need to repeat the statement in the configuration.

### Configuration

In the configuration through `presets` and `plugins` configure plug-ins, such as:

```js
export default {
  presets: ['./preset', 'foo/presets'],
  plugins: ['./plugin'],
}
```

It is usually used in several situations:

1. Project relative path plugin
2. Plugins for non-npm package entry files

Note:

* Please do not configure the plugin of the npm package, otherwise it will report a duplicate registration error

### Environment variable

environment variables `UMI_PRESETS` and `UMI_PLUGINS` register additional plug-ins.

such as:

```bash
$ UMI_PRESETS=/a/b/preset.js umi dev
```

note:

* Not recommended in projects, usually used for secondary packaging of umi-based frameworks
  
## Check plugin registration

### Via command line

You can execute the following command:

```bash
$ umi plugin list

# list plugin keys
$ umi plugin list --key
```

Displays:

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

### Detect nested plugins

Use `api.hasPlugins(pluginId[])` and `api.hasPresets(pluginId[])` to detect nested plugins (ie. plugins inside plugins)

## Disable plugin

There are two ways to disable the plugin

### Configure key as false

Example:

```js
export default {
  mock: false,
}
```

Disables Umi's built-in mock plugin and its features.

### Disable nested plugins

Use `api.skipPlugins([...])` to disable nested plugins

## Configure the plugin

Configure the plugin by its key, such as:

```js
export default {
  mock: { exclude: ['./foo'] }
}
```

The mock here is the key of the mock plugin.

For another example, we install a plug-in `umi-plugin-bar`, the key of which is default `bar`.

You can then configure it:

```js
export default {
  bar: { ...balabala },
}
```
