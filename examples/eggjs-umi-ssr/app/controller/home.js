'use strict';

const { Controller } = require('egg');
const { join } = require('path');

class HomeController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.umiServerPath = join(__dirname, '..', 'public', 'umi.server.js');
  }

  async index() {
    const { ctx } = this;
    const { env } = ctx.app.config;
    if (env === 'local') {
      delete require.cache[require.resolve(this.umiServerPath)];
    }
    global.window = {};
    // eslint-disable-next-line
    const serverRender = require(`${this.umiServerPath}`);
    const { ReactDOMServer } = serverRender;

    const { htmlElement } = await serverRender.default(ctx);

    const ssrContent = ReactDOMServer.renderToString(htmlElement);

    await ctx.render('index.html', {
      ssrContent,
    });
  }

  async api() {
    const ctx = this.ctx;

    const url = 'https://h5.ele.me' + ctx.path.replace(/^\/api/, '') + '?' + ctx.querystring;

    console.log(url);
    const res = await this.ctx.curl(url, {
      method: this.ctx.method,
    });
    ctx.body = res.data;
    ctx.status = res.status;
  }
}

module.exports = HomeController;
