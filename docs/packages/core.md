# @umijs/core/Service

## Service & Plugins

- hook 执行的部分切换为 [tapable](https://github.com/webpack/tapable)，支持通过 `before` 和 `step` 调整顺序
- 支持 presets
- 支持从 package.json 中直接读 plugin 和 preset
- 新增 `api.registerPresets` 和 `api.registerPlugins`，只在特殊的注册阶段可用
- [BREAK CHANGE] 删除 `api.registerPlugin`，改用 `api.registerPlugins`
- 新增 `api.describe({ id, key })`，可以声明自己的 id 和配置 key，来覆盖自动生成的 id 和 key
- [BREAK CHANGE] plugin 返回的 apply 方法需要执行一遍才会 require 插件文件，好处是可以 delay require
- [BREAK CHANGE] api.register 接受一个对象参数，包含 `{ key, fn, before, stage }`，之前是 `api.register(key, fn)` 的形式
- [BREAK CHANGE] applyPlugins 异步化，同时支持同步和 Promise 返回
- 新增 `api.skipPlugins(pluginIds: string[])`，用于禁用插件
- 配置项的值为 `false` 时，相关插件也会禁用
- 插件注册阶段只能拿到 userConfig，而不能拿到 config（config 是 merge 了 defaultConfig 之后的）
- `api.paths` 等插件注册结束后才 ready，paths 中仅保留 `cwd`, `absNodeModulesPath`, `absSrcPath`, `absOutputPath` 和 `absTmpPath`
- `absTmpPath` 从 `src/pages/.umi` 调整到 `src/.umi`，因为有些应用场景没有 pages 目录，比如 father-doc
- `api.writeTmpFile` 只能在 `api.onGenerateFiles` 中使用
- 删除 `api.modifyEntryRender` 接口
- [BREAK CHANGE] html API 改为复数， `api.addHTMLStyles`、`api.addHTMLHeadScripts`、`api.addHTMLScripts`、`api.addHTMLMetas`、`api.addHTMLLinks`

## Config

- schema 和校验基于 `@hapi/joi`
- 自动 resolve 配置文件的依赖并做 babel register，`/config` 目录以外的文件也可以用 es6 写并直接 import
