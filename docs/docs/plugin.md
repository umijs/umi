---
translateHelp: true
---

# Plugin


## the id and key of plugin

Each plug-in has an ID and a key，**Id is short for path**，**Key is the only value used for configuration after further simplification**。

for example `/node_modules/@umijs/plugin-foo/index.js`，generally speaking，id is `@umijs/plugin-foo`，key is `foo`。

## use plugin

Plug-ins can be enabled in a number of ways，

### package.json dependency

Umi automatically detects Umi plug-ins in 'dependencies' and' devDependencies', for example

```json
{
  "dependencies": {
    "@umijs/preset-react": "1"
  }
}
```

so that `@umijs/preset-react` will be automatically registered，there is no need to repeat the declaration in the configuration。

### configuration

Plugins can be configured using 'presets' and' plugins', for example：

```js
export default {
  presets: ['./preset', 'foo/presets'],
  plugins: ['./plugin'],
}
```

It is usually used in several situations：

1. Plugins for project relative paths
2. Plug-ins that are not NPM package entry files

warning：

* Do not configure the plug-in of the NPM package; otherwise, a duplicate registration error will be reported

### environment variable

Additional plug-ins can also be registered with the environment variables' UMI\_PRESETS 'and' UMI\_PLUGINS '.

for example：

```bash
$ UMI_PRESETS=/a/b/preset.js umi dev
```

warning：

* It is not recommended in this project. It is usually used for umi - based framework secondary encapsulation

## Check plug-in registration

### command

You can run the following commands，

```bash
$ umi plugin list

# By the way, =see what "key" they used
$ umi plugin list --key
```

The results are usually as follows:

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

### Aware of other plug-ins in plug-ins

use `api.hasPlugins(pluginId[])` and `api.hasPresets(pluginId[])` to awareness of other plug-ins，details in API。

## Disable the plug-in

There are two ways to disable plug-ins,

### set key to "false"

for example：

```js
export default {
  mock: false,
}
```

Umi's built-in mock plug-ins and their functions are disabled。

### Disable other plug-ins in plug-ins

use `api.skipPlugins(pluginId[])` to disable，details in API。

## Configure the plug-in

Configure the plug-in with its key, for example:

```js
export default {
  mock: { exclude: ['./foo'] }
}
```

The mock here is the key of the mock plug-in.

For example, if we install a plugin 'umi-plugin-bar' and its key defaults to 'bar', we can configure it in this way，

```js
export default {
  bar: { ...balabala },
}
```
