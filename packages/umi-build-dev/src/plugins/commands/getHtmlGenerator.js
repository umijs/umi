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
  });
};
