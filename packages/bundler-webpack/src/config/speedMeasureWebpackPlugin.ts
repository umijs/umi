import { join } from 'path';
// @ts-ignore
import SpeedMeasurePlugin from '../../compiled/speed-measure-webpack-plugin';
import { Configuration } from '../../compiled/webpack';

interface IOpts {
  webpackConfig: Configuration;
}

export async function addSpeedMeasureWebpackPlugin(opts: IOpts) {
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
