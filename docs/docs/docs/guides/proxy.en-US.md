---
order: 6
toc: content
translated_at: '2024-03-17T10:23:20.172Z'
---

# Proxy

> A proxy, also known as a network proxy, is a special network service that allows one endpoint (usually the client) to connect indirectly to another endpoint (usually the server). - [Wikipedia](https://zh.wikipedia.org/wiki/%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1%E5%99%A8)

In project development (dev), all network requests (including resource requests) are responded to and dispatched through a local server. We use the [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) middleware to proxy specified requests to another target server. For example, the request `fetch('/api')` to retrieve data from the remote `http://jsonplaceholder.typicode.com/`.

To achieve the above requirement, we only need to use proxy configuration in the configuration file:

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

The above configuration indicates that requests with the `/api` prefix are proxied to `http://jsonplaceholder.typicode.com/`, replacing `/api` in the request address with `''`, and changing the request origin to the target URL. For instance, a request to `/api/a` is actually requesting `http://jsonplaceholder.typicode.com/a`.

We generally use this capability to solve cross-origin access problems in development. Due to the same-origin policy in browsers (or webview), we used to have the server support the Cross-Origin Resource Sharing (CORS) policy to circumvent cross-origin access issues. Now with local node services, we can use proxies to address this problem.

> XMLHttpRequest cannot load https://api.example.com. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:8000' is therefore not allowed access.

The principle is actually quite simple - browsers have cross-origin issues, but servers do not. We request the local service of the same origin, which then requests the remote service of a different origin. It's important to note that proxying requests means proxying the request service and does not directly modify the original request URL. It just passes the data returned by the target server to the front-end. Therefore, the request URL you see in the browser is still `http://localhost:8000/api/a`.

It's worth noting that proxy can only solve the cross-origin access problem during development (dev) and can be used in same-origin deployment when deploying. If a cross-origin problem occurs in production (build), similar configurations can be transferred to the Nginx container.
