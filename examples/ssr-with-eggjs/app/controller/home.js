const { Controller } = require('egg');
const restaurants = require('../data/restaurants.json');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    global.host = `${ctx.request.protocol}://${ctx.request.host}`;
    global.href = ctx.request.href;
    const render = require('../public/umi.server');
    const { err, html } = await render({
      path: ctx.request.url,
    });
    if (err) {
      ctx.body = '404 Not Found';
      return;
    }

    ctx.body = html;
  }

  async api() {
    const { ctx } = this;
    if (ctx.path.indexOf('restaurants') > -1) {
      ctx.status = 200;
      ctx.body = restaurants;
      return false;
    }

    const url = `https://h5.ele.me${ctx.path.replace(/^\/api/, '')}?${
      ctx.querystring
    }`;

    const res = await this.ctx.curl(url, {
      method: this.ctx.method,
    });
    ctx.body = res.data;
    ctx.status = res.status;
  }
}

module.exports = HomeController;
