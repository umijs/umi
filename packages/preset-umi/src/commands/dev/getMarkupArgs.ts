import cheerio from '@umijs/utils/compiled/cheerio';
import { IApi } from '../../types';

export async function getMarkupArgs(opts: { api: IApi }) {
  const headScripts = await opts.api.applyPlugins({
    key: 'addHTMLHeadScripts',
    initialValue: opts.api.config.headScripts || [],
  });
  const scripts: any = await opts.api.applyPlugins({
    key: 'addHTMLScripts',
    initialValue: opts.api.config.scripts || [],
  });
  const metas: any = await opts.api.applyPlugins({
    key: 'addHTMLMetas',
    initialValue: opts.api.config.metas || [],
  });
  const links: any = await opts.api.applyPlugins({
    key: 'addHTMLLinks',
    initialValue: opts.api.config.links || [],
  });
  const styles: any = await opts.api.applyPlugins({
    key: 'addHTMLStyles',
    initialValue: opts.api.config.styles || [],
  });
  const favicons = await opts.api.applyPlugins({
    key: 'modifyHTMLFavicon',
    initialValue: [].concat(opts.api.config.favicons || []),
  });
  return {
    mountElementId: opts.api.config.mountElementId,
    base:
      opts.api.config.history?.type === 'browser' ? opts.api.config.base : '/',
    routes: opts.api.appData.routes,
    favicons,
    headScripts,
    scripts,
    metas,
    links,
    styles,
    title: opts.api.config.title,
    async modifyHTML(memo: string, args: object) {
      let $ = cheerio.load(memo, {
        // @ts-ignore
        decodeEntities: false,
      });
      $ = await opts.api.applyPlugins({
        key: 'modifyHTML',
        initialValue: $,
        args,
      });
      let html = $.html();
      // TODO: prettier html
      // html = prettier.format(html, {
      //   parser: 'html',
      // });
      return html;
    },

    /**
     * 编译完成后，修改 html
     * 在 modifyHTML 和 modifyHTMLFavicon之后执行
     * modifyHTML 里面做了太多操作，为了防止顺序问题，所以新增一个钩子
     * @param html
     * @param args
     * @returns
     */
    async modifyHTMLmodifyHTMLOnComplete(
      html: string,
      args: {
        path: string;
      },
    ) {
      let newHtml = opts.api.applyPlugins({
        key: 'modifyHTMLOnComplete',
        initialValue: html,
        args,
      });
      return newHtml;
    },
  };
}
