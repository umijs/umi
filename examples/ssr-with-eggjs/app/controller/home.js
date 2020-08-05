const { Controller } = require('egg');
const render = require('../public/umi.server');

class HomeController extends Controller {
  async index() {
    const { ctx, app } = this;
    global.host = `${ctx.request.protocol}://${ctx.request.host}`;
    global.href = ctx.request.href;
    global._cookies = ctx.helper.parseCookie(ctx);
    global._navigatorLang = ctx.helper.parseNavLang(ctx);
    /**
     *  这里可以根据自己的环境配置修改，
     *  规则就是开发环境需要删除require缓存
     *  重新load文件
     *
     */

    ctx.type = 'text/html';
    ctx.status = 200;
    const { err, html } = await render({
      path: ctx.request.url,
      mode: 'stream',
    });

    if (err) {
      ctx.body = '404 Not Found';
      return;
    }
    const isDev = app.config.env != 'prod';
    if (isDev) {
      delete require.cache[require.resolve('../public/umi.server')];
    }
    ctx.body = html;
  }
}

module.exports = HomeController;
