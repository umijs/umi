import { Bundler as DefaultBundler, webpack } from '@umijs/bundler-webpack';
import { BundlerConfigType, IApi, IBundlerConfigType } from '@umijs/types';
import { chalk, rimraf } from '@umijs/utils';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import zlib from 'zlib';

type Env = 'development' | 'production';

export async function getBundleAndConfigs({
  api,
  mfsu,
  port,
}: {
  api: IApi;
  mfsu?: boolean;
  port?: number;
}) {
  // bundler
  const Bundler = await api.applyPlugins({
    type: api.ApplyPluginsType.modify,
    key: 'modifyBundler',
    initialValue: DefaultBundler,
  });

  const bundleImplementor = await api.applyPlugins({
    key: 'modifyBundleImplementor',
    type: api.ApplyPluginsType.modify,
    initialValue: undefined,
  });

  // get config
  async function getConfig({ type }: { type: IBundlerConfigType }) {
    const env: Env = api.env === 'production' ? 'production' : 'development';
    const getConfigOpts = await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'modifyBundleConfigOpts',
      initialValue: {
        env,
        type,
        port,
        mfsu,
        hot: type === BundlerConfigType.csr && process.env.HMR !== 'none',
        entry: {
          umi: join(api.paths.absTmpPath!, 'umi.ts'),
        },
        // @ts-ignore
        bundleImplementor,
        async modifyBabelOpts(opts: any, args?: any) {
          return await api.applyPlugins({
            type: api.ApplyPluginsType.modify,
            key: 'modifyBabelOpts',
            initialValue: opts,
            args,
          });
        },
        async modifyBabelPresetOpts(opts: any, args?: any) {
          return await api.applyPlugins({
            type: api.ApplyPluginsType.modify,
            key: 'modifyBabelPresetOpts',
            initialValue: opts,
            args,
          });
        },
        async chainWebpack(webpackConfig: any, opts: any) {
          return await api.applyPlugins({
            type: api.ApplyPluginsType.modify,
            key: 'chainWebpack',
            initialValue: webpackConfig,
            args: {
              ...opts,
            },
          });
        },
      },
      args: {
        ...bundlerArgs,
        type,
        mfsu,
      },
    });
    return await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'modifyBundleConfig',
      initialValue: await bundler.getConfig(getConfigOpts),
      args: {
        ...bundlerArgs,
        type,
        mfsu,
      },
    });
  }

  const bundler: DefaultBundler = new Bundler({
    cwd: api.cwd,
    config: api.config,
  });
  const bundlerArgs = {
    env: api.env,
    bundler: { id: Bundler.id, version: Bundler.version },
  };
  const bundleConfigs = await api.applyPlugins({
    type: api.ApplyPluginsType.modify,
    key: 'modifyBundleConfigs',
    initialValue: [await getConfig({ type: BundlerConfigType.csr })].filter(
      Boolean,
    ),
    args: {
      ...bundlerArgs,
      getConfig,
    },
  });

  return {
    bundleImplementor,
    bundler,
    bundleConfigs,
  };
}

export function cleanTmpPathExceptCache({
  absTmpPath,
}: {
  absTmpPath: string;
}) {
  if (!existsSync(absTmpPath)) return;
  readdirSync(absTmpPath).forEach((file) => {
    if (file === `.cache`) return;
    rimraf.sync(join(absTmpPath, file));
  });
}

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 1.8 * 1024 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1 * 1024 * 1024;

export function printFileSizes(stats: webpack.Stats, dir: string) {
  const ui = require('@umijs/deps/compiled/cliui')({ width: 80 });
  const json = stats.toJson({
    hash: false,
    modules: false,
    chunks: false,
  });

  const filesize = (bytes: number) => {
    bytes = Math.abs(bytes);
    const radix = 1024;
    const unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let loop = 0;

    // calculate
    while (bytes >= radix) {
      bytes /= radix;
      ++loop;
    }
    return `${bytes.toFixed(1)} ${unit[loop]}`;
  };

  const assets = json.assets
    ? json.assets
    : // @ts-ignore
      json?.children?.reduce((acc, child) => acc.concat(child?.assets), []);

  const seenNames = new Map();
  const isJS = (val: string) => /\.js$/.test(val);
  const isCSS = (val: string) => /\.css$/.test(val);

  const orderedAssets = assets
    ?.map((a) => {
      a.name = a.name.split('?')[0];
      // These sizes are pretty large
      const isMainBundle = a.name.indexOf('umi.') === 0;
      const maxRecommendedSize = isMainBundle
        ? WARN_AFTER_BUNDLE_GZIP_SIZE
        : WARN_AFTER_CHUNK_GZIP_SIZE;
      const isLarge = maxRecommendedSize && a.size > maxRecommendedSize;
      return {
        ...a,
        suggested: isLarge && isJS(a.name),
      };
    })
    .filter((a) => {
      if (seenNames.has(a.name)) {
        return false;
      }
      seenNames.set(a.name, true);
      return isJS(a.name) || isCSS(a.name);
    })
    .sort((a, b) => {
      if (isJS(a.name) && isCSS(b.name)) return -1;
      if (isCSS(a.name) && isJS(b.name)) return 1;
      return b.size - a.size;
    });

  function getGzippedSize(asset: any) {
    const filepath = resolve(join(dir, asset.name));
    if (existsSync(filepath)) {
      const buffer = readFileSync(filepath);
      return filesize(zlib.gzipSync(buffer).length);
    }
    return filesize(0);
  }

  function makeRow(a: string, b: string, c: string): string {
    return ` ${a}\t      ${b}\t ${c}`;
  }

  ui.div(
    makeRow(
      chalk.cyan.bold(`File`),
      chalk.cyan.bold(`Size`),
      chalk.cyan.bold(`Gzipped`),
    ) +
      `\n\n` +
      orderedAssets
        ?.map((asset) =>
          makeRow(
            /js$/.test(asset.name)
              ? asset.suggested
                ? // warning for large bundle
                  chalk.yellow(join(dir, asset.name))
                : chalk.green(join(dir, asset.name))
              : chalk.blue(join(dir, asset.name)),
            filesize(asset.size),
            getGzippedSize(asset),
          ),
        )
        .join(`\n`),
  );

  console.log(
    `${ui.toString()}\n\n  ${chalk.gray(
      `Images and other types of assets omitted.`,
    )}\n`,
  );

  if (orderedAssets?.some((asset) => asset.suggested)) {
    // We'll warn for bundles exceeding them.
    // TODO: use umi docs
    console.log();
    console.log(
      chalk.yellow('The bundle size is significantly larger than recommended.'),
    );
    console.log(
      chalk.yellow(
        'Consider reducing it with code splitting: https://umijs.org/docs/load-on-demand',
      ),
    );
    console.log(
      chalk.yellow(
        'You can also analyze the project dependencies using ANALYZE=1',
      ),
    );
    console.log();
  }
}
