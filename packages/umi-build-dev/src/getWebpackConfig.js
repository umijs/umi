import getConfig from 'af-webpack/getConfig';
import assert from 'assert';

export default function(service) {
  // 修改传给 af-webpack 的配置项
  const afWebpackOpts = service.applyPlugins('modifyAFWebpackOpts', {
    initialValue: {},
  });

  assert(
    !('chainConfig' in afWebpackOpts),
    `chainConfig should not supplied in modifyAFWebpackOpts`,
  );
  afWebpackOpts.chainConfig = webpackConfig => {
    service.applyPlugins('chainWebpackConfig', {
      args: { webpackConfig },
    });
  };

  // 通过 webpack-chain 扩展 webpack 配置
  let webpackConfig = getConfig(afWebpackOpts);

  // 直接修改 webpack 对象
  // deprecated
  webpackConfig = service.applyPlugins('modifyWebpackConfig', {
    initialValue: webpackConfig,
  });

  return webpackConfig;
}
