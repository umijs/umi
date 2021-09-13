import {
  Configuration,
  container,
} from '@umijs/bundler-webpack/compiled/webpack';
import { MF_VA_PREFIX } from './constants';

interface IOpts {
  mfName: string;
}

export class MFSU {
  public opts: IOpts;
  constructor(opts: IOpts) {
    this.opts = opts;
  }

  async updateWebpackConfig(opts: { config: Configuration }) {
    const { mfName } = this.opts;
    opts.config.plugins = opts.config.plugins || [];
    opts.config.plugins!.push(
      new container.ModuleFederationPlugin({
        name: '__',
        remotes: {
          [mfName]: `${mfName}@${MF_VA_PREFIX}remoteEntry.js`,
        },
      }),
    );
  }

  async getMiddlewares() {
    // @ts-ignore
    return [(req, res, next) => {}];
  }

  async getBabelPlugins() {
    return [];
  }
}
