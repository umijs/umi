const { Controller } = require('egg');

class HomeController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.serverRender = require('../public/umi.server');
  }
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

    const isDev = app.config.env != 'prod';
    if (isDev) {
      delete require.cache[require.resolve('../public/umi.server')];
    }

    // 先走 eggjs 的v iew 渲染
    const htmlTemplate = await ctx.view.render('index.html');

    // 将 html 模板传到服务端渲染函数中
    const { error, html } = await this.serverRender({
      path: ctx.url,
      mode: 'stream',
      getInitialPropsCtx: {},
      htmlTemplate,
    });

    if (error) {
      ctx.logger.error(
        '[SSR ERROR] 渲染报错，切换至客户端渲染',
        error,
        ctx.url,
      );
    }
    ctx.type = 'text/html';
    ctx.status = 200;
    ctx.body = html;
  }
}

module.exports = HomeController;
