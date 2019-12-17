# @umijs/core/Service

## Changes

- 插件底层切换为 tapable
- 支持 presets
- 支持从 package.json 中直接读 plugin 和 preset
- 新增 api.registerPresets 和 api.registerPlugins，只在特殊的注册阶段可用
- [BREAK CHANGE] 删除 api.registerPlugin，改用 api.registerPlugins
