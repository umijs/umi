const Koa = require('koa');
const compress = require('koa-compress');
const mount = require('koa-mount');
const { join, extname } = require('path');
const { parseCookie, parseNavLang } = require('./serverHelper');

const root = join(__dirname, 'dist');

const app = new Koa();
app.use(
  compress({
    threshold: 2048,
    gzip: {
      flush: require('zlib').constants.Z_SYNC_FLUSH,
    },
    deflate: {
      flush: require('zlib').constants.Z_SYNC_FLUSH,
    },
    br: false, // 禁用br解决https gzip不生效加载缓慢问题
  }),
);

let render;
app.use(async (ctx, next) => {
  /**
   *  扩展global对象
   *
   *  这里是在服务端处理好cookie，
   *  会把所有cookie处理成{}形式
   *  赋值到global上面，方便客户端使用
   *
   *  同时获取浏览器的默认语言，处理好
   */
  global._cookies = parseCookie(ctx);
  global._navigatorLang = parseNavLang(ctx);

  const ext = extname(ctx.request.path);
  // 符合要求的路由才进行服务端渲染，否则走静态文件逻辑
  if (!ext) {
    if (!render) {
      render = require('./dist/umi.server');
    }
    // 这里默认是字符串渲染
    ctx.type = 'text/html';
    ctx.status = 200;
    const { html, error } = await render({
      path: ctx.request.url,
    });
    if (error) {
      console.log('----------------服务端报错-------------------', error);
      ctx.throw(500, error);
    }
    ctx.body = html;
  } else {
    await next();
  }
});

/**
 *  注意这里的静态目录设置，需要和umi打包出来的目录是同一个
 *  这里最好是用nginx配置静态目录，如果是用cdn方式部署，这里可以忽略
 *
 */
app.use(mount('/dist', require('koa-static')(root)));

app.listen(7001);
console.log('http://localhost:7001');

module.exports = app.callback();
