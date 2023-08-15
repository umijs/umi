import { Message } from 'umi';

# Directory Structure

Here is the directory structure convention (or recommendation) for Umi projects. When developing a project, organize your code following this directory structure.

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
│   └── .cache
│       ├── bundler-webpack
│       ├── mfsu
│       └── mfsu-deps
├── .env
├── plugin.ts 
├── .umirc.ts // Choose either .umirc.ts or config/config.ts
├── package.json
├── tsconfig.json
└── typings.d.ts
```

## Root Directory

### package.json

Unlike Umi 3, Umi 4 doesn't automatically register plugins and presets that start with `@umijs/preset-`, `@umijs/plugin-`, `umi-preset-`, and `umi-plugin-` from the `package.json`. If you want to use custom plugins or presets, you need to manually configure them in the [`plugins`](../api/config#plugins) section.

### .env

Environment variables, for example:

```text
PORT=8888
COMPRESS=none
```

### .umirc.ts

> Same functionality as `config/config.ts`, choose either one. `.umirc.ts` has higher priority.

Configuration file containing all of Umi's [non-runtime configurations](../api/config) (runtime configurations are usually defined in [`app.ts`](#apptstsx)).

If you need to load different configurations in different environments, you can achieve this in Umi by using the [`UMI_ENV`](./env-variables#umi_env) variable. Here's an example of starting different environments:

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

> Same functionality as `.umirc.ts`, but you can centralize all configurations in a `config` folder to keep the root directory clean.

### dist Directory

The default output folder for artifacts generated after running `umi build`. You can modify the output folder using [`outputPath`](../api/config#outputpath) configuration.

### mock Directory

This directory is used to store mock files. All `.ts` / `.js` files in this directory will be loaded by the mock service to provide mock data. Learn more about usage in [Mock](./mock).

### public Directory

This directory is used to store fixed static resources. For instance, if you have a file named `public/image.png`, you can access it as `/image.png` during development. After building, it will be copied to the output folder.

Note:

1. For SVG resources, Umi supports [svgr](../api/config#svgr) and you can directly import SVG files as components:

  ```ts
  import SmileUrl, { ReactComponent as SvgSmile } from './smile.svg';
  // <SvgSmile />
  ```

2. For other image resources, you can import them directly and get the resource path:

  ```tsx
  import imgUrl from './image.png'
  // <img src={imgUrl} />
  ```

### `src` Directory

#### .umi Directory

<Message type='warning'>
**Do not commit `.umi` temporary files to the git repository. They are ignored by default in `.gitignore`.**
</Message>

This is the temporary files directory during development. It contains temporary files such as entry files and routes.

#### .umi-production Directory

<Message type='warning'>
**Do not commit `.umi-production` temporary files to the git repository. They are ignored by default in `.gitignore`.**
</Message>

This is the temporary files directory during building. It contains temporary files such as entry files and routes.

#### app.[ts｜tsx]

[Runtime configuration](../api/runtime-config) file. You can extend the runtime capabilities here, such as modifying routes, modifying the render method, etc.

The logic introduced by the runtime configuration will run in the browser. Therefore, when you have remote configuration or dynamic content that cannot be hard-coded during local development, you need to dynamically obtain them when the project is actually running in the browser.

#### layouts/index.tsx

Global layout. It is applied to all routes by default. For example, consider the following route configuration:

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

You can disable the layout using `layout: false`. If you need nested layouts, you can consider using [`wrappers`](./routes#wrappers), which is only available for configuration-based routes:

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

Conventional routes are generated based on the file hierarchy within the `pages/*` folder.

In configuration-based routing, if `component` is written as a relative path, it will start looking for files from this directory:

```ts
  routes: [
    // `./index` === `@/pages/index`
    { path: '/', component: './index' }
  ]
```

##### Basic Routing

Assuming the directory structure of `pages` is as follows:

```
+ pages/
  + users/
    - index.tsx
  - index.tsx
```

The generated route configuration will be:

```ts
[
  { path: '/', component: '@/pages/index.tsx' },
  { path: '/users/', component: '@/pages/users/index.tsx' },
]
```

##### Dynamic Routing

Directories or files prefixed with `$` are considered dynamic routes. If no parameter name is specified after `$`, it represents the `*` wildcard. For example, consider the following directory structure:

```
+ pages/
  + foo/
    - $slug.tsx
  + $bar/
    - $.tsx
  - index.tsx
```

The generated route configuration will be:

```
[
  { path: '/', component: '@/pages/index.tsx' },
  { path: '/foo/:slug', component: '@/pages/foo/$slug.tsx' },
  { path: '/:bar/*', component: '@/pages/$bar/$.tsx' },
]
```

##### pages/404.tsx

In conventional routing, this file is automatically registered as the global fallback page for 404 errors. If you use configuration-based routing, you need to manually configure a catch-all route to this file as the last route in the route configuration:

```ts
  routes: [
    // other routes ...
    { path: '/*', component: '@/pages/404.tsx' }
  ]
```

#### global.(j|t)sx?

Global pre-script file.

Unlike other frontend frameworks, Umi doesn't have an explicit main entry point (like `src/index.ts`). When you need logic to run globally or before the application starts, consider adding it to `global.ts`.

If you need to add global context or modify the application runtime, use [`app.tsx`](#apptstsx).

#### global.(css|less|sass|scss)

Global style file.

When you need styles to be applied globally, consider adding them to this file.

<Message>
Note that this file has a lower priority than third-party component library styles. So, if you need to override styles from a third-party library, use [`overrides.css`](#overridescsslesssassscss).
</Message>

#### overrides.(css|less|sass|scss)

High-priority global style file.

This file is typically used to override third-party library styles. All CSS selectors in this file are prefixed with `body` to increase their specificity.

#### loading.(tsx|jsx)

Global loading component.

Umi 4 defaults to [page-based splitting](../../blog/code-splitting), which introduces a loading process when switching pages. Use this file to configure loading animations.

### plugin.ts 

Project-level Umi plugins.

When you have custom requirements for Umi, you'll often need to use [plugin APIs](../api/plugin-api) (e.g., [modify HTML output](../api/plugin-api#modifyhtml)). You can create this file for customization:

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

When the `src/favicon.(ico|gif|png|jpg|jpeg|svg|avif|webp)` file exists, it will automatically add a `favicon` link to the produced HTML:

```html
<link rel="shortcut icon" href="/favicon.png">
```

If you use external resources, you can manually configure the site icon using [favicons](../api/config#favicons), and the configured value takes precedence over conventions.