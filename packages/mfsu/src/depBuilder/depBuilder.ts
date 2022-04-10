import { build } from '@umijs/bundler-esbuild';
import { fsExtra, lodash, logger } from '@umijs/utils';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { MF_DEP_PREFIX, MF_VA_PREFIX, REMOTE_FILE_FULL } from '../constants';
import { Dep } from '../dep/dep';
import { MFSU } from '../mfsu';
import { DepChunkIdPrefixPlugin } from '../webpackPlugins/depChunkIdPrefixPlugin';
import { StripSourceMapUrlPlugin } from '../webpackPlugins/stripSourceMapUrlPlugin';
import { getESBuildEntry } from './getESBuildEntry';

interface IOpts {
  mfsu: MFSU;
}

export class DepBuilder {
  public opts: IOpts;
  public completeFns: Function[] = [];
  public isBuilding = false;
  constructor(opts: IOpts) {
    this.opts = opts;
  }

  async buildWithWebpack(opts: { onBuildComplete: Function; deps: Dep[] }) {
    const config = this.getWebpackConfig({ deps: opts.deps });
    return new Promise((resolve, reject) => {
      const compiler = this.opts.mfsu.opts.implementor(config);
      compiler.run((err, stats) => {
        opts.onBuildComplete();
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
          resolve(stats);
        }
        compiler.close(() => {});
      });
    });
  }

  // TODO: support watch and rebuild
  async buildWithESBuild(opts: { onBuildComplete: Function; deps: Dep[] }) {
    const entryContent = getESBuildEntry({ deps: opts.deps });
    const ENTRY_FILE = 'esbuild-entry.js';
    const tmpDir = this.opts.mfsu.opts.tmpBase!;
    const entryPath = join(tmpDir, ENTRY_FILE);
    writeFileSync(entryPath, entryContent, 'utf-8');
    const date = new Date().getTime();
    await build({
      cwd: this.opts.mfsu.opts.cwd!,
      entry: {
        [`${MF_VA_PREFIX}remoteEntry`]: entryPath,
      },
      config: {
        ...this.opts.mfsu.opts.depBuildConfig,
        outputPath: tmpDir,
        alias: this.opts.mfsu.alias,
        externals: this.opts.mfsu.externals,
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

    const onBuildComplete = () => {
      this.isBuilding = false;
      this.completeFns.forEach((fn) => fn());
      this.completeFns = [];
    };

    try {
      await this.writeMFFiles({ deps: opts.deps });
      const newOpts = {
        ...opts,
        onBuildComplete,
      };
      if (this.opts.mfsu.opts.buildDepWithESBuild) {
        await this.buildWithESBuild(newOpts);
      } else {
        await this.buildWithWebpack(newOpts);
      }
    } catch (e) {
      onBuildComplete();
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
    const tmpBase = this.opts.mfsu.opts.tmpBase!;
    fsExtra.mkdirpSync(tmpBase);

    // expose files
    for (const dep of opts.deps) {
      const content = await dep.buildExposeContent();
      writeFileSync(join(tmpBase, dep.filePath), content, 'utf-8');
    }

    // index file
    writeFileSync(join(tmpBase, 'index.js'), '"😛"', 'utf-8');
  }

  getWebpackConfig(opts: { deps: Dep[] }) {
    const mfName = this.opts.mfsu.opts.mfName;
    const depConfig = lodash.cloneDeep(this.opts.mfsu.depConfig!);

    // depConfig.stats = 'none';
    depConfig.entry = join(this.opts.mfsu.opts.tmpBase!, 'index.js');
    depConfig.output!.path = this.opts.mfsu.opts.tmpBase!;
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
      chunks: 'all',
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
    depConfig.plugins.push(new DepChunkIdPrefixPlugin());
    depConfig.plugins.push(
      new StripSourceMapUrlPlugin({
        webpack: this.opts.mfsu.opts.implementor,
      }),
    );
    depConfig.plugins.push(
      new this.opts.mfsu.opts.implementor.ProgressPlugin((percent, msg) => {
        this.opts.mfsu.onProgress({ percent, status: msg });
      }),
    );
    const exposes = opts.deps.reduce<Record<string, string>>((memo, dep) => {
      memo[`./${dep.file}`] = join(this.opts.mfsu.opts.tmpBase!, dep.filePath);
      return memo;
    }, {});
    depConfig.plugins.push(
      new this.opts.mfsu.opts.implementor.container.ModuleFederationPlugin({
        library: {
          type: 'global',
          name: mfName,
        },
        name: mfName,
        filename: REMOTE_FILE_FULL,
        exposes,
      }),
    );
    return depConfig;
  }
}
