# Server-Side Rendering (SSR)

## What is Server-Side Rendering?

> First, let's understand what it is and whether it fits our business scenario before deciding whether to use it.

Server-Side Rendering (SSR) is a page rendering technique where the HTML structure of a page is assembled on the **server side**, sent to the browser, and then the state and events are bound to it, turning it into a fully interactive page.

This might sound a bit academic, so let's make it clearer with two images.

The first image illustrates the difference between a Single Page Application (SPA) and a server-side rendered (SSR) site when it comes to **social sharing**:

![Social Sharing Difference](https://user-images.githubusercontent.com/13595509/68102160-5e66da00-ff0c-11e9-82e8-7c73cca1b20f.png)

The second image shows the difference in **initial load time** between SSR and CSR. SSR has less white screen time because it already has content when the HTML document returns (see Network):

![Initial Load Time Difference](https://user-images.githubusercontent.com/13595509/80308316-e74a3880-8800-11ea-9a20-2d9d153fe9d1.png)

Based on these two images, SSR is commonly used in the following two scenarios:

1. **SEO Requirements**: It's used for search engine indexing and social sharing, typically in frontend applications.
2. **Fast Initial Rendering**: It's used when there are requirements for fast initial rendering, often in mobile applications or under poor network conditions.

> In other words, if you're building an admin or backend application (such as antd pro or a management dashboard), think carefully about whether to use SSR.

## What is Pre-rendering?

Server-Side Rendering requires a backend server (usually Node.js) to work. If you don't have a backend server but still want to achieve the goals mentioned above, you can use **pre-rendering**.

The key difference between pre-rendering and server-side rendering is the **timing of rendering**. Server-side rendering happens when a user accesses the page (i.e., **server-side rendering**), and the data is generally the most up-to-date. Pre-rendering, on the other hand, occurs during project build time, and when a user accesses the page, the data might not be the most up-to-date (pre-rendering is suitable when data doesn't need to be real-time).

Pre-rendering (Pre Render) involves rendering during the build process to generate static HTML fragments. It doesn't require real-time dynamic HTML compilation by a web server and is suitable for **static site generation**.

## Umi Server-Side Rendering Features

> As early as Umi 2.8+, Umi already had SSR capabilities, but it had a higher learning curve for newcomers.

With Umi 3, significant optimizations and improvements have been made to SSR based on its specific business scenarios, offering the following features:

- **Out of the Box**: SSR is built-in and can be easily enabled with a single command, `umi dev`, making development and debugging convenient.
- **Server Framework Agnostic**: Umi doesn't couple with server frameworks like [Egg.js](https://eggjs.org/), [Express](https://expressjs.com/), or [Koa](https://koajs.com/). It can be integrated seamlessly with any framework or Serverless mode.
- **Support for Data Pre-fetching at the Application and Page Level**: Umi 3 continues the page data pre-fetching (getInitialProps) feature from Umi 2 to solve the problem of fetching global data in the previous version.
- **Support for Lazy Loading**: With `dynamicImport` enabled, Umi 3 will load corresponding resource files (CSS/JS) based on different routes.
- **Built-in Pre-rendering**: Umi 3 includes pre-rendering functionality out of the box. You no longer need to install additional plugins. Simply enable `ssr` and `exportStatic`, and Umi will compile the rendered HTML during `umi build`.
- **Support for Rendering Degradation**: Umi 3 prioritizes SSR. If server-side rendering fails, it automatically falls back to client-side rendering (CSR) without disrupting normal business processes.
- **Support for Streaming Rendering**: Enabling `ssr: { mode: 'stream' }` allows streaming rendering, which results in shorter [TTFB](https://baike.baidu.com/item/TTFB) (Time To First Byte) times compared to normal SSR.
- **Compatible with Client-Side Dynamic Loading**: In Umi 2, using both SSR and dynamicImport (dynamic loading) had some issues. In Umi 3, you can use them simultaneously.
- **Modular SSR Features**: While Umi 3's built-in SSR features are quite comprehensive, if your requirements are not met or you want to customize the rendering method, you can do so using the provided APIs.

## Enabling Server-Side Rendering

By default, server-side rendering is disabled. You need to enable it through configuration:

```javascript
export default {
  ssr: {},
}
```

## Development

Execute `umi dev` to access the page, and it will be server-side rendered.

![Server-Side Rendering in Development](https://user-images.githubusercontent.com/13595509/80309380-4743dd80-8807-11ea-9def-7bb43522dce3.png)

> [How to Determine Whether the Current Page Is SSR or CSR?](#how-to-determine-whether-the-current-page-is-ssr-or-csr)

If you're using it together with a backend framework in development mode, you can disable server-side rendering behavior under `umi dev` with the following configuration:

```javascript
export default {
  ssr: {
    // Defaults to true
    devServerRender: false,
  },
}
```

## Data Pre-fetching

Data retrieval in server-side rendering differs from Single Page Applications (SPAs). To ensure that both the client and server have access to the same data, Umi 3 provides **page-level data pre-fetching**.

### Page-Level Data Pre-fetching

Each page may have its own data pre-fetching logic. Here, we retrieve the `getInitialProps` static method from the page component, which is then executed, and its result is injected into the page component's `props`. For example:

```jsx
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

/** You can also use a class component:
class Home extends React.Component {
  static getInitialProps = (async (ctx) => {
    return Promise.resolve({
      data: {
        title: 'Hello World',
      }
    })
  }) as IGetInitialProps;

  render() {
    const { data } = props;
    return (
      <div>{data.title}</

div>
    )
  }
}
*/
export default Home;
```

> `getInitialProps` should be an `async` function. After switching to Umi 3, existing `getInitialProps` will work without any changes.

#### Data Pre-fetching Execution Timing

- **Server Side**: In server-side rendering, `getInitialProps` is executed on the server side, and the result is sent to the client as part of the initial HTML.

- **Client Side**: On the client side, `getInitialProps` is executed as a normal React lifecycle method (componentDidMount). It won't be executed during server-side rendering if `shouldPrefetch` is set to `false`. The data is passed to the component as `props`.

#### Data Pre-fetching in Detail

Let's break down how data pre-fetching works in Umi 3:

1. On the server side, when a user accesses a page, Umi 3 first routes the request to the appropriate page component.

2. If the page component has a `getInitialProps` method defined (it's optional), Umi 3 executes it and awaits the result.

3. Once the `getInitialProps` method completes (whether by resolving or rejecting the returned Promise), Umi 3 injects the result into the component's `props`.

4. The page component is then rendered with the pre-fetched data on the server side. The HTML is sent to the browser.

5. On the client side, when the browser receives the HTML, it also receives the pre-fetched data. The page component on the client side is rehydrated (React's term for initializing the component with existing data), and the data is used for rendering.

6. On subsequent client-side navigations within the app, `getInitialProps` will be executed on the client side, not on the server side, unless `shouldPrefetch` is set to `false`.

### API-Level Data Pre-fetching

In addition to page-level data pre-fetching with `getInitialProps`, Umi 3 also supports **API-level data pre-fetching**. This allows you to fetch data in the layout component (or any component) that wraps your pages and share that data with multiple pages.

API-level data pre-fetching can be achieved using the `getInitialProps` method in your layout component:

```javascript
// layouts/index.tsx
import { IGetInitialProps } from 'umi';

const Layout: React.FC = ({ children }) => {
  return (
    <div>
      {/* Your layout content */}
      {children}
    </div>
  );
};

Layout.getInitialProps = async (ctx) => {
  // Fetch data and return it as an object
  const data = await fetchData();

  return { data };
};

export default Layout;
```

In this example, the `Layout` component fetches data using `getInitialProps` and makes it available to all child pages wrapped by this layout. Child pages can access this data through their own `getInitialProps` or by simply accessing it from `props`.

### Caching Data Pre-fetched on the Server

To prevent redundant data fetching, you can use caching mechanisms when pre-fetching data on the server side. Caching helps improve the performance and efficiency of your SSR application.

Here's a basic example of caching pre-fetched data using the popular `lru-cache` library:

```javascript
// pages/index.tsx
import { IGetInitialProps } from 'umi';
import React from 'react';
import LRU from 'lru-cache';

const cache = new LRU({
  max: 500, // Maximum cache size
  maxAge: 1000 * 60 * 60, // Cache data for 1 hour
});

const fetchData = async () => {
  // Check if the data is in the cache
  const cachedData = cache.get('data');

  if (cachedData) {
    return cachedData;
  }

  // Fetch the data if it's not in the cache
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();

  // Store the data in the cache
  cache.set('data', data);

  return data;
};

const Home = (props) => {
  const { data } = props;
  return (
    <div>{data.title}</div>
  );
};

Home.getInitialProps = async (ctx) => {
  return {
    data: await fetchData(),
  };
};

export default Home;
```

In this example, we create a cache using `lru-cache` and use it to store fetched data. Before making a network request, we check if the data is already in the cache. If it is, we return the cached data; otherwise, we fetch it, store it in the cache, and return it.

This caching mechanism helps reduce the load on your server and improves the response time for subsequent requests for the same data.

Keep in mind that caching strategies may vary based on your specific requirements and the nature of your data. You can customize the caching logic to suit your needs.

### Data Pre-fetching Pitfalls

While data pre-fetching in server-side rendering is a powerful feature, it comes with some potential pitfalls and considerations:

1. **Error Handling**: Ensure that you handle errors properly when fetching data in `getInitialProps`. If a data fetch fails on the server side, it can result in a failed SSR response. You should handle errors gracefully and possibly return default data or an error message to avoid breaking the entire page.

2. **Data Hydration**: When pre-fetched data is passed to the client, make sure your client-side code can properly hydrate (initialize) components with this data. Mismatched data structures or unexpected null values can lead to client-side errors.

3. **Data Fetching Redundancy**: Be mindful of redundant data fetching. Consider implementing caching strategies to avoid fetching the same data multiple times, both on the server and client sides.

4. **Data Privacy**: Think about data privacy and security. Ensure that sensitive data is not exposed during server-side rendering and that any client-side data fetching adheres to security best practices.

5. **Performance Impact**: Excessive or inefficient data pre-fetching can negatively impact performance. Be aware of the performance implications of your data fetching logic and optimize it as needed.

6. **Client-Side Re-fetching**: By default, `getInitialProps` may re-fetch data on the client side when navigating between pages. If this behavior is not desired, consider using client-side state management or caching to avoid unnecessary data fetches.

7. **Loading Indicators**: Implement loading indicators or placeholders to provide a better user experience while data is being fetched, especially on the client side.

8. **Testing**: Test your data pre-fetching logic thoroughly to catch potential issues early. Pay attention to edge cases and error scenarios.

9. **Documentation**: Document your data pre-fetching patterns and conventions, especially if multiple team members are working on the project. Clear documentation can help ensure consistency and reduce confusion.

10. **Monitoring and Logging**: Implement monitoring and logging for data pre-fetching to track performance, detect errors, and troubleshoot issues in production.

### Conclusion

Data pre-fetching is a crucial aspect of server-side rendering in Umi 3. It enables you to fetch data on the server and include it in the initial HTML response, improving performance and SEO. By understanding the concepts and best

 practices of data pre-fetching, you can build efficient and fast-rendering React applications with Umi 3.
