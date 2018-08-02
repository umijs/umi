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
    modifyContext(context) {
      return service.applyPlugins('modifyHTMLContext', {
        initialValue: context,
      });
    },
    modifyRouterBaseStr(str) {
      return str;
    },
    modifyPublicPathStr(str) {
      return str;
    },
    modifyMetas(memo) {
      return service.applyPlugins('addHTMLMetas', {
        initialValue: memo,
      });
    },
    modifyLinks(memo) {
      return service.applyPlugins('addHTMLLinks', {
        initialValue: memo,
      });
    },
    modifyScripts(memo) {
      return service.applyPlugins('addHTMLScripts', {
        initialValue: memo,
      });
    },
    modifyHeadScripts(memo) {
      return service.applyPlugins('addHTMLHeadScripts', {
        initialValue: memo,
      });
    },
    modifyHTML(memo, { route }) {
      return memo;
    },
  });
};
