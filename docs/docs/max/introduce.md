import { Message } from 'umi'

# Introduction

As an extensible enterprise-level frontend application framework, Umi has directly or indirectly served over 10,000 applications within Ant Group. Through practical engineering, it addresses a multitude of common issues encountered in frontend development. These accumulated experiences have given rise to various Umi plugins. To facilitate developers in using these plugins more conveniently, we've integrated them together on the basis of open sourcing our plugins, resulting in `@umijs/max`. This allows developers to immediately obtain the same development experience as Ant Group when developing Umi applications.

## How to use

To create a project using `@umijs/max`, choose the `Ant Design Pro` template with the `create-umi` command.

```bash {4}
$ npx create-umi@latest
? Pick Umi App Template › - Use arrow-keys. Return to submit.
    Simple App
❯   Ant Design Pro
    Vue Simple App
```

<Message emoji="💡" >
In a Umi Max project, use `max{:bash}` in the command line instead of the original `umi{:bash}` command. An example is shown below.
</Message>

```bash /max/
$ npx max g jest
```

By default, newly created projects come with the following plugins installed, which can be selectively enabled:

- [Permissions](./access)
- [Site Analytics](./analytics)
- [Ant Design (Antd)](./antd)
- [Charts](./charts)
- [dva](./dva)
- [Initial State](./data-flow#global-initial-state)
- [Data Flow](./data-flow)
- [Layout and Menu](./layout-menu)
- [Internationalization (i18n)](./i18n)
- [model](./data-flow)
- [Qiankun Micro Frontends](./micro-frontend)
- [Request Library](./request)
- [Tailwind CSS](./tailwindcss)
- [CSS-IN-JS](./styled-components)
- [Request Strategies](./react-query)
- [Global Data Storage Solution](./valtio)
- [Module Federation](./mf)
