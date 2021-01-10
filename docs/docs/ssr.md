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

The only difference between pre-rendering and server-side rendering is **rendering timing**. The timing of server-side rendering is to perform rendering when the user visits (ie **real-time rendering**, the data is generally the latest), and the timing of pre-rendering When the project is built, when the user accesses the data, the data is not necessarily the latest (if the data is not real-time, you can directly consider pre-rendering).

Pre Render performs rendering during construction and generates static HTML files from rendered HTML fragments. No need to use web server to dynamically compile HTML in real time, suitable for **static site generation**.

## Umi server rendering features

> As early as the Umi 2.8+ version, Umi already has SSR capabilities, but for novices, the threshold is higher.

Umi 3 combines its own business scenarios to do a lot of optimization and development experience improvement on SSR, with the following features:

- **Out of the box**: Built-in SSR, one key to open, `umi dev` is SSR preview, convenient for development and debugging.
- **Server-side framework independent**: Umi does not couple server-side frameworks (for example, [Egg.js](https://eggjs.org/), [Express](https://expressjs.com/), [Koa ](https://koajs.com/)), no matter which framework or serverless mode, it can be integrated very easily.
- **Support application and page-level data pre-acquisition**: Umi 3 continues the page data pre-acquisition (getInitialProps) in Umi 2 to solve the previous global data acquisition problem.
- **Support on-demand loading**: On-demand loading of `dynamicImport` is enabled, Umi 3 will load the corresponding resource files (css/js) according to different routes.
- **Built-in pre-rendering function**: Umi 3 has a built-in pre-rendering function, which is no longer used by installing additional plug-ins. At the same time, enable `ssr` and `exportStatic`, and the rendered image will be compiled when `umi build` is built. HTML.
- **Support rendering degradation**: SSR is preferred. If server-side rendering fails, it will be automatically downgraded to client-side rendering (CSR) without affecting normal business processes.
- **Support streaming rendering**: `ssr: {mode:'stream' }` to enable streaming rendering, streaming SSR has less [TTFB](https://baike.baidu.com/item/TTFB) (the number of milliseconds it takes from sending a page request to receiving the first byte of the response data) time.
- **Compatible with client dynamic loading**: Using SSR and dynamicImport (dynamic loading) at the same time in Umi 2 will cause some problems, and Umi 3 can be used at the same time.
- **SSR function plug-in**: The built-in SSR function of Umi 3 is basically sufficient. If you do not meet your needs or want to customize the rendering method, you can customize it through the provided API.

## Enable server-side rendering

By default, the server-side rendering function is disabled, you need to enable it through configuration before using:

```js
export default {
  ssr: {},
}
```

## Development

Execute ʻumi dev` to visit the page, which is rendered on the server side.

<img style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" src="https://user-images.githubusercontent.com/13595509/80309380-4743dd80-8807-11ea- 9def-7bb43522dce3.png" width="600" />

> [How to judge whether the current page is SSR or CSR? ](#How to judge whether the current page is -ssr- or -csr?)

If used with the back-end framework in development mode, you can turn off the server-side rendering behavior under ʻumi dev` through configuration:

```js

export default {
  ssr: {
    // The default is true
    devServerRender: false,
  },
}
```

## Data pre-acquisition

The data acquisition method for server rendering is different from SPA (Single Page Application). In order to allow both the client and the server to obtain the same data, we provide page-level data pre-acquisition.

<!-- ### Application-level data acquisition

Provide `getInitialData` to obtain global data, which is transparently transmitted to the props of each page, so that all pages can share and consume this data:

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

Consume global data in the page:

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

### Page-level data acquisition

### Use

Each page may have separate data pre-fetching logic. Here we will get the static method `getInitialProps` on the page component, and inject the result into the `props` of the page component after execution, for example:

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

/** You can also use class components
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

There are several fixed parameters in `getInitialProps`:

-`match`: It is consistent with the `match` in the client page props, and has the relevant data of the current route.
-ʻIsServer`: Whether the method is being executed by the server.
-`route`: current route object
-`history`: history object

### Expand ctx parameters

In order to integrate the data flow framework, we provide the `modifyGetInitialPropsCtx` method, which can be extended by the plug-in or application to the `ctx` parameter. Take `dva` as an example:

```ts
// plugin-dva/runtime.ts
export const ssr = {
  modifyGetInitialPropsCtx: async (ctx) => {
    ctx.store = getApp()._store;
  },
}
```

Then on the page, you can get the `store`:

```tsx
// pages/index.tsx
const Home = () => <div />;

Home.getInitialProps = async (ctx) => {
  const state = ctx.store.getState();
  return state;
}

export default Home;
```

It can also be extended in its own applications:

```js
// app.(ts|js)
export const ssr = {
  modifyGetInitialPropsCtx: async (ctx) => {
    ctx.title = 'params';
    return ctx;
  }
}
```

At the same time, you can use `getInitialPropsCtx` to extend server-side parameters to `ctx`, for example:

```js
app.use(async (req, res) => {
  // Or download from CDN to server
  // const serverPath = await downloadServerBundle('http://cdn.com/bar/umi.server.js');
  const render = require('./dist/umi.server');
  res.setHeader('Content-Type', 'text/html');

  const context = {};
  const { html, error, rootContainer } = await render({
    // Bring query if necessary
    path: req.url,
    context,
    getInitialPropsCtx: {
      req,
    },
  });
})
```

When used, there is a `req` object, but it should be noted that this parameter is only available when the server is executing:

```js
Page.getInitialProps = async (ctx) => {
  if (ctx.isServer) {
    // console.log(ctx.req);
  }
  return {};
}
```

When the `getInitialProps` method is executed, in addition to the above two fixed parameters, the `title` and `store` parameters will also be obtained.

Regarding the execution logic and timing of `getInitialProps`, please note here:

- Open ssr and execute successfully
  - If `forceInitial` is not turned on, the first screen does not trigger `getInitialProps`, and the request will be executed when the page is switched, which is consistent with the client rendering logic.
  - Enabling `forceInitial`, whether it is the first screen or page switching, will trigger `getInitialProps`, the purpose is to always follow the data requested by the client. (Useful for real-time data requests of static page sites)
- When ssr is not enabled, as long as there is a static method `getInitialProps` in the page component, the method will be executed.

## Deployment

Executing ʻumi build`, in addition to the normal ʻumi.js`, there will be an additional server file: ʻumi.server.js` (equivalent to the server entry file, analogous to the browser loading umi.js client rendering)

```diff
- dist
  - umi.js
  - umi.css
  - index.html
+ - umi.server.js
```

Then in the back-end framework, reference the file:

```js
// Express
app.use(async (req, res) => {
// Or download from CDN to server  // const serverPath = await downloadServerBundle('http://cdn.com/bar/umi.server.js');
  const render = require('./dist/umi.server');
  res.setHeader('Content-Type', 'text/html');

  const context = {};
  const { html, error, rootContainer } = await render({
// Bring query if necessary
    path: req.url,
    context,

    // Customizable html template
    // htmlTemplate: defaultHtml,

    // Enable streaming
    // mode:'stream',

    // html fragment static markup (for static site generation)
    // staticMarkup: false,

    // Extend the parameters of getInitialProps in server-side rendering
    // getInitialPropsCtx: {},

    // manifest, not required under normal circumstances
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

The parameters and return values ​​of the `render` method are as follows:

parameter:

```ts
{
  // Render page routing, support `base` and routing with query, configure via umi
  path: string;
  // Optional, initialize the data and pass it transparently to the parameters of the getInitialProps method
  initialData?: object;
  // Optional, html template, here you can customize the template, the default is to use umi's built-in html
  htmlTemplate?: string;
  // Optional, the page content mount node, used with htmlTemplate, the default is root
  mountElementId?: string;
  // Context data, which can be used to mark the state of the server when rendering the page
  context?: object
  // ${protocol}://${host} extends the location object
  origin?: string;
}
```

return value:

```ts
{
  // html content, the original html will be returned after server rendering error
  html?: string | Stream;
  // The rendering content in the mount node (ssr rendering is actually just rendering the content in the mount node), and you can also use this value to splice custom templates
  rootContainer: string | Stream;
  // Error object, after server rendering error, the value is not null
  error?: Error;
}
```

## Example

Two examples are currently based on [koa](https://github.com/umijs/umi/tree/master/examples/ssr-koa) and [egg](https://github.com/umijs/umi/tree/master/examples/ssr-with-eggjs), the examples have built-in dva data flow and internationalization solutions, and the code part has comments, which can be modified by reference.

## polyfill

Umi 3 removes the DOM/BOM browser API polyfill in Node.js by default. If the application does need to polyfill some browser objects, you can use the `beforeRenderServer` runtime event API to expand

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
    // global is a global variable under Node.js
    // Avoid direct mock location, this will cause some environmental judgments to be invalid
    global.mockLocation = location;

    // globalization
    if (location.pathname.indexOf('zh-CN') > -1) {
      global.locale = 'zh-CN'
    }
  }
}
```

## Dynamic loading (dynamicImport)

Perfectly compatible with client dynamic loading, the configuration is as follows:

```ts
// .umirc.ts
export default {
  ssr: {},
  dynamicImport: {},
}
```

After using dynamic loading, the startup and build will automatically open the [manifest](/zh-CN/config#manifest) configuration, and generate ʻasset-manifest.json` in the product directory for resource mapping, and automatically map the resources corresponding to the page Inject into HTML to avoid the problem of **page flickering on the first screen** after dynamic loading is enabled.

```bash
- dist
  - umi.server.js
  - asset-manifest.json
```

Then the HTML returned by the page will increase the corresponding chunk (resource):

```diff
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="/umi.css" />
+   <link rel="stylesheet" href="/p__index.chunk.css" />
  </head>
</html>
```

## Use Streaming

Provide out-of-the-box streaming rendering function, open method:

```js
export default {
  ssr: {
    mode: 'stream',
  },
}
```

## Use pre-rendering

### Turn on pre-rendering

Enable pre-rendering through ʻexportStatic` combined with `ssr`

```js
export default {
  ssr: {},
  exportStatic: {},
}
```

Executing ʻumi build` will output the rendered HTML

<img style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" src="https://user-images.githubusercontent.com/13595509/80445233-53828480-8946-11ea-8884-016b88c14220.png" />

### Pre-rendered dynamic routing

By default, pre-rendering will not render all pages in dynamic routing. If you need to render pages in dynamic routing, configure ʻextraRoutePaths`, for example:

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

Will produce the following products:

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

> By default, the server entry file of ʻumi.server.js` will be deleted after pre-rendering. If you need to keep it, you can use the variable `RM_SERVER_FILE=none` to keep ʻumi.server.js`.

## Page title rendering

[@umijs/preset-react](/zh-CN/plugins/preset-react#umijspreset-react) The rendering of the title is built-in in the plug-in set. Use the following steps:

installation:

```bash
$ yarn add @umijs/preset-react
```

In the page, the title can be directly rendered:

```tsx
// pages/bar.tsx
import React from 'react';
import { Helmet } from 'umi';

export default props => {
  return (
    <>
        {/* Can be customized without coding */}
        <Helmet encodeSpecialCharacters={false}>
        <html lang="en" data-direction="666" />
        <title>Hello Umi Bar Title</title>
      </Helmet>
    </>
  );
};
```

![image](https://user-images.githubusercontent.com/13595509/80379292-770ae800-88d0-11ea-8f6e-4585cc1970ac.png)

## Use in dumi

[dumi](https://d.umijs.org/): Based on Umi, a document tool for component development scenarios. Umi official website documents are written using dumi and combined with pre-rendering, so that the document content has SEO and can be used source Code view, open method:

```jsx
export default {
  ssr: {},
  exportStatic: {},
}
```

<img src="https://user-images.githubusercontent.com/13595509/80310631-52e6d280-880e-11ea-9a9a-0942c0e24658.png" width="600" style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" />

## Data stream combination

### Use with dva

[@umijs/preset-react](/zh-CN/plugins/preset-react#umijspreset-react) dva has been built in the plug-in set, use the following steps:

```bash
$ yarn add @umijs/preset-react
```

Open dva and create a dva model in the `models` directory:

```js
export default {
  ssr: {},
  dva: {}
}
```

At this time, the `ctx` in the `getInitialProps(ctx)` will have the `store` attribute, the `dispatch` can be executed, and the initialization data will be returned.

```js
Page.getInitialProps = async (ctx) => {
  const { store } = ctx;
  store.dispatch({
    type: 'bar/getData',
  });
  return store.getState();
}
```

## Packet size analysis

Umi also supports the analysis of server and client packet sizes

```bash
# Server-side packet size analysis
$ ANALYZE_SSR=1 umi build
# Client package size analysis
$ ANALYZE=1 umi build
```

<img width="600" style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px 0px;" src="https://user-images.githubusercontent.com/13595509/80446129-8b8ac700-8948-11ea-82a8-54d94501a672.png" />

## Who is using Umi?

<code src="./ssrUsers.tsx" inline />

## FAQ

### window is not defined, document is not defined, navigator is not defined

SSR will execute the render method on the server side, and the server side does not have DOM/BOM variables and methods. To solve this type of problem, the following methods are provided:

1. If it is the code of the project itself, it is recommended to put the accessed DOM/BOM method in `componentDidMount`, ʻuseEffect` (the server will not execute it) to avoid errors when the server executes, for example:

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

2. Make environmental judgments through the `isBrowser` method provided by umi, for example:

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

3. If it is a third-party library, you can dynamically load components through the `dynamic` provided by umi
```
import React from'react';
import {dynamic} from'umi';
const renderLoading = () => <p>The component is dynamically loading...</p>
export default dynamic({
    loader: async () => {
        // Dynamically load third-party components
        const {default: DynamicComponent} = await import(
            /* webpackChunkName: "dynamic-component" */'dynamic-component'
        );
        return DynamicComponent;
    },
    loading: () => renderLoading(),
});
```
Avoid `did not match.` warning when ssr rendering time, ssr should render the same `loading` component when using
```
import React from 'react';
import { isBrowser } from 'umi';
import DynamicComponent from 'DynamicComponent';
export default () => {
  if(isBrowser()) return <DynamicComponent />
  return renderLoading()
}
```

### Helmet cannot display title in combination with stream rendering

Because react-helmet does not support stream rendering at the moment, if you use Helmet, please use `mode:'string'` to render. [nfl/react-helmet#322](https://github.com/nfl/react-helmet/issues/322)

### How to use server-side rendering in Ant.d Pro?

First of all, [antd pro](https://github.com/ant-design/ant-design-pro/) is a mid- and back-end project without SEO requirements and is not suitable for server-side rendering;
From a technical point of view, antd pro uses a lot of DOM/BOM methods in render, and server-side rendering changes DOM/BOM operations to side effects (in the ʻuseEffect` or `componentDidMount` cycle), which can raise PR for antd pro.

### Why can't I use external modules

1. Because Umi internal modules make use of `alias`, if you do external, you will do path mapping for a large number of modules. When actually used on the server side, some packages will have incorrect paths and can’t be loaded.
2. Some modules need to rely on module instances to do server-side rendering (for example, [react-helmet](https://github.com/nfl/react-helmet)) In order to keep the same instance, external will not be used
3. After testing, the server packaged external and not external, in [TTFB](https://baike.baidu.com/item/TTFB) (the time it takes for the page request to be sent to the first byte of the response data Milliseconds) no significant difference

Considering comprehensively, Umi 3 SSR will not externalize the server file (ʻumi.server.js`).

### Prop `dangerouslySetInnerHTML` did not match.error

Only the `dangerouslySetInnerHTML` attribute of the `div` tag can be rendered by SSR. The normal writing should be:

```diff
- <p dangerouslySetInnerHTML={{ __html: '<p>Hello</p>' }} />
+ <div dangerouslySetInnerHTML={{ __html: '<p>Hello</p>' }} />
```

### How to judge whether the current page is SSR or CSR?

Check the source code of the webpage, if the element in the `<div id="root">` DOM is not empty, it is SSR, otherwise it is CSR.
