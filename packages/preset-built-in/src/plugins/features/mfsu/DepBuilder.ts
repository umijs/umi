import { Bundler } from '@umijs/bundler-webpack';
import * as defaultWebpack from '@umijs/deps/compiled/webpack';
import { Compiler } from '@umijs/deps/compiled/webpack';
// @ts-ignore
import WebpackBarPlugin from '@umijs/deps/compiled/webpackbar';
import { IApi } from '@umijs/types';
import { lodash } from '@umijs/utils';
import assert from 'assert';
import { writeFileSync } from 'fs';
import { join } from 'path';
import webpack from 'webpack';
import { getBundleAndConfigs } from '../../commands/buildDevUtils';
import { CWD, MF_NAME, MF_PROGRESS_NAME, MF_VA_PREFIX } from './constants';
import { IDeps } from './DepInfo';
import { getMfsuPath, TMode } from './mfsu';
import ModifyChunkNamePlugin from './modifyChunkNamePlugin';
import { figureOutExport } from './utils';

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
      // TODO: 这里的 config 传啥？
      const bundler = new Bundler({ cwd: this.api.cwd, config: {} });
      const mfConfig = await this.getWebpackConfig(opts.deps);
      const watch = this.mode === 'development';
      const { compiler } = await bundler.build({
        bundleConfigs: [mfConfig],
        watch,
        onBuildComplete: opts.onBuildComplete,
      });
      this.compiler = compiler;
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
          [
            // TODO: antd 的 less 处理方式
            ['antd'].includes(dep) ? 'import "antd/dist/antd.less";' : '',
            await figureOutExport(this.api.cwd, requireFrom),
            '',
          ]
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

  async getWebpackConfig(deps: IDeps) {
    // 获取原本的配置
    const { bundleConfigs } = await getBundleAndConfigs({ api: this.api });
    assert(
      bundleConfigs.length && bundleConfigs[0],
      `[MFSU] 预编译找不到 Webpack 配置`,
    );
    const mfConfig: defaultWebpack.Configuration = lodash.cloneDeep(
      bundleConfigs[0],
    );

    // mfConfig.mode = mode;
    mfConfig.stats = 'none';
    mfConfig.entry = join(this.tmpDir, 'index.js');
    mfConfig.output!.path = this.tmpDir;
    mfConfig.output!.filename = MF_VA_PREFIX + 'index.js';
    // mfConfig.output!.libraryTarget = 'commonjs';

    mfConfig.plugins = mfConfig.plugins || [];

    // 修改 chunk 名
    mfConfig.plugins.push(new ModifyChunkNamePlugin());

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
        }),
      );
    }

    // 因为 webpack5 不会自动注入 node-libs-browser，因此手动操作一下
    // 包已经在 bundle-webpack/getConfig 中通过 fallback 注入，在此仅针对特殊包制定指向
    mfConfig.plugins.push(
      // @ts-ignore
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    );

    return mfConfig;
  }
}
