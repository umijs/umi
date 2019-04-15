const Koa = require('koa');
const app = new Koa();
const proxy = require('koa-proxy');
const path = require('path');
const { renderToNodeStream } = require('react-dom/server');
const env = process.env.NODE_ENV;

global.window = {
  console,
  __isBrowser__: false,
  __UMI_BIGFISH_COMPAT: process.env.BIGFISH_COMPAT,
};

app.use(async (ctx, next) => {
  // 符合要求的路由才进行服务端渲染，否则走静态文件逻辑
  if (ctx.req.url === '/') {
    ctx.type = 'text/html';
    ctx.status = 200;
    const isLocal = env === 'development';
    if (isLocal) {
      // 本地开发环境下每次刷新的时候清空require服务端文件的缓存，保证服务端与客户端渲染结果一致
      delete require.cache[path.resolve(__dirname, './dist/umi.server.js')];
    }
    const serverStream = require('./dist/umi.server');
    const serverRes = await serverStream.default(ctx);
    const stream = renderToNodeStream(serverRes);
    ctx.body = stream;
  } else {
    await next();
  }
});

app.use(require('koa-static')(path.resolve(__dirname, './dist')));

app.use(
  proxy({
    host: 'http://127.0.0.1:8000', // 本地开发的时候代理前端打包出来的资源地址
    match: /(\/sockjs-node)|(\/__webpack_dev_server__)|(jpg|png)|hot-update|.(js|css)/,
  }),
);
app.listen(7001, () => {
  console.log('server listening on 7001');
});
