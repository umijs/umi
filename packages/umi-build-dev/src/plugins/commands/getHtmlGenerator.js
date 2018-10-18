import cheerio from 'cheerio';
import HtmlGenerator from '../../html/HTMLGenerator';

export default (service, opts = {}) => {
  const { config, paths, webpackConfig, routes } = service;
  const { chunksMap } = opts;
  return new HtmlGenerator({
    config,
    paths,
    routes,
    publicPath: webpackConfig.output.publicPath,
    chunksMap,
    modifyContext(context, opts = {}) {
      const { route } = opts;
      return service.applyPlugins('modifyHTMLContext', {
        initialValue: context,
        args: { route },
      });
    },
    modifyRouterBaseStr(str) {
      return str;
    },
    modifyPublicPathStr(str) {
      return str;
    },
    modifyChunks(memo, opts = {}) {
      const { route } = opts;
      return service.applyPlugins('modifyHTMLChunks', {
        initialValue: memo,
        args: { route },
      });
    },
    modifyMetas(memo, opts = {}) {
      const { route } = opts;
      return service.applyPlugins('addHTMLMeta', {
        initialValue: memo,
        args: { route },
      });
    },
    modifyLinks(memo, opts = {}) {
      const { route } = opts;
      return service.applyPlugins('addHTMLLink', {
        initialValue: memo,
        args: { route },
      });
    },
    modifyScripts(memo, opts = {}) {
      const { route } = opts;
      return service.applyPlugins('addHTMLScript', {
        initialValue: memo,
        args: { route },
      });
    },
    modifyStyles(memo, opts = {}) {
      const { route } = opts;
      return service.applyPlugins('addHTMLStyle', {
        initialValue: memo,
        args: { route },
      });
    },
    modifyHeadScripts(memo, opts = {}) {
      const { route } = opts;
      return service.applyPlugins('addHTMLHeadScript', {
        initialValue: memo,
        args: { route },
      });
    },
    modifyHTML(memo, opts = {}) {
      const { route, getChunkPath } = opts;
      const $ = cheerio.load(memo);
      service.applyPlugins('modifyHTMLWithAST', {
        initialValue: $,
        args: {
          route,
          getChunkPath,
        },
      });
      return $.html();
    },
  });
};
