import { IConfig } from '@umijs/types';
import webpack from 'webpack';
import getConfig, { IOpts as IGetConfigOpts } from './getConfig/getConfig';

interface IOpts {
  cwd: string;
  config: IConfig;
}

class Bundler {
  static id = 'webpack';
  cwd: string;
  config: IConfig;

  constructor({ cwd, config }: IOpts) {
    this.cwd = cwd;
    this.config = config;
  }

  getConfig(opts: {
    type: string;
    env: 'development' | 'production';
  }): webpack.Configuration {
    return getConfig({
      ...opts,
      cwd: this.cwd,
      config: this.config,
    });
  }

  async build({
    bundleConfigs,
  }: {
    bundleConfigs: webpack.Configuration[];
  }): Promise<{ stats: webpack.Stats }> {
    return new Promise((resolve, reject) => {
      const compiler = webpack(bundleConfigs);
      compiler.run((err, stats) => {
        if (err || stats.hasErrors()) {
          console.log(stats.toString('errors-only'));
          return reject(new Error('build failed'));
        }
        resolve({ stats });
      });
    });
  }

  async dev() {}
}

export { Bundler };
