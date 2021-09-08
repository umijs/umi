// @ts-ignore
import SpeedMeasurePlugin from '@umijs/bundler-webpack/compiled/speed-measure-webpack-plugin';
import { Configuration } from '@umijs/bundler-webpack/compiled/webpack';
import { join } from 'path';

interface IOpts {
  webpackConfig: Configuration;
}

export async function applySpeedMeasureWebpackPlugin(opts: IOpts) {
  let webpackConfig = opts.webpackConfig;
  if (process.env.SPEED_MEASURE) {
    const smpOption =
      process.env.SPEED_MEASURE === 'JSON'
        ? {
            outputFormat: 'json',
            outputTarget: join(process.cwd(), 'SPEED_MEASURE.json'),
          }
        : { outputFormat: 'human', outputTarget: console.log };
    webpackConfig = new SpeedMeasurePlugin(smpOption).wrap(webpackConfig);
  }
  return webpackConfig;
}
