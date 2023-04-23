import { build } from '@umijs/bundler-esbuild';
import webpack from '@umijs/bundler-webpack/compiled/webpack';
import { MF_DEP_PREFIX, MF_VA_PREFIX, REMOTE_FILE_FULL } from '@umijs/mfsu';
import { Dep } from '@umijs/mfsu/dist/dep/dep';
import { getESBuildEntry } from '@umijs/mfsu/dist/depBuilder/getESBuildEntry';
import { DepChunkIdPrefixPlugin } from '@umijs/mfsu/dist/webpackPlugins/depChunkIdPrefixPlugin';
import { StripSourceMapUrlPlugin } from '@umijs/mfsu/dist/webpackPlugins/stripSourceMapUrlPlugin';
import { fsExtra, lodash, logger } from '@umijs/utils';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { parentPort } from 'worker_threads';

const MF_ENTRY = 'mf_index.js';

type IOpts = {
  depConfig: webpack.Configuration;
  cwd: string;
  tmpBase: string;
  mfName: string;
  shared: any;
  // all for esbuild needs
  buildDepWithESBuild: boolean;
  depEsBuildConfig: any;
  externals: any[];
};

export class DepBuilderInWorker {
  public completeFns: Function[] = [];
  public isBuilding = false;
  opts: IOpts;
  constructor(opts: IOpts) {
    this.opts = opts;
  }

  async buildWithWebpack(opts: { onBuildComplete: Function; deps: Dep[] }) {
    const config = this.getWebpackConfig({ deps: opts.deps });
    return new Promise((resolve, reject) => {
      const compiler = webpack(config);
      compiler.run((err, stats) => {
        if (err || stats?.hasErrors()) {
          if (err) {
            reject(err);
          }
          if (stats) {
            const errorMsg = stats.toString('errors-only');
            // console.error(errorMsg);
            reject(new Error(errorMsg));
          }
        } else {
          opts.onBuildComplete();
          resolve(stats);
        }
        compiler.close(() => {});
      });
    });
  }

  // TODO: support watch and rebuild
  async buildWithESBuild(opts: { onBuildComplete: Function; deps: Dep[] }) {
    const alias = { ...this.opts.depConfig.resolve?.alias };
    const externals = this.opts.depConfig.externals;

    const entryContent = getESBuildEntry({
      mfName: this.opts.mfName!,
      deps: opts.deps,
    });
    const ENTRY_FILE = 'esbuild-entry.js';
    const tmpDir = this.opts.tmpBase!;
    const entryPath = join(tmpDir, ENTRY_FILE);
    writeFileSync(entryPath, entryContent, 'utf-8');
    const date = new Date().getTime();
    await build({
      cwd: this.opts.cwd!,
      entry: {
        [`${MF_VA_PREFIX}remoteEntry`]: entryPath,
      },
      config: {
        ...this.opts.depEsBuildConfig,
        outputPath: tmpDir,
        alias,
        externals,
      },
      inlineStyle: true,
    });
    logger.event(
      `[mfsu] compiled with esbuild successfully in ${+new Date() - date} ms`,
    );
    opts.onBuildComplete();
  }

  async build(opts: { deps: Dep[] }) {
    this.isBuilding = true;

    const onBuildComplete = (e: any = null) => {
      this.isBuilding = false;

      parentPort!.postMessage({
        done: {
          withError: e,
        },
      });
    };

    try {
      await this.writeMFFiles({ deps: opts.deps.map((d) => new Dep(d)) });
      const newOpts = {
        ...opts,
        onBuildComplete,
      };
      if (this.opts.buildDepWithESBuild) {
        await this.buildWithESBuild(newOpts);
      } else {
        await this.buildWithWebpack(newOpts);
      }
    } catch (e) {
      onBuildComplete(e);
      throw e;
    }
  }

  onBuildComplete(fn: Function) {
    if (this.isBuilding) {
      this.completeFns.push(fn);
    } else {
      fn();
    }
  }

  async writeMFFiles(opts: { deps: Dep[] }) {
    const tmpBase = this.opts.tmpBase!;
    fsExtra.mkdirpSync(tmpBase);

    // expose files
    for (const dep of opts.deps) {
      const content = await dep.buildExposeContent();
      writeFileSync(join(tmpBase, dep.filePath), content, 'utf-8');
    }

    // index file
    writeFileSync(join(tmpBase, MF_ENTRY), '"😛"', 'utf-8');
  }

  getWebpackConfig(opts: { deps: Dep[] }) {
    const mfName = this.opts.mfName!;
    const depConfig = lodash.cloneDeep(this.opts.depConfig!);

    // depConfig.stats = 'none';
    depConfig.entry = join(this.opts.tmpBase!, MF_ENTRY);

    depConfig.output!.path = this.opts.tmpBase!;

    depConfig.output!.publicPath = 'auto';

    // disable devtool
    depConfig.devtool = false;
    // disable library
    // library 会影响 external 的语法，导致报错
    // ref: https://github.com/umijs/plugins/blob/6d3fc2d/packages/plugin-qiankun/src/slave/index.ts#L83
    if (depConfig.output?.library) delete depConfig.output.library;
    if (depConfig.output?.libraryTarget) delete depConfig.output.libraryTarget;

    // merge all deps to vendor
    depConfig.optimization ||= {};
    depConfig.optimization.splitChunks = {
      chunks: (chunk) => {
        // mf 插件中的 chunk 的加载并不感知到 mfsu 做了 chunk 的合并, 所以还是用原来的 chunk 名去加载
        // 这样就会造成 chunk 加载不到的问题; 因此将 mf shared 相关的 chunk 不进行合并
        const hasShared = chunk.getModules().some((m) => {
          return (
            m.type === 'consume-shared-module' ||
            m.type === 'provide-module' ||
            m.type === 'provide-shared-module'
          );
        });
        return !hasShared;
      },
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /.+/,
          name(_module: any, _chunks: any, cacheGroupKey: string) {
            return `${MF_DEP_PREFIX}___${cacheGroupKey}`;
          },
        },
      },
    };

    depConfig.plugins = depConfig.plugins || [];
    // FIXME remove ignore
    // @ts-ignore
    depConfig.plugins.push(new DepChunkIdPrefixPlugin());
    depConfig.plugins.push(
      // FIXME remove ignore
      // @ts-ignore
      new StripSourceMapUrlPlugin({
        webpack,
      }),
    );
    depConfig.plugins.push(
      new webpack.ProgressPlugin((percent, msg) => {
        parentPort!.postMessage({ progress: { percent, status: msg } });
      }),
    );
    const exposes = opts.deps.reduce<Record<string, string>>((memo, dep) => {
      memo[`./${dep.file}`] = join(this.opts.tmpBase!, dep.filePath);
      return memo;
    }, {});
    depConfig.plugins.push(
      new webpack.container.ModuleFederationPlugin({
        library: {
          type: 'global',
          name: mfName,
        },
        name: mfName,
        filename: REMOTE_FILE_FULL,
        exposes,
        shared: this.opts.shared || {},
      }),
    );
    return depConfig;
  }
}
