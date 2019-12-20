# @umijs/core/Service

## Changes

- 插件底层切换为 tapable
- 支持 presets
- 支持从 package.json 中直接读 plugin 和 preset
- 新增 `api.registerPresets` 和 `api.registerPlugins`，只在特殊的注册阶段可用
- [BREAK CHANGE] 删除 `api.registerPlugin`，改用 `api.registerPlugins`
- 新增 `api.describe({ id, key })`，可以声明自己的 id 和配置 key，来覆盖自动生成的 id 和 key
- [BREAK CHANGE] plugin 返回的 apply 方法需要执行一遍才会 require 插件文件，好处是可以 delay require
- [BREAK CHANGE] api.register 接受一个对象参数，包含 `{ key, fn, before, stage }`，之前是 `api.register(key, fn)` 的形式
