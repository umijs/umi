---
order: 1
toc: content
translated_at: '2024-03-17T09:02:46.141Z'
---

# Umi Max Introduction

Umi, as an extensible enterprise-level front end application framework, has already served 10,000+ applications within Ant Group, either directly or indirectly. Throughout the process of engineering practice, it has solved numerous common problems encountered in front end development, and these experiences have been accumulated into various Umi plugins. In order to make it more convenient for developers to utilize these plugins, we have integrated them into `@umijs/max` based on their open-source foundation. This allows developers to immediately obtain the same development experience as developing Umi applications within Ant Group through a scaffold.

## How to use

By selecting the `Ant Design Pro` template when using `create-umi`, you can use `@umijs/max` to create a project.

```bash {4}
$ npx create-umi@latest
? Pick Umi App Template › - Use arrow-keys. Return to submit.
    Simple App
❯   Ant Design Pro
    Vue Simple App
```

:::info{title=💡}
In Umi Max projects, use the command line `max{:bash}` instead of the original `umi{:bash}`, as shown below.
:::

```bash /max/
$ npx max g jest
```

Newly created projects come with the following plugins installed by default, which can be enabled as needed:

- [Access Control](./access)
- [Site Analytics](./analytics)
- [Ant Design (Antd)](./antd)
- [Charts](./charts)
- [dva](./dva)
- [Initial State](./data-flow#global-initial-state)
- [Data Flow](./data-flow)
- [Layout and Menu](./layout-menu)
- [Internationalization (i18n)](./i18n)
- [model](./data-flow)
- [Qiankun Micro-frontends](./micro-frontend)
- [Request Library](./request)
- [Tailwind CSS](./tailwindcss)
- [CSS-IN-JS](./styled-components)
- [Request Strategy](./react-query)
- [Global Data Store Strategy](./valtio)
- [Module Federation](./mf)
