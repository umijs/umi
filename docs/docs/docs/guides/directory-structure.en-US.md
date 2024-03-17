---
order: 2
toc: content
translated_at: '2024-03-17T10:34:04.617Z'
---

# Directory Structure

This documents the directory structure conventionally (or recommended) in Umi projects. Please follow this directory structure to organize code during project development.

```bash
.
├── config
│   └── config.ts
├── dist
├── mock
│   └── app.ts｜tsx
├── src
│   ├── .umi
│   ├── .umi-production
│   ├── layouts
│   │   ├── BasicLayout.tsx
│   │   ├── index.less
│   ├── models
│   │   ├── global.ts
│   │   └── index.ts
│   ├── pages
│   │   ├── index.less
│   │   └── index.tsx
│   ├── utils // Recommended directory
│   │   └── index.ts
│   ├── services // Recommended directory
│   │   └── api.ts
│   ├── app.(ts|tsx)
│   ├── global.ts
│   ├── global.(css|less|sass|scss)
│   ├── overrides.(css|less|sass|scss)
│   ├── favicon.(ico|gif|png|jpg|jpeg|svg|avif|webp)
│   └── loading.(tsx|jsx)
├── node_modules
│   └── .cache
│       ├── bundler-webpack
│       ├── mfsu
│       └── mfsu-deps
├── .env
├── plugin.ts 
├── .umirc.ts // Choose between this and the config/config.ts file
├── package.json
├── tsconfig.json
└── typings.d.ts
```
## Root Directory

### package.json

Unlike Umi 3, Umi 4 does not automatically register plugins or presets beginning with `@umijs/preset-`, `@umijs/plugin-`, `umi-preset-`, and `umi-plugin-` in `package.json`. If you need to customize additional plugins/presets, you must manually configure them in [`plugins`](../api/config#plugins).

### .env

Environment variables, such as:

```text
PORT=8888
COMPRESS=none
```

### .umirc.ts

> Same function as the `config/config.ts` file, choose 1 out of 2. `.umirc.ts` file has a higher priority

Configuration file, includes all [non-runtime configurations](../api/config) in Umi (Runtime configurations are generally defined in [`app.ts`](#apptstsx)).

If you need to load different configurations in different environments, in Umi, this is achieved through [`UMI_ENV`](./env-variables#umi_env). An example of starting in a different environment:

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

> Same function as the `.umirc.ts` file, choose 1 out of 2. `.umirc.ts` file has a higher priority

Same as [`.umirc.ts`](#umircts), the difference is that you can consolidate all configurations in a separate `config` folder under the root directory to keep it neat.

### dist Directory

The default output folder for artifacts after executing `umi build`. You can modify the output folder through the [`outputPath`](../api/config#outputpath) configuration.

### mock Directory

Place for mock files. All `.ts` / `.js` files in this directory will be loaded by the mock service to provide simulated data. See [Mock](./mock) for usage details.

### public Directory

Stores fixed static resources. For example, by placing `public/image.png`, it can be accessed during development via `/image.png`, and will be copied to the output folder after building.

Note:

1. For svg resources, Umi supports [svgr](../api/config#svgr), which can be directly imported for use as a component:

  ```ts
  import SmileUrl, { ReactComponent as SvgSmile } from './smile.svg';
  // <SvgSmile />
  ```

2. For resources like images, Umi supports direct import to obtain the resource path:

  ```tsx
  import imgUrl from './image.png'
  // <img src={imgUrl} />>
  ```

### `src` Directory

#### .umi Directory

:::warning{title=🛎️}
**Do not commit `.umi` temporary files to the git repository, already ignored by default in `.gitignore`.**
:::

Temporary file directory during development, such as entry files, routes, etc., will be temporarily generated here.

#### .umi-production Directory

:::warning{title=🛎️}
**Do not commit `.umi-production` temporary files to the git repository, already ignored by default in `.gitignore`.**
:::

Temporary file directory during build, such as entry files, routes, etc., will be temporarily generated here.

#### app.[ts|tsx]

[Runtime configuration](../api/runtime-config) file, where you can extend runtime capabilities, such as modifying routes, modifying the render method, etc.

The logic brought by runtime configuration runs in the browser. Therefore, when there are remote configurations, dynamic content, etc., which are not certain during local development and cannot be hardcoded, it is necessary to dynamically obtain them when the project is actually run in the browser.

#### layouts/index.tsx

Global layout, will be effective under all routes by default. For example, with the following route relationship:

```
[
  { path: '/', component: '@/pages/index' },
  { path: '/users', component: '@/pages/users' },
]
```

The output will be:

```jsx
<Layout>
  <Page>index</Page>
  <Page>users</Page>
</Layout>
```

When you need to turn off layout, you can use `layout: false`. When you need more layers of layout, consider using [`wrappers`](./routes#wrappers), only available in configuration routes:

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

#### pages Directory

Conventionally, the route table is generated based on the file hierarchy structure of the `pages/*` folder for convention-based routing.

In configuration-based routing, if `component` is written as a relative path, it will start looking for files from this folder:

```ts
  routes: [
    // `./index` === `@/pages/index`
    { path: '/', component: './index' }
  ]
```

##### Basic Routes

Assuming the `pages` directory structure is as follows:

```
+ pages/
  + users/
    - index.tsx
  - index.tsx
```

Then, the automatically generated routing configuration would be as follows:

```ts
[
  { path: '/', component: '@/pages/index.tsx' },
  { path: '/users/', component: '@/pages/users/index.tsx' },
]
```

##### Dynamic Routes

Directories or files prefixed with `$` are considered dynamic routes. If no parameter name is specified after `$`, it represents `*` wildcard. For example, with the following directory structure:

```
+ pages/
  + foo/
    - $slug.tsx
  + $bar/
    - $.tsx
  - index.tsx
```

The generated routing configuration would be as follows:

```ts
[
  { path: '/', component: '@/pages/index.tsx' },
  { path: '/foo/:slug', component: '@/pages/foo/$slug.tsx' },
  { path: '/:bar/*', component: '@/pages/$bar/$.tsx' },
]
```

##### pages/404.tsx

In convention-based routing, this file will automatically be registered as the global fallback page for 404. If you are using configuration-based routing, you need to manually configure the catchall route at the end of the route table:

```ts
  routes: [
    // other routes ...
    { path: '/*', component: '@/pages/404.tsx' }
  ]
```

#### global.(j|t)sx?

Global pre-script file.

Unlike other front-end frameworks, Umi does not have an explicit main application entry (like `src/index.ts`). So when you have logic that needs to run globally or at the application front-end, consider including it in `global.ts`.

When you need to add a global Context or modify application runtime, please use [`app.tsx`](#apptstsx).

#### global.(css|less|sass|scss)

Global style file.

When you need to use styles globally, consider adding them to this file.

:::info{title=💡}
Note that the priority of this file is after the styles of third-party component libraries. So, when you need to override the styles of a third-party library, please use [`overrides.css`](#overridescsslesssassscss).
:::

#### overrides.(css|less|sass|scss)

High-priority global style file.

This file is generally dedicated for overriding third-party library styles, where all CSS selectors will be prefixed with `body` to lift the priority.

#### loading.(tsx|jsx)

Global loading component.

Umi 4 defaults to [code splitting by page](../../blog/code-splitting), so there is a loading process during page switching. Configure loading animations through this file.

### plugin.ts 

Project-level Umi plugin.

When you have Umi customization needs, you often use [plugin API](../api/plugin-api) (such as [modifying product html](../api/plugin-api#modifyhtml)). In this case, you can create this file for customization:

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

Site `favicon` icon file.

When a `src/favicon.(ico|gif|png|jpg|jpeg|svg|avif|webp)` file exists, it will automatically add the site `favicon` to the output:

```html
<link rel="shortcut icon" href="/favicon.png">
```

If using external resources, etc., you can manually configure the site icon with [favicons](../api/config#favicons). Configuration value takes precedence over convention.
