---
translateHelp: true
---

# Plugin


## 插件的 id 和 key

每个插件都会对应一个 id 和一个 key，**id 是路径的简写**，**key 是进一步简化后用于配置的唯一值**。

比如插件 `/node_modules/@umijs/plugin-foo/index.js`，通常来说，其 id 为 `@umijs/plugin-foo`，key 为 `foo`。

## 启用插件

插件有多种启用方式，

### package.json 依赖

Umi 会自动检测 `dependencies` 和 `devDependencies` 里的 umi 插件，比如：

```json
{
  "dependencies": {
    "@umijs/preset-react": "1"
  }
}
```

那么 `@umijs/preset-react` 会自动被注册，无需在配置里重复声明。

### 配置

在配置里可通过 `presets` 和 `plugins` 配置插件，比如：

```js
export default {
  presets: ['./preset', 'foo/presets'],
  plugins: ['./plugin'],
}
```

通常用于几种情况：

1. 项目相对路径的插件
2. 非 npm 包入口文件的插件

注意：

* 请不要配置 npm 包的插件，否则会报重复注册的错误

### 环境变量

还可通过环境变量 `UMI\_PRESETS` 和 `UMI\_PLUGINS` 注册额外插件。

比如：

```bash
$ UMI_PRESETS=/a/b/preset.js umi dev
```

注意：

* 项目里不建议使用，通常用于基于 umi 的框架二次封装

## 检查插件注册情况

### 通过命令行

可以执行以下命令，

```bash
$ umi plugin list

# 顺便看看他们分别用了哪些 key
$ umi plugin list --key
```

结果通常如下，

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

### 在插件里感知其他插件

可通过 `api.hasPlugins(pluginId[])` 和 `api.hasPresets(pluginId[])` 的方式感知其他插件，详见插件 API。

## 禁用插件

有两种方式可禁用插件，

### 配置 key 为 false

比如：

```js
export default {
  mock: false,
}
```

会禁用 Umi 内置的 mock 插件及其功能。

### 在插件里禁用其他插件

可通过 `api.skipPlugins(pluginId[])` 的方式禁用，详见插件 API。

## 配置插件

通过插件的 key 来配置插件，比如：

```js
export default {
  mock: { exclude: ['./foo'] }
}
```

这里的 mock 是 mock 插件的 key。

再比如我们安装一个插件 `umi-plugin-bar`，其 key 默认是 `bar`，就可以这么配置，

```js
export default {
  bar: { ...balabala },
}
```
