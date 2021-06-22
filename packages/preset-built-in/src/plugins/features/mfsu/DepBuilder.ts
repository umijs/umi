import * as defaultWebpack from '@umijs/deps/compiled/webpack';
import { Compiler } from '@umijs/deps/compiled/webpack';
// @ts-ignore
import WebpackBarPlugin from '@umijs/deps/compiled/webpackbar';
import { IApi } from '@umijs/types';
import { createDebug, lodash } from '@umijs/utils';
import assert from 'assert';
import { writeFileSync } from 'fs';
import { join } from 'path';
import webpack from 'webpack';
import { getBundleAndConfigs } from '../../commands/buildDevUtils';
import {
  CWD,
  MF_NAME,
  MF_PROGRESS_COLOR,
  MF_PROGRESS_NAME,
  MF_VA_PREFIX,
} from './constants';
import { IDeps } from './DepInfo';
import { getMfsuPath, TMode } from './mfsu';
import ModifyChunkNamePlugin from './modifyChunkNamePlugin';
import { figureOutExport } from './utils';

const debug = createDebug('umi:mfsu:DepBuilder');

const normalizeDepPath = (dep: string) => {
  return dep.replace(/\//g, '_');
};

export default class DepBuilder {
  public api: IApi;
  public mode: TMode;
  public compiler: Compiler | null;
  public tmpDir: string;

  constructor(opts: { api: IApi; mode: TMode; tmpDir: string }) {
    this.api = opts.api;
    this.mode = opts.mode;
    this.tmpDir = opts.tmpDir || getMfsuPath(this.api, { mode: opts.mode });
    this.compiler = null;
  }

  async build(opts: { deps: IDeps; webpackAlias: any; onBuildComplete: any }) {
    await this.writeMFFiles(opts.deps, opts.webpackAlias);

    if (!this.compiler) {
      // start webpack
      const { bundleConfigs, bundler } = await getBundleAndConfigs({
        api: this.api,
      });
      assert(
        bundleConfigs.length && bundleConfigs[0],
        `[MFSU] 预编译找不到 Webpack 配置`,
      );
      let mfConfig: defaultWebpack.Configuration = lodash.cloneDeep(
        bundleConfigs[0],
      );
      mfConfig = this.updateWebpackConfig(mfConfig, opts.deps);
      const watch = this.mode === 'development';
      const { compiler } = await bundler.build({
        bundleConfigs: [mfConfig],
        // TODO: 支持 watch 模式
        // 因为 exposes 不支持动态变更，所以暂不能使用 webpack 的 watch 模式
        watch: false,
        onBuildComplete: opts.onBuildComplete,
      });
      // TODO: 支持 watch 模式
      // this.compiler = compiler;
    }
  }

  async writeMFFiles(deps: IDeps, webpackAlias: any) {
    // TODO：何时清理？还是不需要清理？加 --force 时清理？
    // 清除原先的目录
    // readdirSync(this.tmpDir).forEach((dir) => {
    //   // 不删除 diff 文件
    //   if (dir !== DEP_INFO_CACHE_FILE) {
    //     unlinkSync(join(this.tmpDir, dir));
    //   }
    // });

    for (let dep of Object.keys(deps)) {
      try {
        const requireFrom = webpackAlias[dep] || dep;
        writeFileSync(
          join(this.tmpDir, normalizeDepPath(`${MF_VA_PREFIX}${dep}.js`)),
          [await figureOutExport(this.api.cwd, requireFrom), '']
            .join('\n')
            .trimLeft(),
          'utf-8',
        );
      } catch (err) {
        throw new Error(
          '[MFSU] Build virtual application failed.' + err.message,
        );
      }
    }

    const entryFile = '"😛"';
    writeFileSync(join(this.tmpDir, './index.js'), entryFile);
  }

  updateWebpackConfig(mfConfig: defaultWebpack.Configuration, deps: IDeps) {
    mfConfig.stats = 'none';
    mfConfig.entry = join(this.tmpDir, 'index.js');
    mfConfig.output!.path = this.tmpDir;
    // TODO: css hash
    mfConfig.output!.filename = '[name].[contenthash:8].js';
    mfConfig.output!.chunkFilename = '[name].[contenthash:8].async.js';

    mfConfig.plugins = mfConfig.plugins || [];

    // 修改 chunk 名
    mfConfig.plugins.push(new ModifyChunkNamePlugin());

    // @ts-ignore
    if (mfConfig.cache && mfConfig.cache.cacheDirectory) {
      // @ts-ignore
      mfConfig.cache.cacheDirectory = join(this.tmpDir, '.webpackFSCache');
    }
    debug('config.cache', mfConfig.cache);

    const remoteEntryFilename = MF_VA_PREFIX + 'remoteEntry.js';
    const exposes = {};
    Object.keys(deps).forEach((dep) => {
      exposes[`./${dep}`.replace(this.api.cwd, CWD)] = join(
        this.tmpDir,
        normalizeDepPath(`${MF_VA_PREFIX}${dep}.js`),
      );
    });
    mfConfig.plugins.push(
      //@ts-ignore
      new webpack.container.ModuleFederationPlugin({
        name: MF_NAME,
        filename: remoteEntryFilename,
        exposes,
      }),
    );

    // TODO: 删除 babel plugin 和 webpack plugin 应该可以有更好的组织方式
    // 这个打包应该剔除 import-to-await-require 插件
    mfConfig.module!.rules.forEach((rule) => {
      // @ts-ignore
      rule?.use?.forEach((u) => {
        if (/babel-loader/.test(u.loader)) {
          // @ts-ignore
          u?.options?.plugins?.forEach((plugin, index) => {
            if (/import-to-await-require/.test(plugin[0])) {
              u?.options?.plugins.splice(index, 1);
            }
          });
        }
      });
    });

    // 删除部分不需要的插件
    mfConfig.plugins.forEach((plugin, index) => {
      if (
        [
          'DevCompileDonePlugin',
          'WebpackBarPlugin',
          'BundleAnalyzerPlugin',
          'HtmlWebpackPlugin',
        ].includes(plugin.constructor.name)
      ) {
        mfConfig.plugins!.splice(index, 1);
      }

      if (
        plugin.constructor.name === 'ModuleFederationPlugin' &&
        // @ts-ignore
        plugin._options.name === 'umi-app'
      ) {
        mfConfig.plugins!.splice(index, 1);
      }
    });

    // 重新构建一个 WebpackBarPlugin
    if (process.env.PROGRESS !== 'none') {
      mfConfig.plugins.push(
        new WebpackBarPlugin({
          name: MF_PROGRESS_NAME,
          color: MF_PROGRESS_COLOR,
        }),
      );
    }

    // 因为 webpack5 不会自动注入 node-libs-browser，因此手动操作一下
    // 包已经在 bundle-webpack/getConfig 中通过 fallback 注入，在此仅针对特殊包制定指向
    // TODO: 确认是否有必要
    mfConfig.plugins.push(
      // @ts-ignore
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    );

    return mfConfig;
  }
}
