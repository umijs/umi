import type {
  Compilation,
  Compiler,
} from '@umijs/bundler-webpack/compiled/webpack';
import { sources } from '@umijs/bundler-webpack/compiled/webpack';
import { fsExtra } from '@umijs/utils';
import { writeFileSync } from 'fs';
import { extname, join } from 'path';
import Config from '../../compiled/webpack-5-chain';
import { MFSU_NAME } from '../constants';
import { Env, IConfig } from '../types';

interface IOpts {
  name?: string;
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

const PLUGIN_NAME = 'SSR_PLUGIN';

class SSRPlugin {
  opts: IOpts;
  manifest: Map<string, string>;
  constructor(opts: IOpts) {
    this.opts = opts;
    this.manifest = new Map();
  }
  apply(compiler: Compiler) {
    // ref: https://github.com/webdeveric/webpack-assets-manifest
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation: Compilation) => {
      compilation.hooks.processAssets.tap(PLUGIN_NAME, () => {
        const publicPath = compiler.options.output.publicPath || '/';
        const assets = compilation.getAssets().filter((asset) => {
          if (asset.info.hotModuleReplacement) {
            return false;
          }
          return true;
        });
        assets.forEach((asset) => {
          if (asset.info.sourceFilename) {
            this.manifest.set(
              asset.info.sourceFilename,
              publicPath + asset.name,
            );
          }
        });
        const stats = compilation.getStats().toJson({
          all: false,
          assets: true,
          cachedAssets: true,
          cachedModules: true,
        });
        const { assetsByChunkName } = stats;
        Object.keys(assetsByChunkName!).forEach((chunkName) => {
          assetsByChunkName![chunkName].forEach((filename) => {
            const ext = extname(filename.split(/[?#]/)[0]);
            if (!filename.includes('.hot-update.')) {
              this.manifest.set(chunkName + ext, publicPath + filename);
            }
          });
        });

        const assetsSource = JSON.stringify(
          {
            assets: Object.fromEntries(this.manifest),
          },
          null,
          2,
        );
        if (
          process.env.NODE_ENV === 'production' ||
          this.opts.userConfig.writeToDisk
        ) {
          compilation.emitAsset(
            'build-manifest.json',
            new sources.RawSource(assetsSource, false),
          );
        } else {
          const outputPath = compiler.options.output.path!;
          fsExtra.mkdirpSync(outputPath);
          writeFileSync(
            join(outputPath, 'build-manifest.json'),
            assetsSource,
            'utf-8',
          );
        }
      });
    });
  }
}

export default function addSSRPlugin(opts: IOpts) {
  if (opts.userConfig.ssr && opts.name !== MFSU_NAME) {
    opts.config.plugin('ssr-plugin').use(SSRPlugin, [opts]);
  }
}
