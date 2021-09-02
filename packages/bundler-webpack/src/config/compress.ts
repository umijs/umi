import TerserPlugin from '../../compiled/terser-webpack-plugin';
import Config from '../../compiled/webpack-5-chain';
import { Env, IConfig, JSMinifier } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function applyCompress(opts: IOpts) {
  const { config, userConfig } = opts;
  const minifier = userConfig.jsMinifier || JSMinifier.esbuild;

  if (minifier === JSMinifier.none) {
    config.optimization.minimize(false);
    return;
  }

  let minify: any;
  if (minifier === JSMinifier.esbuild) {
    minify = TerserPlugin.esbuildMinify;
  } else if (minifier === JSMinifier.terser) {
    minify = TerserPlugin.terserMinify;
  } else if (minifier === JSMinifier.swc) {
    minify = TerserPlugin.swcMinify;
  } else if (minifier === JSMinifier.uglifyJs) {
    minify = TerserPlugin.uglifyJsMinify;
  } else {
    throw new Error(`Unsupported jsMinifier ${userConfig.jsMinifier}.`);
  }

  config.optimization.minimize(true);
  config.optimization.minimizer(minifier).use(TerserPlugin, [
    {
      minify,
      terserOptions: {},
    },
  ]);
}
