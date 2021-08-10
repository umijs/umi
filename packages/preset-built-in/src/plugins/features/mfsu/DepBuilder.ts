import * as defaultWebpack from '@umijs/deps/compiled/webpack';
import { Compiler } from '@umijs/deps/compiled/webpack';
import { IApi } from '@umijs/types';
import { createDebug, lodash, winPath } from '@umijs/utils';
import assert from 'assert';
import { writeFileSync } from 'fs';
import { join } from 'path';
import webpack from 'webpack';
import { getBundleAndConfigs } from '../../commands/buildDevUtils';
import { CWD, DEFAULT_MF_NAME, MF_VA_PREFIX } from './constants';
import { IDeps } from './DepInfo';
import { getAliasedDep } from './getDepVersion';
import { getMfsuPath, TMode } from './mfsu';
import ModifyChunkNamePlugin from './modifyChunkNamePlugin';
import { RuntimePublicPathPlugin } from './RuntimePublicPathPlugin';
import { figureOutExport } from './utils';

const debug = createDebug('umi:mfsu:DepBuilder');

const normalizeDepPath = (dep: string, cwd: string) => {
  return dep.replace(cwd, CWD).replace(/\//g, '_').replace(/\:/g, '_');
};

export default class DepBuilder {
  public api: IApi;
  public mode: TMode;
  public compiler: Compiler | null;
  public tmpDir: string;
  public isBuilding: boolean;
  private onBuildCompleteQueue: Function[];

  constructor(opts: { api: IApi; mode: TMode; tmpDir: string }) {
    this.api = opts.api;
    this.mode = opts.mode;
    this.tmpDir = opts.tmpDir || getMfsuPath(this.api, { mode: opts.mode });
    this.compiler = null;
    this.isBuilding = false;
    this.onBuildCompleteQueue = [];
  }

  onBuildComplete(fn: Function) {
    if (this.isBuilding) {
      this.onBuildCompleteQueue.push(fn);
    } else {
      fn();
    }
  }

  async build(opts: { deps: IDeps; webpackAlias: any; onBuildComplete: any }) {
    this.isBuilding = true;
    await this.writeMFFiles(opts.deps, opts.webpackAlias);

    if (!this.compiler) {
      // start webpack
      const { bundleConfigs, bundler } = await getBundleAndConfigs({
        api: this.api,
        mfsu: true,
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
        onBuildComplete: (err: any, stats: any) => {
          this.isBuilding = false;
          this.onBuildCompleteQueue.forEach((fn) => fn());
          this.onBuildCompleteQueue = [];
          opts.onBuildComplete(err, stats);
        },
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
        const requireFrom = getAliasedDep({
          dep,
          webpackAlias,
        });
        writeFileSync(
          winPath(
            join(
              this.tmpDir,
              normalizeDepPath(`${MF_VA_PREFIX}${dep}.js`, this.api.cwd),
            ),
          ),
          [
            await figureOutExport(
              this.api.cwd,
              winPath(requireFrom),
              // @ts-ignore
              !!this.api.config.mfsu!.ignoreNodeBuiltInModules,
            ),
            '',
          ]
            .join('\n')
            .trimLeft(),
          'utf-8',
        );
      } catch (err) {
        const e = new Error(
          `[MFSU] Build virtual application failed since ${err.message}.`,
        );
        e.stack = err.stack;
        throw e;
      }
    }

    const entryFile = '"😛"';
    writeFileSync(join(this.tmpDir, './index.js'), entryFile);
  }

  updateWebpackConfig(mfConfig: defaultWebpack.Configuration, deps: IDeps) {
    mfConfig.stats = 'none';
    mfConfig.entry = join(this.tmpDir, 'index.js');
    mfConfig.output!.path = this.tmpDir;
    // disable devtool
    mfConfig.devtool = false;
    // disable library
    // library 会影响 external 的语法，导致报错
    // ref: https://github.com/umijs/plugins/blob/6d3fc2d/packages/plugin-qiankun/src/slave/index.ts#L83
    if (mfConfig.output?.library) delete mfConfig.output.library;
    if (mfConfig.output?.libraryTarget) delete mfConfig.output.libraryTarget;

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
        normalizeDepPath(`${MF_VA_PREFIX}${dep}.js`, this.api.cwd),
      );
    });

    mfConfig.plugins = mfConfig.plugins || [];

    // 修改 chunk 名
    mfConfig.plugins.push(new ModifyChunkNamePlugin());

    // mf 插件
    const name =
      (this.api.config.mfsu && this.api.config.mfsu.mfName) || DEFAULT_MF_NAME;
    mfConfig.plugins.push(
      //@ts-ignore
      new webpack.container.ModuleFederationPlugin({
        library: {
          type: 'global',
          name,
        },
        name,
        filename: remoteEntryFilename,
        exposes,
      }),
    );

    // runtimePublicPath 替换插件
    if (this.api.config.runtimePublicPath) {
      mfConfig.plugins.push(new RuntimePublicPathPlugin());
    }

    return mfConfig;
  }
}
