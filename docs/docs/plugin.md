# Plugin

## Plugin IDs and Keys

Each plugin corresponds to an ID and a key. **The ID is a shorthand for the plugin's path**, while **the key is a further simplified unique value used for configuration**.

For example, for the plugin located at `/node_modules/@umijs/plugin-foo/index.js`, its ID is typically `@umijs/plugin-foo`, and its key is `foo`.

## Enabling Plugins

There are multiple ways to enable plugins:

### package.json Dependencies

Umi automatically detects Umi plugins listed in `dependencies` and `devDependencies`. For example:

```json
{
  "dependencies": {
    "@umijs/preset-react": "1"
  }
}
```

In this case, `@umijs/preset-react` will be automatically registered, and there's no need to declare it again in the configuration.

### Configuration

You can configure plugins using `presets` and `plugins` in the configuration, like this:

```js
export default {
  presets: ['./preset', 'foo/presets'],
  plugins: ['./plugin'],
}
```

This is typically used in the following situations:

1. For plugins located relative to the project's path.
2. For plugins that are not the main entry points of npm packages.

Note:

- Avoid configuring npm package plugins, as it will result in duplicate registration errors.

### Environment Variables

You can also register additional plugins through environment variables `UMI_PRESETS` and `UMI_PLUGINS`. For example:

```bash
$ UMI_PRESETS=/a/b/preset.js umi dev
```

Note:

- It's not recommended for use in projects and is usually used for custom frameworks built on top of Umi.

## Checking Plugin Registration

### Via Command Line

You can use the following commands:

```bash
$ umi plugin list

# Additionally, see which keys each plugin is using
$ umi plugin list --key
```

The results typically look like this:

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

### Perceiving Other Plugins Within a Plugin

You can use `api.hasPlugins(pluginId[])` and `api.hasPresets(pluginId[])` to perceive other plugins. For more details, refer to the plugin API.

## Disabling Plugins

There are two ways to disable plugins:

### Setting the Key to `false` in Configuration

For example:

```js
export default {
  mock: false,
}
```

This will disable Umi's built-in mock plugin and its functionality.

### Disabling Other Plugins Within a Plugin

You can use `api.skipPlugins(pluginId[])` to disable other plugins. Refer to the plugin API for more information.

## Configuring Plugins

Configure plugins using their keys. For example:

```js
export default {
  mock: { exclude: ['./foo'] }
}
```

Here, `mock` is the key for the mock plugin.

For instance, if you install a plugin named `umi-plugin-bar`, and its default key is `bar`, you can configure it like this:

```js
export default {
  bar: { ...balabala },
}
```
