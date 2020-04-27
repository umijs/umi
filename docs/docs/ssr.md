---
translateHelp: true
---
# 服务端渲染（SSR）

## 什么是服务端渲染？

> 首先我们先了解下，以及是否符合我们的业务场景，再决定是否需要使用。

服务端渲染（Server-Side Render），是指将组件或页面的渲染逻辑在**服务器端**执行后生成 HTML 片段，发送到浏览器，然后为其绑定状态与事件，成为完全可交互页面的过程。

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

预渲染与服务端渲染唯一的不同点在于**渲染时机**，服务端渲染的时机是在用户访问时执行渲染（即**实时渲染**，数据一般是最新的），预渲染的时机是在项目构建时，当用户访问时，数据不是一定是最新的（如果数据没有实时性，则可以直接考虑预渲染）。

预渲染（Pre Render）在构建时执行渲染，将渲染后的 HTML 片段生成静态 HTML 文件。无需使用 web 服务器实时动态编译 HTML，适用于**静态站点生成**。

## Umi 服务端渲染特性

> 早在 Umi 2.8+ 版本时，Umi 已具备 SSR 能力，只是使用上对新手而言，门槛较高。

Umi 3 结合自身业务场景，在 SSR 上做了大量优化及开发体验的提升，具有以下特性：

- **开箱即用**：内置 SSR，一键开启，`umi dev` 即 SSR 预览，开发调试方便。
- **服务端框架无关**：Umi 不耦合服务端框架（例如 [Egg.js](https://eggjs.org/)、[Express](https://expressjs.com/)、[Koa](https://koajs.com/)），无论是哪种框架或者 Serverless 模式，都可以非常简单进行集成。
- **支持应用和页面级数据预获取**：Umi 3 中延续了 Umi 2 中的页面数据预获取（getInitialProps）的同时，增加了应用级数据获取（getInitialData），来解决之前全局数据的获取问题。
- **内置预渲染功能**：Umi 3 中内置了预渲染功能，不再通过安装额外插件使用，同时开启 `ssr` 和 `exportStatic`，在 `umi build` 构建时会编译出渲染后的 HTML。
- **支持渲染降级**：优先使用 SSR，如果服务端渲染失败，自动降级为客户端渲染（CSR），不影响正常业务流程。
- **支持流式渲染**：`ssr: { stream: true }` 即可开启流式渲染，流式 SSR 较正常 SSR 有更少的 [TTFB](https://baike.baidu.com/item/TTFB)（发出页面请求到接收到应答数据第一个字节所花费的毫秒数） 时间。
- **兼容客户端动态加载**：在 Umi 2 中同时使用 SSR 和 dynamicImport（动态加载）会有一些问题，在 Umi 3 中可同时开启使用。
- **SSR 功能插件化**：Umi 3 内置的 SSR 功能基本够用，若不满足需求或者想自定义渲染方法，可通过提供的 API 来自定义。

## 启用服务端渲染

默认情况下，服务端渲染功能是关闭的，你需要在使用之前通过配置开启：

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

服务端渲染的数据获取方式与 SPA（单页应用）有所不同，为了让客户端和服务端都能获取到同一份数据，我们提供了两个 应用级数据 和 页面级数据 方法。

### 应用级数据获取

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
```

### 页面级数据获取

每个页面可能有单独的数据预获取逻辑，这里我们会获取页面组件上的 `getInitialProps` 静态方法，执行后将结果注入到该页面组件的 `props` 中，例如：

```jsx
import React from 'react';

const Home = (props) => {
  const { data } = props;
  return (
    {/* <div>Hello World</div> */}
    <div>{data.title}</div>
  )
}

Home.getInitialProps = async (params) => {
  return Promise.resolve({
    data: {
      title: 'Hello World',
    }
  })
}

export default Home;
```

`getInitialProps` 中有两个固定参数：

- `match`： 与客户端页面 props 中的 `match` 保持一致，有当前路由的相关数据。
- `isServer`：是否为服务端在执行该方法。

同时为了结合数据流框架，我们提供了 `modifyGetInitialPropsParams` 方法，由插件或应用来扩展参数，例如 `dva`：

```jsx
// plugin-dva/runtime.ts
export const ssr = {
  modifyGetInitialPropsParams: async (params) => {
    return {
      ...params,
      store: getApp()._store,
    }
  }
}
```

同时也可以在自身应用中进行扩展：

```js
// app.(ts|js)
export const ssr = {
  modifyGetInitialPropsParams: async (params) {
    return {
      ...params,
      title: 'params'
    }
  }
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

  const { html, error, rootContainer } = await render({
    // 有需要可带上 query
    path: req.url,
    // 可自定义 html 模板
    // htmlTemplate: defaultHtml,

    // 启用流式渲染
    // stream: false,
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
  // 上下文数据，可用来做 title 等渲染
  context?: object
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

## 使用流式渲染（Streaming）

提供开箱即用的流式渲染功能，开启方式：

```js
export default {
  ssr: {
    stream: true,
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

### 预渲染动态路由

预渲染默认情况下不会渲染动态路由里的所有页面，如果需要渲染动态路由中的页面，通过配置 `extraPaths`，例如：

```diff
export default {
  ssr: {},
  exportStatic: {
+   extraPaths: ['/news/1', '/news/2']
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
    - index.html
```

## 在 dumi 中使用

[dumi](https://d.umijs.org/)：基于 Umi、为组件开发场景而生的文档工具，Umi 官网文档即使用 dumi 编写并结合预渲染，让文档内容具备 SEO，可使用源代码查看，开启方法：

```jsx
export default {
  ssr: {},
  exportStatic: {},
}
```

<img src="https://user-images.githubusercontent.com/13595509/80310631-52e6d280-880e-11ea-9a9a-0942c0e24658.png" width="600" style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" />

## 与 dva 结合使用

TODO

## Q & A

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

### `Prop `dangerouslySetInnerHTML` did not match.` 报错

只有 `div` 标签 `dangerouslySetInnerHTML` 属性才能被 SSR 渲染，正常的写法应该是：

```diff
- <p dangerouslySetInnerHTML={{ __html: '<p>Hello</p>' }} />
+ <div dangerouslySetInnerHTML={{ __html: '<p>Hello</p>' }} />
```

### 如何判断当前页面是 SSR 还是 CSR？

有两种方法：

1. 在浏览器中打开控制台，将 `window.g_useSSR` 变量打出，不为 `undefined` 即开启。
1. 查看网页源代码，如果 `<div id="root">` DOM 里的元素不为空，则是 SSR。
