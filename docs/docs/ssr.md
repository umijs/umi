---
translateHelp: true
---

# Server rendering (SSR)


## What is server-side rendering?

> First, we first understand and whether it is in line with our business scenario, and then decide whether to use it.

Server-Side Rendering refers to the page processing technology where the HTML structure of the page is spliced ​​on the **server side**, sent to the browser, and then bound to the state and events to become a fully interactive page process.

This may be more academic, but it will be easier to make it clear through two pictures.

The first is the difference between a single-page application (SPA) and a server-side rendered (SSR) site in **social sharing**:

<img style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" src="https://user-images.githubusercontent.com/13595509/68102160-5e66da00-ff0c-11e9-82e8-7c73cca1b20f.png" width="600" />


In the second picture, there is less SSR on the **white screen time** because when the HTML document returns, there is already corresponding content. (See Network)

<img style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" src="https://user-images.githubusercontent.com/13595509/80308316-e74a3880-8800-11ea-9a20-2d9d153fe9d1.png" />

Based on the above two figures, SSR is often used in the following two scenarios:

1. There are **SEO requirements**, used in search engine retrieval and social sharing, used in front-end applications.
1. **First screen rendering** time is required, usually in mobile terminal and weak network conditions.

> In other words, if you are a mid-to-back-end application (such as antd pro, back-end management, etc.), please carefully consider whether to use SSR.

## What is pre-rendering?

Server-side rendering requires a back-end server (usually Node.js) before it can be used. If I don't have a back-end server and want to use the two scenarios mentioned above, then **pre-rendering** is recommended.

The only difference between pre-rendering and server-side rendering is **rendering timing**, the timing of server-side rendering is to perform rendering when the user visits (ie **real-time rendering**, the data is generally the latest), and the timing of pre-rendering When the project is built, when the user accesses it, the data is not necessarily the latest (if the data is not real-time, you can directly consider pre-rendering).

Pre Render performs rendering during construction and generates static HTML files from rendered HTML fragments. No need to use web server to dynamically compile HTML in real time, suitable for **static site generation**.

## Umi server rendering features

> As early as the Umi 2.8+ version, Umi already has SSR capabilities, but for novices, the threshold is higher.

Umi 3 combines its own business scenarios to do a lot of optimization and development experience improvement on SSR, with the following features:

-**Out of the box**: Built-in SSR, one key to open, ʻumi dev` is SSR preview, convenient for development and debugging. 
-**Server-side framework independent**: Umi does not couple server-side frameworks (for example, [Egg.js](https://eggjs.org/), [Express](https://expressjs.com/), [Koa ](https://koajs.com/)), no matter which framework or serverless mode, it can be integrated very easily.
-**Support application and page-level data pre-acquisition**: Umi 3 continues the page data pre-acquisition (getInitialProps) in Umi 2 to solve the previous global data acquisition problem.
-**Support on-demand loading**: On-demand loading of `dynamicImport` is enabled, Umi 3 will load the corresponding resource files (css/js) according to different routes.
-**Built-in pre-rendering function**: Umi 3 has a built-in pre-rendering function, which is no longer used by installing additional plug-ins. At the same time, enable `ssr` and ʻexportStatic`, and the rendered image will be compiled when ʻumi build` is built. HTML.
-**Support rendering degradation**: SSR is preferred. If server-side rendering fails, it will be automatically downgraded to client-side rendering (CSR) without affecting normal business processes.
-**Support streaming rendering**: `ssr: {mode:'stream' }` to enable streaming rendering, streaming SSR has less [TTFB](https://baike.baidu. com/item/TTFB) (the number of milliseconds it takes from sending a page request to receiving the first byte of the response data) time.
-**Compatible with client dynamic loading**: Using SSR and dynamicImport (dynamic loading) at the same time in Umi 2 will cause some problems, and Umi 3 can be used at the same time.
-**SSR function plug-in**: The built-in SSR function of Umi 3 is basically sufficient. If you do not meet your needs or want to customize the rendering method, you can customize it through the provided API.

## Enable server-side rendering

By default, the server-side rendering function is disabled, you need to enable it through configuration before using:

```js
export default {
  ssr: {},
}
```

## 开发

执行 `umi dev`，访问页面，即是服务端渲染后的。

<img style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" src="https://user-images.githubusercontent.com/13595509/80309380-4743dd80-8807-11ea-9def-7bb43522dce3.png" width="600" />

> [如何判断当前页面是 SSR 还是 CSR？](#如何判断当前页面是-ssr-还是-csr？)

如果与后端框架在开发模式下一起使用时，可通过配置来关闭 `umi dev` 下的服务端渲染行为：

```js

export default {
  ssr: {
    // 默认为 true
    devServerRender: false,
  },
}
```

## 数据预获取

服务端渲染的数据获取方式与 SPA（单页应用）有所不同，为了让客户端和服务端都能获取到同一份数据，我们提供了 页面级数据 预获取。

<!-- ### 应用级数据获取

提供 `getInitialData` 用来获取全局数据，透传到每个页面的 props 中，让所有页面都能共享消费这份数据：

```js
// app.(ts|js)
export const ssr = {
  getInitialData: async () => {
    return {
      layout: {
        name: 'Layout',
        data: [{ name: 'hello', id: 1 }],
      },
    };
  },
};
```

在页面中消费全局数据：

```jsx
// pages/index.tsx
import React from 'react';

export default (props) => {
  return (
    {/* <div>Layout</div> */}
    <div>{props.layout.name}</div>
  )
}
``` -->

### 页面级数据获取

### 使用

每个页面可能有单独的数据预获取逻辑，这里我们会获取页面组件上的 `getInitialProps` 静态方法，执行后将结果注入到该页面组件的 `props` 中，例如：

```tsx
// pages/index.tsx
import { IGetInitialProps } from 'umi';
import React from 'react';

const Home = (props) => {
  const { data } = props;
  return (
    {/* <div>Hello World</div> */}
    <div>{data.title}</div>
  )
}

Home.getInitialProps = (async (ctx) => {
  return Promise.resolve({
    data: {
      title: 'Hello World',
    }
  })
}) as IGetInitialProps;

/** 同时也可以使用 class 组件
class Home extends React.Component {
  static getInitialProps = (async (ctx) => {
    return Promise.resolve({
      data: {
        title: 'Hello World',
      }
    })
  }) as IGetInitialProps
  render() {
    const { data } = props;
    return (
      <div>{data.title}</div>
    )
  }
}
*/

export default Home;
```

`getInitialProps` 中有几个固定参数：

- `match`： 与客户端页面 props 中的 `match` 保持一致，有当前路由的相关数据。
- `isServer`：是否为服务端在执行该方法。
- `route`：当前路由对象
- `history`：history 对象

### 扩展 ctx 参数

为了结合数据流框架，我们提供了 `modifyGetInitialPropsCtx` 方法，由插件或应用来扩展 `ctx` 参数，以 `dva` 为例：

```ts
// plugin-dva/runtime.ts
export const ssr = {
  modifyGetInitialPropsCtx: async (ctx) => {
    ctx.store = getApp()._store;
  },
}
```

然后在页面中，可以通过获取到 `store`：

```tsx
// pages/index.tsx
const Home = () => <div />;

Home.getInitialProps = async (ctx) => {
  const state = ctx.store.getState();
  return state;
}

export default Home;
```

同时也可以在自身应用中进行扩展：

```js
// app.(ts|js)
export const ssr = {
  modifyGetInitialPropsCtx: async (ctx) => {
    ctx.title = 'params';
    return ctx;
  }
}
```

同时可以使用 `getInitialPropsCtx` 将服务端参数扩展到 `ctx` 中，例如：

```js
app.use(async (req, res) => {
  // 或者从 CDN 上下载到 server 端
  // const serverPath = await downloadServerBundle('http://cdn.com/bar/umi.server.js');
  const render = require('./dist/umi.server');
  res.setHeader('Content-Type', 'text/html');

  const context = {};
  const { html, error, rootContainer } = await render({
    // 有需要可带上 query
    path: req.url,
    context,
    getInitialPropsCtx: {
      req,
    },
  });
})
```

在使用的时候，就有 `req` 对象，不过需要注意的是，只在服务端执行时才有此参数：

```js
Page.getInitialProps = async (ctx) => {
  if (ctx.isServer) {
    // console.log(ctx.req);
  }
  return {};
}
```

则在执行 `getInitialProps` 方法时，除了以上两个固定参数外，还会获取到 `title` 和 `store` 参数。

关于 `getInitialProps` 执行逻辑和时机，这里需要注意：

- 开启 ssr，且执行成功
  - 未开启 `forceInitial`，首屏不触发 `getInitialProps`，切换页面时会执行请求，和客户端渲染逻辑保持一致。
  - 开启 `forceInitial`，无论是首屏还是页面切换，都会触发 `getInitialProps`，目的是始终以客户端请求的数据为准。（有用在静态页面站点的实时数据请求上）
- 未开启 ssr 时，只要页面组件中有 `getInitialProps` 静态方法，则会执行该方法。

## 部署

执行 `umi build` ，除了正常的 `umi.js` 外，会多一个服务端文件： `umi.server.js` （相当于服务端入口文件，类比浏览器加载 umi.js 客户端渲染）

```diff
- dist
  - umi.js
  - umi.css
  - index.html
+ - umi.server.js
```

然后在后端框架中，引用该文件：

```js
// Express
app.use(async (req, res) => {
  // 或者从 CDN 上下载到 server 端
  // const serverPath = await downloadServerBundle('http://cdn.com/bar/umi.server.js');
  const render = require('./dist/umi.server');
  res.setHeader('Content-Type', 'text/html');

  const context = {};
  const { html, error, rootContainer } = await render({
    // 有需要可带上 query
    path: req.url,
    context,

    // 可自定义 html 模板
    // htmlTemplate: defaultHtml,

    // 启用流式渲染
    // mode: 'stream',

    // html 片段静态标记（适用于静态站点生成）
    // staticMarkup: false,

    // 扩展 getInitialProps 在服务端渲染中的参数
    // getInitialPropsCtx: {},

    // manifest，正常情况下不需要
  });

  // support stream content
  if (content instanceof Stream) {
    html.pipe(res);
    html.on('end', function() {
      res.end();
    });
  } else {
    res.send(res);
  }
})
```

`render` 方法参数和返回值如下：

参数：

```ts
{
  // 渲染页面路由，支持 `base` 和带 query 的路由，通过 umi 配置
  path: string;
  // 可选，初始化数据，传透传到 getInitialProps 方法的参数中
  initialData?: object;
  // 可选，html 模板，这里可自定义模板，默认是用 umi 内置的 html
  htmlTemplate?: string;
  // 可选，页面内容挂载节点，与 htmlTemplate 配合使用，默认为 root
  mountElementId?: string;
  // 上下文数据，可用来标记服务端渲染页面时的状态
  context?: object
  // ${protocol}://${host} 扩展 location 对象
  origin?: string;
}
```

返回值：

```ts
{
  // html 内容，服务端渲染错误后，会返回原始 html
  html?: string | Stream;
  // 挂载节点中的渲染内容（ssr 渲染实际上只是渲染挂载节点中的内容），同时你也可以用该值来拼接自定义模板
  rootContainer: string | Stream;
  // 错误对象，服务端渲染错误后，值不为 null
  error?: Error;
}
```

## 示例

目前做了两个示例分别是基于[koa](https://github.com/umijs/umi/tree/master/examples/ssr-koa)和[egg](https://github.com/umijs/umi/tree/master/examples/ssr-with-eggjs)的，示例内置dva数据流和国际化解决方案，代码部分有注释，可参照进行个性化的修改。

## polyfill

Umi 3 默认移除了 DOM/BOM 浏览器 API 在 Node.js 的 polyfill，如果应用确实需要 polyfill 一些浏览器对象，可以使用 `beforeRenderServer` 运行时事件 API 进行扩展

```js
// app.ts
export const ssr = {
  beforeRenderServer: async ({
    env,
    location,
    history,
    mode,
    context,
  }) => {
    // global 为 Node.js 下的全局变量
    // 避免直接 mock location，这样会造成一些环境判断失效
    global.mockLocation = location;

    // 国际化
    if (location.pathname.indexOf('zh-CN') > -1) {
      global.locale = 'zh-CN'
    }
  }
}
```

## 动态加载（dynamicImport）

完美兼容客户端动态加载，配置如下：

```ts
// .umirc.ts
export default {
  ssr: {},
  dynamicImport: {},
}
```

使用动态加载后，启动和构建会自动开启 [manifest](/zh-CN/config#manifest) 配置，并在产物目录中生成 `asset-manifest.json` 做资源映射，并自动将页面对应的资源注入到 HTML 中，避免开启动态加载后，**页面首屏闪烁**的问题。

```bash
- dist
  - umi.server.js
  - asset-manifest.json
```

则页面返回的 HTML 将增加对应 chunk（资源）：

```diff
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="/umi.css" />
+   <link rel="stylesheet" href="/p__index.chunk.css" />
  </head>
</html>
```

## 使用流式渲染（Streaming）

提供开箱即用的流式渲染功能，开启方式：

```js
export default {
  ssr: {
    mode: 'stream',
  },
}
```

## 使用预渲染

### 开启预渲染

通过 `exportStatic` 结合 `ssr` 开启预渲染

```js
export default {
  ssr: {},
  exportStatic: {},
}
```

执行 `umi build`，会将输出渲染后的 HTML

<img style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" src="https://user-images.githubusercontent.com/13595509/80445233-53828480-8946-11ea-8884-016b88c14220.png" />

### 预渲染动态路由

预渲染默认情况下不会渲染动态路由里的所有页面，如果需要渲染动态路由中的页面，通过配置 `extraRoutePaths`，例如：

```diff
export default {
  ssr: {},
  exportStatic: {
+   extraRoutePaths: async () => {
+     // const result = await request('https://your-api/news/list');
+     return Promise.resolve(['/news/1', 'news/2']);
+   }
  },
  routes: [
    {
      path: '/',
      component: '@/layout',
      routes: [
        { path: '/', component: '@/pages/index' },
        { path: '/news', component: '@/pages/news' },
        { path: '/news/:id', component: '@/pages/news/detail' }
      ]
    }
  ]
}
```

则会生成以下产物：

```diff
 - dist
   - umi.js
   - umi.css
   - index.html
   - news
    - :id
      - index.html
+   - 1
+     - index.html
+   - 2
+     - index.html
    - index.html
```

> 默认情况下，预渲染后会删除 `umi.server.js` 服务端入口文件，如果需要保留，可使用变量 `RM_SERVER_FILE=none` 来保留 `umi.server.js`。

## 页面标题渲染

[@umijs/preset-react](/zh-CN/plugins/preset-react#umijspreset-react) 插件集中已内置对标题的渲染，通过以下步骤使用：

安装：

```bash
$ yarn add @umijs/preset-react
```

在页面中，即直接可以渲染标题：

```tsx
// pages/bar.tsx
import React from 'react';
import { Helmet } from 'umi';

export default props => {
  return (
    <>
      {/* 可自定义需不需要编码 */}
      <Helmet encodeSpecialCharacters={false}>
        <html lang="en" data-direction="666" />
        <title>Hello Umi Bar Title</title>
      </Helmet>
    </>
  );
};
```

![image](https://user-images.githubusercontent.com/13595509/80379292-770ae800-88d0-11ea-8f6e-4585cc1970ac.png)

## 在 dumi 中使用

[dumi](https://d.umijs.org/)：基于 Umi、为组件开发场景而生的文档工具，Umi 官网文档即使用 dumi 编写并结合预渲染，让文档内容具备 SEO，可使用源代码查看，开启方法：

```jsx
export default {
  ssr: {},
  exportStatic: {},
}
```

<img src="https://user-images.githubusercontent.com/13595509/80310631-52e6d280-880e-11ea-9a9a-0942c0e24658.png" width="600" style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" />

## 数据流结合

### 与 dva 结合使用

[@umijs/preset-react](/zh-CN/plugins/preset-react#umijspreset-react) 插件集中已内置 dva，通过以下步骤使用：

```bash
$ yarn add @umijs/preset-react
```

开启 dva，并在 `models` 目录下创建 dva model：

```js
export default {
  ssr: {},
  dva: {}
}
```

这时候 `getInitialProps(ctx)` 中的 `ctx` 就会有 `store` 属性，可执行 `dispatch`，并返回初始化数据。

```js
Page.getInitialProps = async (ctx) => {
  const { store } = ctx;
  store.dispatch({
    type: 'bar/getData',
  });
  return store.getState();
}
```

## 包大小分析

Umi 同时支持对服务端和客户端包大小的分析

```bash
# 服务端包大小分析
$ ANALYZE_SSR=1 umi build
# 客户端包大小分析
$ ANALYZE=1 umi build
```

<img width="600" style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" src="https://user-images.githubusercontent.com/13595509/80446129-8b8ac700-8948-11ea-82a8-54d94501a672.png" />

## 谁在使用？

<code src="./ssrUsers.tsx" inline />

## FAQ

### window is not defined, document is not defined, navigator is not defined

SSR 因为会在服务端执行 render 渲染方法，而服务端没有 DOM/BOM 变量和方法，为解决这类问题，提供以下几个方法：

1. 如果是项目自身的代码，建议将访问的 DOM/BOM 方法放在 `componentDidMount`、`useEffect` 中（服务端不会执行），避免服务端执行时报错，例如：

```diff
import React from 'react';

export default () => {
- window.alert(1);
  React.useEffect(() => {
+   window.alert(1);
  }, []);

  return (
    <div>Hello</div>
  )
}
```

2. 通过 umi 提供的 `isBrowser` 方法做环境判断，例如：

```diff
import React from 'react';
+ import { isBrowser } from 'umi';

export default () => {
- window.alert(1);
+ if (!isBrowser()) {
    window.alert(1);
+ }

  return (
    <div>Hello</div>
  )
}
```

### Helmet 结合 stream 渲染无法显示 title

因为 react-helmet 暂不支持 stream 渲染，如果使用 Helmet ，请使用 `mode: 'string'` 方式渲染。[nfl/react-helmet#322](https://github.com/nfl/react-helmet/issues/322)

### antd pro 怎样使用服务端渲染？

首先，[antd pro](https://github.com/ant-design/ant-design-pro/) 作为中后台项目,没有 SEO 需求，不适合做服务端渲染；
从技术角度来讲，antd pro 在 render 里大量使用 DOM/BOM 方法，服务端渲染将 DOM/BOM 操作改至副作用（`useEffect` 或 `componentDidMount` 周期中），可以给 antd pro 提 PR。

### 为什么不能 external 服务端中的一些模块

1. 因为 umi 内部模块大量使用了 `alias`，如果做 external 会做大量模块的路径映射，真正在服务端使用时，会出现某些包路径不对，加载不了的报错
1. 有些模块需要依赖模块实例才会做服务端渲染（例如 [react-helmet](https://github.com/nfl/react-helmet)）为了保持同一实例，不会使用 external
1. 经过测试，服务端包 external 后与不 external，在 [TTFB](https://baike.baidu.com/item/TTFB)（发出页面请求到接收到应答数据第一个字节所花费的毫秒数）没有明显区别

综合考虑，Umi 3 SSR 不会对服务端文件（`umi.server.js`）做 external。

### `Prop `dangerouslySetInnerHTML` did not match.` 报错

只有 `div` 标签 `dangerouslySetInnerHTML` 属性才能被 SSR 渲染，正常的写法应该是：

```diff
- <p dangerouslySetInnerHTML={{ __html: '<p>Hello</p>' }} />
+ <div dangerouslySetInnerHTML={{ __html: '<p>Hello</p>' }} />
```

### 如何判断当前页面是 SSR 还是 CSR？

查看网页源代码，如果 `<div id="root">` DOM 里的元素不为空，则是 SSR，否则为 CSR。
