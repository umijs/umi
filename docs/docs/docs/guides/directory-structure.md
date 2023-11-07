---
order: 2
toc: content
---
# 目录结构

这里罗列了 Umi 项目中约定（或推荐）的目录结构，在项目开发中，请遵照这个目录结构组织代码。

```bash
.
├── config
│   └── config.ts
├── dist
├── mock
│   └── app.ts｜tsx
├── src
│   ├── .umi
│   ├── .umi-production
│   ├── layouts
│   │   ├── BasicLayout.tsx
│   │   ├── index.less
│   ├── models
│   │   ├── global.ts
│   │   └── index.ts
│   ├── pages
│   │   ├── index.less
│   │   └── index.tsx
│   ├── utils // 推荐目录
│   │   └── index.ts
│   ├── services // 推荐目录
│   │   └── api.ts
│   ├── app.(ts|tsx)
│   ├── global.ts
│   ├── global.(css|less|sass|scss)
│   ├── overrides.(css|less|sass|scss)
│   ├── favicon.(ico|gif|png|jpg|jpeg|svg|avif|webp)
│   └── loading.(tsx|jsx)
├── node_modules
│   └── .cache
│       ├── bundler-webpack
│       ├── mfsu
│       └── mfsu-deps
├── .env
├── plugin.ts 
├── .umirc.ts // 与 config/config 文件 2 选一
├── package.json
├── tsconfig.json
└── typings.d.ts
```
## 根目录

### package.json

与 Umi 3 不同，Umi 4 不会自动注册 `package.json` 中以 `@umijs/preset-`、`@umijs/plugin-`、`umi-preset-` 和 `umi-plugin-` 开头的插件、预设，若你需要自定义额外的插件、预设，需要手动配置到 [`plugins`](../api/config#plugins) 。

### .env

环境变量，比如：

```text
PORT=8888
COMPRESS=none
```

### .umirc.ts

> 与 `config/config.ts` 文件功能相同，2 选 1 。`.umirc.ts` 文件优先级较高

配置文件，包含 Umi 所有[非运行时配置](../api/config)（运行时配置一般定义于 [`app.ts`](#apptstsx)）。

若你需要在不同环境中加载不同配置，这在 Umi 中是根据 [`UMI_ENV`](./env-variables#umi_env) 来实现的，一个不同环境启动的例子：

```ts
// package.json
{
  "scripts": {
    "dev": "umi dev",
    "dev:pre": "cross-env UMI_ENV=pre umi dev"
  }
}
```

### config/config.ts

> 与 `.umirc.ts` 文件功能相同，2 选 1 。`.umirc.ts` 文件优先级较高

与 [`.umirc.ts`](#umircts) 相同，区别是你可以单独在一个 `config` 文件夹下集中管理所有的配置，保持项目根目录整洁。

### dist 目录

执行 `umi build` 后产物的默认输出文件夹。可通过 [`outputPath`](../api/config#outputpath) 配置修改产物输出文件夹。

### mock 目录

存放 mock 文件，此目录下所有 `.ts` / `.js` 文件会被 mock 服务加载，从而提供模拟数据，使用方法详见 [Mock](./mock) 。

### public 目录

存放固定的静态资源，如存放 `public/image.png` ，则开发时可以通过 `/image.png` 访问到，构建后会被拷贝到输出文件夹。

注：

1. 对于 svg 资源，Umi 支持 [svgr](../api/config#svgr) ，可以直接导入作为组件使用：

  ```ts
  import SmileUrl, { ReactComponent as SvgSmile } from './smile.svg';
  // <SvgSmile />
  ```

2. 对于图片等资源，Umi 支持直接导入获取资源路径：

  ```tsx
  import imgUrl from './image.png'
  // <img src={imgUrl} />>
  ```

### `src` 目录

#### .umi 目录

:::warning{title=🛎️}
**不要提交 `.umi` 临时文件到 git 仓库，默认已在 `.gitignore` 被忽略。**
:::

dev 时的临时文件目录，比如入口文件、路由等，都会被临时生成到这里。

#### .umi-production 目录

:::warning{title=🛎️}
**不要提交 `.umi-production` 临时文件到 git 仓库，默认已在 `.gitignore` 被忽略。**
:::

build 时的临时文件目录，比如入口文件、路由等，都会被临时生成到这里。

#### app.[ts｜tsx]

[运行时配置](../api/runtime-config) 文件，可以在这里扩展运行时的能力，比如修改路由、修改 render 方法等。

运行时配置带来的逻辑会在浏览器中运行，因此当有远程配置、动态内容时，这些我们在本地开发时还不确定，不能写死，所以需要在浏览器实际运行项目时动态获取他们。

#### layouts/index.tsx

全局布局，默认会在所有路由下生效，比如有以下路由关系：

```
[
  { path: '/', component: '@/pages/index' },
  { path: '/users', component: '@/pages/users' },
]
```

输出为：

```jsx
<Layout>
  <Page>index</Page>
  <Page>users</Page>
</Layout>
```

当你需要关闭 layout 时可以使用 `layout: false` ，当你需要更多层 layout 时，可以考虑使用 [`wrappers`](./routes#wrappers) ，仅在配置式路由可用：

```ts
  routes: [
    { path: '/', component: './index', layout: false },
    { 
      path: '/users', 
      component: './users', 
      wrappers: ['@/wrappers/auth']
    }
  ]
```

#### pages 目录

约定式路由默认以 `pages/*` 文件夹的文件层级结构来生成路由表。

在配置式路由中，`component` 若写为相对路径，将从该文件夹为起点开始寻找文件：

```ts
  routes: [
    // `./index` === `@/pages/index`
    { path: '/', component: './index' }
  ]
```

##### 基础路由

假设 `pages` 目录结构如下：

```
+ pages/
  + users/
    - index.tsx
  - index.tsx
```

那么，会自动生成路由配置如下：

```ts
[
  { path: '/', component: '@/pages/index.tsx' },
  { path: '/users/', component: '@/pages/users/index.tsx' },
]
```

##### 动态路由

约定带 `$` 前缀的目录或文件为动态路由。若 `$` 后不指定参数名，则代表 `*` 通配，比如以下目录结构：

```
+ pages/
  + foo/
    - $slug.tsx
  + $bar/
    - $.tsx
  - index.tsx
```

会生成路由配置如下：

```ts
[
  { path: '/', component: '@/pages/index.tsx' },
  { path: '/foo/:slug', component: '@/pages/foo/$slug.tsx' },
  { path: '/:bar/*', component: '@/pages/$bar/$.tsx' },
]
```

##### pages/404.tsx

在使用约定式路由时，该文件会自动被注册为全局 404 的 fallback 页面。若你使用配置式路由，需要自行配置兜底路由到路由表最后一个：

```ts
  routes: [
    // other routes ...
    { path: '/*', component: '@/pages/404.tsx' }
  ]
```

#### global.(j|t)sx?

全局前置脚本文件。

Umi 区别于其他前端框架，没有显式的程序主入口（如 `src/index.ts`），所以当你有需要在应用前置、全局运行的逻辑时，优先考虑写入 `global.ts` 。

当你需要添加全局 Context 、修改应用运行时，请使用 [`app.tsx`](#apptstsx) 。

#### global.(css|less|sass|scss)

全局样式文件。

当你有需要全局使用的样式时，请考虑加入此文件。

:::info{title=💡}
需要注意的是，此文件的优先级在第三方组件库的样式之后，所以当你有覆盖第三方库样式的需求时，请使用 [`overrides.css`](#overridescsslesssassscss) 。
:::

#### overrides.(css|less|sass|scss)

高优先级全局样式文件。

该文件一般专用于覆盖第三方库样式，其中所有 CSS 选择器都会附加 `body` 前缀以抬高优先级。

#### loading.(tsx|jsx)

全局加载组件。

Umi 4 默认 [按页分包](../../blog/code-splitting) ，从而在页面切换时存在加载过程，通过该文件来配置加载动画。

### plugin.ts 

项目级 Umi 插件。

当你有 Umi 定制需求时，往往会用到 [插件 API](../api/plugin-api) （比如 [修改产物 html](../api/plugin-api#modifyhtml)），此时可创建该文件进行自定义：

```ts
import type { IApi } from 'umi';

export default (api: IApi) => {
  api.onDevCompileDone((opts) => {
    opts;
    // console.log('> onDevCompileDone', opts.isFirstCompile);
  });
  api.modifyHTML(($) => {
    $;
  });
  api.chainWebpack((memo) => {
    memo;
  });
};

```

### favicon

站点 `favicon` 图标文件。

当存在 `src/favicon.(ico|gif|png|jpg|jpeg|svg|avif|webp)` 文件时，将会自动在产物中添加站点 `favicon` ：

```html
<link rel="shortcut icon" href="/favicon.png">
```

若使用外部资源等，可以使用 [favicons](../api/config#favicons) 手动配置站点图标，配置值优先于约定。
