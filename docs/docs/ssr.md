---
translateHelp: true
---

# 服务端渲染（SSR）

## 什么是服务端渲染？

> 首先我们先了解下，以及是否符合我们的业务场景，再决定是否需要使用。

服务端渲染（Server-Side Rendering），是指由**服务侧**完成页面的 HTML 结构拼接的页面处理技术，发送到浏览器，然后为其绑定状态与事件，成为完全可交互页面的过程。

这么讲可能比较学术，那通过两张图来更容易地说清楚。

第一张，单页应用（SPA）和服务端渲染过的（SSR）站点在**社交分享**时的区别：

<img style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" src="https://user-images.githubusercontent.com/13595509/68102160-5e66da00-ff0c-11e9-82e8-7c73cca1b20f.png" width="600" />

第二张，**白屏时间**上 SSR 较少，因为当 HTML 文档返回时，已经有对应的内容。（见 Network）

<img style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" src="https://user-images.githubusercontent.com/13595509/80308316-e74a3880-8800-11ea-9a20-2d9d153fe9d1.png" />

综上两图可知，SSR 常用于以下两个场景：

1. 有 **SEO 诉求**，用在搜索引擎检索以及社交分享，用在前台类应用。
1. **首屏渲染**时长有要求，常用在移动端、弱网情况下。

> 也就是说，如果你是中后台应用（如 antd pro、管理后台等），请谨慎考虑是否使用 SSR。

## 什么是预渲染？

服务端渲染，首先得有后端服务器（一般是 Node.js）才可以使用，如果我没有后端服务器，也想用在上面提到的两个场景，那么推荐使用**预渲染**。

预渲染与服务端渲染唯一的不同点在于**渲染时机**，服务端渲染的时机是在用户访问时执行渲染（即**实时渲染**，数据一般是最新的），预渲染的时机是在项目构建时，当用户访问时，数据不一定是最新的（如果数据没有实时性，则可以直接考虑预渲染）。

预渲染（Pre Render）在构建时执行渲染，将渲染后的 HTML 片段生成静态 HTML 文件。无需使用 web 服务器实时动态编译 HTML，适用于**静态站点生成**。

## Umi 服务端渲染特性

> 早在 Umi 2.8+ 版本时，Umi 已具备 SSR 能力，只是使用上对新手而言，门槛较高。

Umi 3 结合自身业务场景，在 SSR 上做了大量优化及开发体验的提升，具有以下特性：

- **开箱即用**：内置 SSR，一键开启，`umi dev` 即 SSR 预览，开发调试方便。
- **服务端框架无关**：Umi 不耦合服务端框架（例如 [Egg.js](https://eggjs.org/)、[Express](https://expressjs.com/)、[Koa](https://koajs.com/)），无论是哪种框架或者 Serverless 模式，都可以非常简单进行集成。
- **支持应用和页面级数据预获取**：Umi 3 中延续了 Umi 2 中的页面数据预获取（getInitialProps），来解决之前全局数据的获取问题。
- **支持按需加载**：按需加载 `dynamicImport` 开启后，Umi 3 中会根据不同路由加载对应的资源文件（css/js）。
- **内置预渲染功能**：Umi 3 中内置了预渲染功能，不再通过安装额外插件使用，同时开启 `ssr` 和 `exportStatic`，在 `umi build` 构建时会编译出渲染后的 HTML。
- **支持渲染降级**：优先使用 SSR，如果服务端渲染失败，自动降级为客户端渲染（CSR），不影响正常业务流程。
- **支持流式渲染**：`ssr: { mode: 'stream' }` 即可开启流式渲染，流式 SSR 较正常 SSR 有更少的 [TTFB](https://baike.baidu.com/item/TTFB)（发出页面请求到接收到应答数据第一个字节所花费的毫秒数） 时间。
- **兼容客户端动态加载**：在 Umi 2 中同时使用 SSR 和 dynamicImport（动态加载）会有一些问题，在 Umi 3 中可同时开启使用。
- **SSR 功能插件化**：Umi 3 内置的 SSR 功能基本够用，若不满足需求或者想自定义渲染方法，可通过提供的 API 来自定义。

## 启用服务端渲染

默认情况下，服务端渲染功能是关闭的，你需要在使用之前通过配置开启：

```js
export default {
  ssr: {},
};
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
};
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
};
```

然后在页面中，可以通过获取到 `store`：

```tsx
// pages/index.tsx
const Home = () => <div />;

Home.getInitialProps = async (ctx) => {
  const state = ctx.store.getState();
  return state;
};

export default Home;
```

同时也可以在自身应用中进行扩展：

```js
// app.(ts|js)
export const ssr = {
  modifyGetInitialPropsCtx: async (ctx) => {
    ctx.title = 'params';
    return ctx;
  },
};
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
});
```

在使用的时候，就有 `req` 对象，不过需要注意的是，只在服务端执行时才有此参数：

```js
Page.getInitialProps = async (ctx) => {
  if (ctx.isServer) {
    // console.log(ctx.req);
  }
  return {};
};
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
    html.on('end', function () {
      res.end();
    });
  } else {
    res.send(res);
  }
});
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

目前做了两个示例分别是基于[koa](https://github.com/umijs/umi/tree/master/examples/ssr-koa)和[egg](https://github.com/umijs/umi/tree/master/examples/ssr-with-eggjs)的，示例内置 dva 数据流和国际化解决方案，代码部分有注释，可参照进行个性化的修改。

## polyfill

Umi 3 默认移除了 DOM/BOM 浏览器 API 在 Node.js 的 polyfill，如果应用确实需要 polyfill 一些浏览器对象，可以使用 `beforeRenderServer` 运行时事件 API 进行扩展

```js
// app.ts
export const ssr = {
  beforeRenderServer: async ({ env, location, history, mode, context }) => {
    // global 为 Node.js 下的全局变量
    // 避免直接 mock location，这样会造成一些环境判断失效
    global.mockLocation = location;

    // 国际化
    if (location.pathname.indexOf('zh-CN') > -1) {
      global.locale = 'zh-CN';
    }
  },
};
```

## 动态加载（dynamicImport）

完美兼容客户端动态加载，配置如下：

```ts
// .umirc.ts
export default {
  ssr: {},
  dynamicImport: {},
};
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
};
```

## 使用预渲染

### 开启预渲染

通过 `exportStatic` 结合 `ssr` 开启预渲染

```js
export default {
  ssr: {},
  exportStatic: {},
};
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

export default (props) => {
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
};
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
  dva: {},
};
```

这时候 `getInitialProps(ctx)` 中的 `ctx` 就会有 `store` 属性，可执行 `dispatch`，并返回初始化数据。

```js
Page.getInitialProps = async (ctx) => {
  const { store } = ctx;
  store.dispatch({
    type: 'bar/getData',
  });
  return store.getState();
};
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

3.如果是第三方库可以通过 umi 提供的 `dynamic` 动态加载组件

```
import React from 'react';
import { dynamic } from 'umi';
const renderLoading = () => <p>组件动态加载中...</p>
export default dynamic({
    loader: async () => {
        // 动态加载第三方组件
        const { default: DynamicComponent } = await import(
            /* webpackChunkName: "dynamic-component" */ 'dynamic-component'
        );
        return DynamicComponent;
    },
    loading: () => renderLoading(),
});
```

避免 ssr 渲染时报 `did not match.`警告，使用时候 ssr 应当渲染相同`loading`组件

```
import React from 'react';
import { isBrowser } from 'umi';
import DynamicComponent from 'DynamicComponent';
export default () => {
  if(isBrowser()) return <DynamicComponent />
  return renderLoading()
}
```

### Helmet 结合 stream 渲染无法显示 title

因为 react-helmet 暂不支持 stream 渲染，如果使用 Helmet ，请使用 `mode: 'string'` 方式渲染。[nfl/react-helmet#322](https://github.com/nfl/react-helmet/issues/322)

### antd pro 怎样使用服务端渲染？

首先，[antd pro](https://github.com/ant-design/ant-design-pro/) 作为中后台项目,没有 SEO 需求，不适合做服务端渲染；从技术角度来讲，antd pro 在 render 里大量使用 DOM/BOM 方法，服务端渲染将 DOM/BOM 操作改至副作用（`useEffect` 或 `componentDidMount` 周期中），可以给 antd pro 提 PR。

### 为什么不能 external 服务端中的一些模块

1. 因为 umi 内部模块大量使用了 `alias`，如果做 external 会做大量模块的路径映射，真正在服务端使用时，会出现某些包路径不对，加载不了的报错
1. 有些模块需要依赖模块实例才会做服务端渲染（例如 [react-helmet](https://github.com/nfl/react-helmet)）为了保持同一实例，不会使用 external
1. 经过测试，服务端包 external 后与不 external，在 [TTFB](https://baike.baidu.com/item/TTFB)（发出页面请求到接收到应答数据第一个字节所花费的毫秒数）没有明显区别

综合考虑，Umi 3 SSR 不会对服务端文件（`umi.server.js`）做 external。

### `Prop`dangerouslySetInnerHTML`did not match.` 报错

只有 `div` 标签 `dangerouslySetInnerHTML` 属性才能被 SSR 渲染，正常的写法应该是：

```diff
- <p dangerouslySetInnerHTML={{ __html: '<p>Hello</p>' }} />
+ <div dangerouslySetInnerHTML={{ __html: '<p>Hello</p>' }} />
```

### 如何判断当前页面是 SSR 还是 CSR？

查看网页源代码，如果 `<div id="root">` DOM 里的元素不为空，则是 SSR，否则为 CSR。
