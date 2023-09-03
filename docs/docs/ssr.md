

# Server-Side Rendering (SSR)

## What is Server-Side Rendering?

> First, let's understand what it is and whether it suits our business scenario before deciding whether to use it.

Server-Side Rendering (SSR) is a page processing technique performed on the **server side** to assemble the HTML structure of a page, send it to the browser, and then bind its state and events, turning it into a fully interactive page.

This might sound a bit academic, so let's make it clearer with two images.

The first image illustrates the difference between Single Page Applications (SPAs) and sites that have undergone Server-Side Rendering (SSR) when it comes to **social sharing**:

![SPAs vs. SSR for Social Sharing](https://user-images.githubusercontent.com/13595509/68102160-5e66da00-ff0c-11e9-82e8-7c73cca1b20f.png)

The second image shows that SSR has less **white screen time** because when the HTML document is returned, it already has the corresponding content (see Network):

![SSR vs. CSR White Screen Time](https://user-images.githubusercontent.com/13595509/80308316-e74a3880-8800-11ea-9a20-2d9d153fe9d1.png)

From these two images, we can see that SSR is commonly used in the following two scenarios:

1. When there is a **need for SEO**, it is used for search engine indexing and social sharing, typically in frontend applications.
2. When there are requirements for the **initial screen rendering time**, it is often used in mobile applications or under weak network conditions.

In other words, if you are building a backend application (such as antd pro or admin dashboards), please carefully consider whether to use SSR.

## What is Pre-rendering?

Server-Side Rendering requires a backend server (usually Node.js) to work. If you don't have a backend server but still want to use SSR for the two scenarios mentioned above, it is recommended to use **pre-rendering**.

The only difference between pre-rendering and server-side rendering is the **timing of rendering**. Server-side rendering occurs when a user accesses the page (real-time rendering, with data generally being the latest), while pre-rendering occurs during project build time. When a user accesses the page, the data may not be the latest (if the data doesn't need to be real-time, pre-rendering can be a good choice).

Pre-rendering (Pre Render) performs rendering during the build process, generating static HTML fragments after rendering. It does not require real-time dynamic HTML compilation using a web server and is suitable for **static site generation**.

## Umi Server-Side Rendering Features

> Umi has had SSR capabilities since Umi 2.8+. However, it was relatively challenging for beginners to use.

Umi 3, in combination with its own business scenarios, has made significant optimizations and improvements to SSR, offering the following features:

- **Out of the Box**: SSR is built-in and can be enabled with one click. You can preview SSR with `umi dev`, making development and debugging convenient.
- **Server Framework Agnostic**: Umi is not tied to any specific server framework (e.g., [Egg.js](https://eggjs.org/), [Express](https://expressjs.com/), [Koa](https://koajs.com/)). It can be easily integrated with any framework or used in Serverless mode.
- **Support for Data Pre-fetching at the Application and Page Levels**: In Umi 3, data pre-fetching (getInitialProps) from Umi 2 has been continued to address the issue of fetching global data in the past.
- **Support for On-Demand Loading**: With dynamicImport enabled, Umi 3 will load corresponding resource files (CSS/JS) based on different routes.
- **Built-In Pre-rendering Functionality**: Umi 3 includes pre-rendering functionality built-in, eliminating the need for additional plugins. By enabling `ssr` and `exportStatic`, Umi will compile the rendered HTML during `umi build`.
- **Support for Rendering Fallback**: SSR is preferred, but if server-side rendering fails, it automatically falls back to client-side rendering (CSR) without affecting normal business processes.
- **Support for Streaming Rendering**: You can enable streaming rendering with `ssr: { mode: 'stream' }`, which results in less [Time to First Byte (TTFB)](https://en.wikipedia.org/wiki/Time_to_first_byte) compared to regular SSR.
- **Compatible with Client-Side Dynamic Loading**: While using SSR and dynamicImport (dynamic loading) together had some issues in Umi 2, in Umi 3, you can use them simultaneously.
- **Modularized SSR Features**: Umi 3 provides essential SSR features, but if your requirements are not met or you want to customize the rendering process, you can do so through the provided API.

## Enabling Server-Side Rendering

By default, server-side rendering is disabled. You need to enable it through configuration:

```js
export default {
  ssr: {},
}
```

## Development

Run `umi dev`, access the page, and you will see the server-side rendered output.

![SSR Development](https://user-images.githubusercontent.com/13595509/80309380-4743dd80-8807-11ea-9def-7bb43522dce3.png)

> [How to determine whether the current page is SSR or CSR?](#how-to-determine-whether-the-current-page-is-ssr-or-csr)

If you are using it in conjunction with a backend framework in development mode, you can disable server-side rendering behavior with the following configuration:

```js

export default {
  ssr: {
    // Default is true
    devServerRender: false,
  },
}
```

## Data Pre-fetching

The data-fetching mechanism for server-side rendering is different from Single Page Applications (SPAs). To ensure that both the client and server receive the same data, Umi provides page-level data pre-fetching.

### Page-Level Data Pre-fetching

Each page may have its own data pre-fetching logic. Here, we retrieve the `getInitialProps` static method from the page component and inject its result into the component's `props`, for example:

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

export default Home;
```

The `getInitialProps` method has several fixed parameters:

- `match`: Contains relevant data about the current route, consistent with `match` in the client-side page props.
- `isServer`: Indicates whether the method is executed on the server side.
- `route`: Current route object.
- `history`: History object.

### Extending `ctx` Parameters

To integrate with data

-fetching, you can extend the `ctx` object parameters. For example:

```tsx
Home.getInitialProps = (async (ctx) => {
  ctx.params // url parameters
  ctx.query // query parameters
  ctx.req // request object, only available on the server side
  ctx.res // response object, only available on the server side
  ctx.pathname // current page path
  ctx.isMobile // indicates whether the client is a mobile device (judged by user-agent)
  ctx.initialState // for passing server-side data to the client side

  return Promise.resolve({
    data: {
      title: 'Hello World',
    }
  })
}) as IGetInitialProps;
```

Please note that if you need to use server-side data on the client side, you need to pass it to `ctx.initialState`. Umi will serialize `ctx.initialState` and pass it to the client side.

## Page-Level Document Configuration

You can configure the document of each page separately. Create a `document.ejs` file under the `src` directory of the page and customize it.

For example:

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
</head>
<body>
  <div id="root"></div>
  <% if (isDev) { %>
    <!-- Dev script, not needed in production -->
    <script src="/umi.js"></script>
  <% } else { %>
    <!-- Production script -->
    <script src="/umi.js"></script>
  <% } %>
</body>
</html>
```

## Deployment

Please refer to the [official documentation](https://umijs.org/docs/ssr) for SSR deployment details.

---

I hope this translation helps you understand Server-Side Rendering (SSR) in the context of Umi and its related features and configurations. If you have any more questions or need further assistance, please feel free to ask!
