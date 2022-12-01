// @ts-ignore
import SpeedMeasurePlugin from '@umijs/bundler-webpack/compiled/speed-measure-webpack-plugin';
import { Configuration } from '@umijs/bundler-webpack/compiled/webpack';
import { join } from 'path';

interface IOpts {
  webpackConfig: Configuration;
}

export async function addSpeedMeasureWebpackPlugin(opts: IOpts) {
  let webpackConfig = opts.webpackConfig;
  if (process.env.SPEED_MEASURE) {
    const miniCssExtractPluginIdx = webpackConfig.plugins?.findIndex(
      (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin',
    );
    const miniCssExtractPlugin =
      webpackConfig.plugins?.[miniCssExtractPluginIdx!];

    const smpOption =
      process.env.SPEED_MEASURE === 'JSON'
        ? {
            outputFormat: 'json',
            outputTarget: join(process.cwd(), 'SPEED_MEASURE.json'),
          }
        : { outputFormat: 'human', outputTarget: console.log };
    webpackConfig = new SpeedMeasurePlugin(smpOption).wrap(webpackConfig);

    // https://github.com/stephencookdev/speed-measure-webpack-plugin/issues/167#issuecomment-1318684127
    if (miniCssExtractPlugin) {
      webpackConfig.plugins![miniCssExtractPluginIdx!] = miniCssExtractPlugin;
    }
  }
  return webpackConfig;
}
