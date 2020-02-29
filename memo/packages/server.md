# @umijs/server

基于 [Express](https://expressjs.com/) 的本地开发服务器，抽出所有构建工具在本地开发时的服务端部分。

达到的效果是，`umi dev` 抹平构建工具（webpack、rollup、...) 本地开发服务器差异。

`@umijs/server` 内置 [Proxy](#Proxy) 代理、[Mock](#Mock)

## 扩展中间件

提供 `beforeMiddlewares`、`compilerMiddleware`、`afterMiddlewares` 参数来扩展 Server 中间件能力，并按顺序进行调用。

```js
const server = new Server({
  // 编译前添加的中间件
  beforeMiddlewares: [],
  compilerMiddleware: (req, res, next) => {
    // 编译时中间件
    if (req.path === '/compiler') {
      res.end('compiler');
    } else {
      next();
    }
  },
  // 编译后添加的中间件
  afterMiddlewares: [],
});
```

## Proxy

提供代理能力，解决联调过程中的前端跨域问题。

使用了 [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) 包。更多高级用法，请查阅其 [文档](https://github.com/chimurai/http-proxy-middleware#options)。

```js
const server = new Server({
  proxy: {
    '/api': {
      target: 'http://jsonplaceholder.typicode.com/',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});
```

然后访问 `/api/users` 就能访问到 [http://jsonplaceholder.typicode.com/users](http://jsonplaceholder.typicode.com/users) 的数据。

## Mock
