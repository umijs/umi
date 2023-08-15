import { Message } from 'umi';

# Plugins

## Using Plugins

In a standard Umi application, **no plugins are included by default**. To utilize Max's features (such as data flow, antd, etc.), you need to manually install and enable plugins:

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

The difference between Umi and Max is that Max already includes most plugins by default, such as data flow (`initial-state`, `model`), `antd`, etc. These plugins can be loaded and enabled from <a href="https://github.com/umijs/umi/tree/master/packages/plugins/src" target='_blank'>`@umijs/plugins/dist/*`</a>.

For further understanding of the functionalities and configuration details of Max, please refer to the [Umi Max](../max/introduce) section.

<Message>
**Should I choose Max?** <br/>
Using Max doesn't mean you have to utilize all of its features. You can choose to disable plugins based on your needs. So, when you want to use Max's features, you can always choose to create a Max project.
</Message>

## Project-Level Plugins

If you want to quickly use plugin features within your project (e.g., [modifying the generated HTML](../introduce/faq#documentejs-where-is-it-how-do-i-customize-the-html-template)), you can create a `plugin.ts` file in the root directory of your project to write a project-level plugin. This file will be automatically loaded as a plugin.

For more detailed information about directory structure, please refer to the [Directory Structure](./directory-structure) section.

## Developing Plugins

Please refer to the [Developing Plugins](./plugins) section.
