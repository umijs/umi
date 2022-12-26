# 目录结构

这里罗列了 Umi 项目中约定(或推荐)的目录结构，在项目开发中，请遵照这个目录结构组织代码。

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
│   ├── app.ts
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
│   ├── global.ts
│   ├── global.(css|less|sass|scss)
│   ├── overrides.(css|less|sass|scss)
│   ├── favicon.(ico|gif|png|jpg|jpeg|svg|avif|webp)
│   └── loading.tsx
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

包含插件和插件集，以 `@umijs/preset-`、`@umijs/plugin-`、`umi-preset-` 和 `umi-plugin-` 开头的依赖会被自动注册为插件或插件集。

### .env

环境变量，比如：
```text
PORT=8888
COMPRESS=none
```

### .umirc.ts

> 与 `config/config.ts` 文件功能相同，2 选 1 。`.umirc.ts` 文件优先级较高

配置文件，包含 Umi 内置功能和插件的配置。

配置文件的优先级见：[UMI_ENV](./env-variables#umi_env)

### config/config.ts

> 与 `.umirc.ts` 文件功能相同，2 选 1 。`.umirc.ts` 文件优先级较高

配置文件，包含 Umi 内置功能和插件的配置。

### dist 目录

执行 `umi build` 后，产物默认会存放在这里。可通过配置修改产物输出路径。

### mock 目录

存储 mock 文件，此目录下所有 `js` 和 `ts` 文件会被解析为 mock 文件。用于本地的模拟数据服务。

### public 目录

此目录下所有文件会被 copy 到输出路径。

### `src` 目录

#### .umi 目录

dev 时的临时文件目录，比如入口文件、路由等，都会被临时生成到这里。**不要提交 .umi 目录到 git 仓库，他们会在 `umi dev` 时被删除并重新生成。**

#### .umi-production 目录

build 时的临时文件目录，比如入口文件、路由等，都会被临时生成到这里。**不要提交 .umi-production 目录到 git 仓库，他们会在 `umi build` 时被删除并重新生成。**

#### app.[ts｜tsx]

运行时配置文件，可以在这里扩展运行时的能力，比如修改路由、修改 render 方法等。运行时配置是跑在浏览器端，因此我们可以在这里写函数、jsx 语法，import 浏览器端依赖等等。

#### layouts/index.tsx

约定式路由时的全局布局文件，实际上是在路由外面套了一层。比如，你的路由是：

```
[
  { path: '/', component: './pages/index' },
  { path: '/users', component: './pages/users' },
]
```

从组件角度可以简单的理解为如下关系：

```jsx
<layout>
  <page>1</page>
  <page>2</page>
</layout>
```

#### pages 目录

所有路由组件存放在这里。使用约定式路由时，约定 `pages` 下所有的 `(j|t)sx?` 文件即路由。使用约定式路由，意味着不需要维护，可怕的路由配置文件。最常用的有基础路由和动态路由（用于详情页等，需要从 url 取参数的情况）

##### 基础路由

假设 `pages` 目录结构如下：

```
+ pages/
  + users/
    - index.js
  - index.js
```

那么，会自动生成路由配置如下：

```javascript
[
  { path: '/', component: './pages/index.js' },
  { path: '/users/', component: './pages/users/index.js' },
];
```

##### 动态路由

约定，带 `$` 前缀的目录或文件为动态路由。若 `$` 后不指定参数名，则代表 `*` 通配，比如以下目录结构：

```
+ pages/
  + foo/
    - $slug.js
  + $bar/
    - $.js
  - index.js
```

会生成路由配置如下：

```javascript
[
  { path: '/', component: './pages/index.js' },
  { path: '/foo/:slug', component: './pages/foo/$slug.js' },
  { path: '/:bar/*', component: './pages/$bar/$.js' },
];
```

##### ./src/pages/404.js

当访问的路由地址不存在时，会自动显示 404 页面。只有 build 之后生效。调试的时候可以访问 `/404` 。

#### global.(j|t)sx?

在入口文件最前面被自动引入，可以考虑在此加入 polyfill。Umi 区别于其他前端框架，没有显式的程序主入口，如 `src/index.js`，所以在引用某些模块的时候，如果模块功能要求在程序主入口添加代码时，你就可以写到这个文件。

#### global.(css|less|sass|scss)

这个文件不走 css modules，自动被引入，可以写一些全局样式，它的引入位置很靠前，所以优先级相对较低；如果想覆盖三方依赖样式，推荐使用 `overrides.(css|less|sass|scss)`。

#### overrides.(css|less|sass|scss)

这个文件不走 css modules，自动被引入，专用于覆盖三方依赖的样式；该文件中所有的 CSS 选择器都会被自动加上 `body` 前缀以确保优先级始终高于原有选择器，这样一来在页面切换时有异步 chunk 动态插入的情况下样式覆盖也能生效。

#### loading.(tsx|jsx)

定义懒加载过程中要显示的加载动画。Umi 4 默认按页拆包，所以这近似等价于 Umi 3 中的 `dynamicImport.loading` 选项。

### plugin.ts 

存在这个文件，会被当前项目加载为 Umi 插件，你可以在这里实现一些插件级的功能。

```ts
import type { IApi } from 'umi';

export default (api: IApi) => {
  api.onDevCompileDone((opts) => {
    opts;
    // console.log('> onDevCompileDone', opts.isFirstCompile);
  });
  api.onBuildComplete((opts) => {
    opts;
    // console.log('> onBuildComplete', opts.isFirstCompile);
  });
  api.chainWebpack((memo) => {
    memo;
  });
};

```

### favicon

约定如果存在 `src/favicon.(ico|gif|png|jpg|jpeg|svg|avif|webp)` 文件，将会使用它作为构建网页的 `shortcut icon`，如存在 `src/favicon.png` 则构建时会生成： 

```html
<link rel="shortcut icon" href="/favicon.png">
```

支持多种文件后缀，按以下优先级匹配：

```js
const FAVICON_FILES = [
  'favicon.ico',
  'favicon.gif',
  'favicon.png',
  'favicon.jpg',
  'favicon.jpeg',
  'favicon.svg',
  'favicon.avif',
  'favicon.webp',
];
```

如果约定方式不满足你的需求，可以使用 [favicons](../api/config#favicons) 配置。

> 配置优先级会大于约定
