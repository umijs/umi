---
order: 4
toc: content
---

# 插件

## 使用插件

在普通的 Umi 应用中，默认 **不附带任何插件** ，如需使用 Max 的功能（如 数据流、antd 等），需要手动安装插件并开启他们：

```bash
  pnpm add -D @umijs/plugins
```

如开启 antd 插件：

```ts
// .umirc.ts
export default {
  plugins: ['@umijs/plugins/dist/antd'],
  antd: {}
}
```

Umi 与 Max 的区别是 Max 已经内置了大部分插件，如 数据流（ `initial-state` 、 `model` ）、`antd` 等，这些插件都可以在 <a href="https://github.com/umijs/umi/tree/master/packages/plugins/src" target='_blank'>`@umijs/plugins/dist/*`</a> 加载并且开启。

如需进一步了解 Max 具备的功能和配置说明，请参阅 [Umi Max](../max/introduce) 章节。


:::info{title=💡}
**我是否应该选择 Max ？** <br/>
使用 Max 并不代表需要使用全部 Max 的功能，可以根据需求关闭插件，所以当你需要使用 Max 的功能时，可以总是选择创建 Max 项目。
:::

## 项目级插件

若你想在项目中快速使用插件的功能（如 [修改产物的 html](../introduce/faq#documentejs-去哪了如何自定义-html-模板) ），可以在项目的根目录创建 `plugin.ts` 编写一个项目级插件，该文件将被自动作为插件加载。

有关更详细的目录结构说明请参阅 [目录结构](./directory-structure) 章节。

## 开发插件

请参阅 [开发插件](./plugins) 章节。




