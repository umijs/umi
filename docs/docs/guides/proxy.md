# Proxy

> A proxy, also known as a network proxy, is a special kind of network service that allows one endpoint (usually a client) to establish a non-direct connection with another endpoint (usually a server). - [Wikipedia](https://en.wikipedia.org/wiki/Proxy_server)

During project development (dev), all network requests (including resource requests) are dispatched through a local server, which uses the [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) middleware to proxy specified requests to another target server. For example, sending a request `fetch('/api')` retrieves data from the remote `http://jsonplaceholder.typicode.com/`.

To achieve this requirement, you only need to use the proxy configuration in your configuration file:

```ts
export default {
  proxy: {
    '/api': {
      'target': 'http://jsonplaceholder.typicode.com/',
      'changeOrigin': true,
      'pathRewrite': { '^/api' : '' },
    },
  },
}
```

In the above configuration, requests with the `/api` prefix are proxied to `http://jsonplaceholder.typicode.com/`. The `/api` part in the request address is replaced with `''`, and the source of the request is changed to the target URL. For example, a request to `/api/a` actually makes a request to `http://jsonplaceholder.typicode.com/a`.

Generally, we use this capability to address cross-origin access issues during development. Due to the same-origin policy enforced by browsers (or webviews), we used to require server-side cooperation using Cross-Origin Resource Sharing (CORS) policies to bypass cross-origin access issues. Now, with a local Node.js server, we can use proxy to solve this problem.

> XMLHttpRequest cannot load https://api.example.com. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:8000' is therefore not allowed access.

The principle is quite simple: there is a cross-origin issue in the browser, but not on the server. We send requests to our local same-origin server, which then requests the remote non-same-origin server. It's important to note that request proxying affects the server being requested and doesn't directly modify the request URL being initiated. It simply forwards the data returned by the target server to the frontend. Therefore, the request address you see in your browser will still be `http://localhost:8000/api/a`.



