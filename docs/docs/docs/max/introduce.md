---
order: 1
toc: content
---
# Umi Max 简介

Umi 作为一个可扩展的企业级前端应用框架，在蚂蚁集团内部已经直接或间接地服务了 10000+ 应用。在工程实践的过程中，解决大量前端开发中开发中遇到的常见问题，这些经验累积成 Umi 各个插件。为了方便开发者更加方便的使用这些插件，在我们这些插件开源的基础上，直接将他们集成到一起，打造了 `@umijs/max`。 让开发者直接可以通过脚手架马上获得和蚂蚁集团开发 Umi 应用一样的开发体检。

## 如何使用

在使用 `create-umi` 选择 `Ant Design Pro` 模板，就能使用 `@umijs/max` 来创建项目了。

```bash {4}
$ npx create-umi@latest
? Pick Umi App Template › - Use arrow-keys. Return to submit.
    Simple App
❯   Ant Design Pro
    Vue Simple App
```

:::info{title=💡}
在 Umi Max 项目中命令行请使用 `max{:bash}`，而不是原来的 `umi{:bash}`，示例如下
:::

```bash /max/
$ npx max g jest
```

新建的项目默认安装以下插件, 可以按需开启：

- [权限](./access)
- [站点统计](./analytics)
- [Antd](./antd)
- [图表](./charts)
- [dva](./dva)
- [initial-state](./data-flow#全局初始状态)
- [数据流](./data-flow)
- [布局和菜单](./layout-menu)
- [国际化(多语言)](./i18n)
- [model](./data-flow)
- [乾坤微前端](./micro-frontend)
- [请求库](./request)
- [Tailwind CSS](./tailwindcss)
- [CSS-IN-JS](./styled-components)
- [请求方案](./react-query)
- [全局数据存储方案](./valtio)
- [Module Federation](./mf)
