---
order: 4
toc: content
translated_at: '2024-03-17T09:58:19.770Z'
---

# Plugins

## Using Plugins

In a standard Umi application, by default, **no plugins are included**. If you want to use Max's features (such as data flow, antd, etc.), you will need to manually install the plugins and enable them:

```bash
  pnpm add -D @umijs/plugins
```

To enable the antd plugin:

```ts
// .umirc.ts
export default {
  plugins: ['@umijs/plugins/dist/antd'],
  antd: {}
}
```

The difference between Umi and Max is that Max already has most plugins built-in, such as data flow (`initial-state`, `model`), `antd`, etc. These plugins can be loaded and enabled from <a href="https://github.com/umijs/umi/tree/master/packages/plugins/src" target='_blank'>`@umijs/plugins/dist/*`</a>.

For further information about the features and configuration instructions offered by Max, please refer to the [Umi Max](../max/introduce) section.


:::info{title=💡}
**Should I choose Max?** <br/>
Using Max does not mean you have to use all of its features; you can disable plugins according to your needs. So, when you need Max's features, you can always choose to create a Max project.
:::

## Project-level Plugins

If you want to quickly use the functionality of plugins in your project (such as [modifying the output html](../introduce/faq#documentejs-where-did-it-got-how-to-customize-the-html-template)), you can create a `plugin.ts` in the project's root directory to write a project-level plugin, which will be automatically loaded as a plugin.

For a more detailed explanation of the directory structure, please refer to the [Directory Structure](./directory-structure) section.

## Developing Plugins

Please refer to the [Developing Plugins](./plugins) section.

