# Server-Side Rendering (SSR)

## What is Server-Side Rendering?

First, let's understand what it is and whether it fits our business scenario before deciding whether to use it.

Server-Side Rendering (SSR) refers to the process of rendering the HTML structure of a page on the server side, sending it to the browser, and then binding the state and events to make it a fully interactive page.

This may sound a bit academic, so let's clarify it with two images.

The first image illustrates the difference between a Single Page Application (SPA) and a server-side rendered (SSR) site when it comes to **social sharing**:

![SPA vs. SSR for Social Sharing](https://user-images.githubusercontent.com/13595509/68102160-5e66da00-ff0c-11e9-82e8-7c73cca1b20f.png)

The second image shows the difference in **initial loading time** between SSR and CSR. SSR generally has a shorter time to the first byte (TTFB) because the corresponding content is already present when the HTML document is returned (see Network):

![SSR vs. CSR Initial Loading Time](https://user-images.githubusercontent.com/13595509/80308316-e74a3880-8800-11ea-9a20-2d9d153fe9d1.png)

From these two images, we can see that SSR is commonly used in the following two scenarios:

1. **SEO Requirements**: Used for search engine indexing and social sharing, typically in frontend applications.
2. **First Screen Rendering Performance**: Used when there are performance requirements for the initial rendering, especially on mobile devices or in low network conditions.

In other words, if you are building a backend-heavy application (such as antd pro or admin dashboards), you should carefully consider whether to use SSR.

## What is Pre-rendering?

Server-Side Rendering requires a backend server (usually Node.js) to be available. If you don't have a backend server but want to achieve the same benefits in the scenarios mentioned above, you can use **pre-rendering**.

The only difference between pre-rendering and server-side rendering is the **timing** of rendering. Server-Side Rendering renders when a user accesses the page (i.e., **server-side rendering**), and the data is usually the latest. Pre-rendering, on the other hand, renders during project build time, so the data may not be the latest (if real-time data is not required).

Pre-rendering (Pre Render) performs rendering during project build, generating static HTML fragments. It doesn't require real-time compilation of HTML on a web server and is suitable for **static site generation**.

## Umi Server-Side Rendering Features

Starting from Umi 2.8+, Umi had SSR capabilities. However, for newcomers, it had a relatively high learning curve.

In Umi 3, significant optimizations and improvements have been made to SSR in line with real-world business scenarios, resulting in the following features:

- **Out of the Box**: SSR is built-in and can be easily enabled with a single command, `umi dev` for SSR preview, making development and debugging convenient.
- **Server Framework Agnostic**: Umi does not tightly couple with server frameworks (e.g., [Egg.js](https://eggjs.org/), [Express](https://expressjs.com/), [Koa](https://koajs.com/)). It can be easily integrated with any framework or Serverless mode.
- **Support for Application and Page-Level Data Pre-fetching**: Umi 3 continues the page data pre-fetching feature (getInitialProps) from Umi 2 to address the previous challenge of global data retrieval.
- **Support for On-Demand Loading**: With `dynamicImport` enabled, Umi 3 loads corresponding resource files (CSS/JS) based on different routes.
- **Built-In Pre-rendering**: Umi 3 includes pre-rendering functionality out of the box, no need to install additional plugins. When `ssr` and `exportStatic` are enabled, it compiles the rendered HTML during `umi build`.
- **Support for Rendering Degradation**: Umi 3 prioritizes SSR but automatically falls back to Client-Side Rendering (CSR) if server-side rendering fails, without disrupting normal business processes.
- **Support for Streaming Rendering**: Enabling `ssr: { mode: 'stream' }` enables streaming rendering, resulting in shorter [Time to First Byte (TTFB)](https://en.wikipedia.org/wiki/Time_to_first_byte) time compared to normal SSR.
- **Compatible with Client-Side Dynamic Loading**: Umi 3 allows simultaneous use of SSR and dynamicImport (dynamic loading) without issues.
- **Modular SSR Functionality**: Umi 3's built-in SSR functionality is sufficient for most use cases, but if it doesn't meet your needs or you want to customize the rendering method, you can do so through the provided API.

## Enabling Server-Side Rendering

By default, server-side rendering is disabled. You need to enable it through configuration:

```js
export default {
  ssr: {},
}
```

## Development

Execute `umi dev`, access the page, and you'll see server-side rendering in action.

![Server-Side Rendering in Development](https://user-images.githubusercontent.com/13595509/80309380-4743dd80-8807-11ea-9def-7bb43522dce3.png)

> [How to Determine If the Current Page Is SSR or CSR?](#how-to-determine-if-the-current-page-is-ssr-or-csr)

If you're using it alongside a backend framework during development, you can disable server-side rendering behavior in `umi dev` through configuration:

```js

export default {
  ssr: {
    // Default is true
    devServerRender: false,
  },


}
```

## Configuration

Umi 3's SSR configuration is simple and clear, and you can use a variety of options to meet your business needs.

The default configuration is as follows:

```js
export default {
  ssr: {
    devServerRender: true,
    mode: 'stream',
  },
}
```

- `devServerRender`: Determines whether server-side rendering is enabled during development. The default is `true`. If set to `false`, the server will not perform rendering during development, and it will be up to you to determine whether the current page is in CSR or SSR mode.
- `mode`: The server-side rendering mode. The default is `'stream'`, which means streaming rendering is enabled. In streaming mode, the server renders and sends the HTML content in chunks as it's generated, resulting in a faster [Time to First Byte (TTFB)](https://en.wikipedia.org/wiki/Time_to_first_byte) compared to non-streaming mode. If you don't need streaming rendering, you can set it to `'normal'`.

These configurations can be adjusted according to your needs.

## How to Determine If the Current Page Is SSR or CSR?

If `devServerRender` is enabled, you can use the following methods to determine whether the current page is in SSR or CSR mode:

### 1. Use `window.G_USE_SSR` in JavaScript

In JavaScript code, you can check the `window.G_USE_SSR` global variable to determine if the page is in SSR mode:

```javascript
if (window.G_USE_SSR) {
  // Server-side rendering (SSR) mode
} else {
  // Client-side rendering (CSR) mode
}
```

This variable is automatically set by Umi based on the SSR configuration.

### 2. Use `isServer()` in JavaScript

You can also use the `isServer()` function provided by Umi to check if the current code is running on the server side:

```javascript
import { isServer } from 'umi';

if (isServer()) {
  // Server-side rendering (SSR) mode
} else {
  // Client-side rendering (CSR) mode
}
```

This function returns `true` if the code is running on the server side and `false` if it's running on the client side.

### 3. Use `window.G_SSR_ENV` in Template

In template files (e.g., JSX or EJS), you can check the `window.G_SSR_ENV` variable to determine if the page is in SSR mode:

```jsx
{window.G_SSR_ENV ? (
  <div>Server-side rendering (SSR) mode</div>
) : (
  <div>Client-side rendering (CSR) mode</div>
)}
```

This variable is automatically set by Umi based on the SSR configuration.

These methods allow you to conditionally render content or execute code based on whether the page is in SSR or CSR mode, giving you control over the behavior of your application.

## Deployment

When deploying your Umi SSR application to production, you need to ensure that the server is properly configured to handle SSR requests. Here are the general steps for deploying a Umi SSR application:

1. **Build the Application**: Use the `umi build` command to build your Umi application. This command will generate the necessary files for production deployment.

```bash
umi build
```

2. **Set Up a Production Server**: You'll need a production server to host your Umi SSR application. This server can be based on Node.js or any other compatible environment.

3. **Configure Server Routing**: Configure your production server to handle SSR requests. You'll typically need to create a server file that sets up routing and SSR rendering. In Umi, you can use the `umi.server.js` file for this purpose.

Here's an example of a simple Node.js server file for Umi SSR:

```javascript
const express = require('express');
const { createServer } = require('http');
const { render } = require('@umijs/server');
const { join } = require('path');

const app = express();

// Serve static files (e.g., CSS, JavaScript) from the "dist" directory
app.use(express.static(join(__dirname, 'dist')));

app.get('*', async (req, res) => {
  const { error, html } = await render({
    cwd: __dirname,
    path: req.url,
    getInitialPropsCtx: {},
    mode: 'stream', // Use 'stream' mode for SSR
  });

  if (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } else {
    res.write(html);
    res.end();
  }
});

const server = createServer(app);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

4. **Set Environment Variables**: Configure any necessary environment variables for your production server, such as the port number and other server-specific settings.

5. **Start the Production Server**: Start your production server to make your Umi SSR application accessible to users.

6. **Deploy to Hosting Provider**: Deploy your production server and Umi SSR application to a hosting provider or server infrastructure of your choice. This could be a cloud hosting platform, a dedicated server, or a containerized environment, depending on your needs.

7. **Monitor and Optimize**: Monitor your SSR application in production and optimize it for performance, scalability, and reliability as needed.

Keep in mind that the exact deployment process may vary depending on your hosting environment and requirements. Make sure to follow best practices for securing and maintaining your production server.

## Conclusion

Server-Side Rendering (SSR) in Umi.js offers a powerful way to improve SEO, initial loading performance, and user experience in your React-based applications. It enables you to pre-render pages on the server side and deliver them as fully interactive HTML, making your content more accessible to search engines and users.

By following the steps outlined in this guide, you can enable SSR in your Umi.js application, configure it for development and production, and deploy it to a production server. Whether you're building a single-page app or a complex web application, SSR can be a valuable tool in your toolkit for achieving better SEO and faster initial loading times.

As you work with Umi SSR, be sure to explore its documentation and stay up-to-date with any updates or changes to the framework. Additionally, consider implementing best practices for SEO, performance optimization, and server-side rendering to get the most out of your SSR-enabled Umi.js application.
