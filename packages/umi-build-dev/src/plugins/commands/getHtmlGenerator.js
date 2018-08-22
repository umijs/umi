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
    modifyContext(context, route) {
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
    modifyMetas(memo) {
      return service.applyPlugins('addHTMLMeta', {
        initialValue: memo,
      });
    },
    modifyLinks(memo) {
      return service.applyPlugins('addHTMLLink', {
        initialValue: memo,
      });
    },
    modifyScripts(memo) {
      return service.applyPlugins('addHTMLScript', {
        initialValue: memo,
      });
    },
    modifyStyles(memo) {
      return service.applyPlugins('addHTMLStyle', {
        initialValue: memo,
      });
    },
    modifyHeadScripts(memo) {
      return service.applyPlugins('addHTMLHeadScript', {
        initialValue: memo,
      });
    },
    modifyHTML(memo, { route }) {
      const $ = cheerio.load(memo);
      service.applyPlugins('modifyHTMLWithAST', {
        initialValue: $,
        args: {
          route,
        },
      });
      return $.html();
    },
  });
};
