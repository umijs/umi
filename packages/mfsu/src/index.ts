import {
  Configuration,
  container,
} from '@umijs/bundler-webpack/compiled/webpack';
import { logger } from '@umijs/utils';
import { join } from 'path';
import awaitImport from './babelPlugins/awaitImport/awaitImport';
import { getRealPath } from './babelPlugins/awaitImport/getRealPath';
import { MF_VA_PREFIX } from './constants';
import { DepBuilder } from './depBuilder';
import { DepInfo } from './depInfo';
import { Mode } from './types';
import { makeArray } from './utils/makeArray';
import { BuildDepPlugin } from './webpackPlugins/buildDepPlugin';
import { WriteCachePlugin } from './webpackPlugins/writeCachePlugin';

interface IOpts {
  exportAllMembers?: Record<string, string[]>;
  mfName?: string;
  tmpBase?: string;
  unMatchLibs?: string[];
  mode?: Mode;
  getCacheDependency?: Function;
}

export class MFSU {
  public opts: IOpts;
  public alias: Record<string, string> = {};
  public externals: (Record<string, string> | Function)[] = [];
  public depInfo: DepInfo = new DepInfo({
    mfsu: this,
  });
  public depBuilder: DepBuilder = new DepBuilder({
    mfsu: this,
  });
  constructor(opts: IOpts) {
    this.opts = opts;
    this.opts.mfName = this.opts.mfName || 'mf';
    this.opts.tmpBase = this.opts.tmpBase || join(process.cwd(), '.mfsu');
    this.opts.mode = this.opts.mode || Mode.development;
    this.opts.getCacheDependency = this.opts.getCacheDependency || (() => ({}));
  }

  init() {}

  updateWebpackConfig(opts: { config: Configuration }) {
    const { mfName } = this.opts;

    // set alias and externals with reference for babel plugin
    Object.assign(this.alias, opts.config.resolve?.alias || {});
    this.externals.push(...makeArray(opts.config.externals || []));

    opts.config.plugins = opts.config.plugins || [];
    opts.config.plugins!.push(
      ...[
        new container.ModuleFederationPlugin({
          name: '__',
          remotes: {
            [mfName!]: `${mfName}@${MF_VA_PREFIX}remoteEntry.js`,
          },
        }),
        new BuildDepPlugin({
          onCompileDone: () => {
            this.buildDeps().catch((e) => {
              logger.error(e);
            });
          },
        }),
        new WriteCachePlugin({
          onWriteCache: () => {
            this.depInfo.writeCache();
          },
        }),
      ],
    );
  }

  async buildDeps() {
    if (!this.depInfo.shouldBuild()) return;
    this.depInfo.snapshot();
    await this.depBuilder.build();
  }

  getMiddlewares() {
    // @ts-ignore
    return [(req, res, next) => {}];
  }

  getBabelPlugins() {
    return [
      [
        awaitImport,
        {
          onTransformDeps: () => {},
          onCollectData: ({
            file,
            data,
          }: {
            file: string;
            data: {
              unMatched: Set<{ sourceValue: string }>;
              matched: Set<{ sourceValue: string }>;
            };
          }) => {
            this.depInfo.moduleGraph.onFileChange({
              file,
              deps: [
                ...Array.from(data.matched).map((item: any) => ({
                  file: item.sourceValue,
                  isDependency: true,
                })),
                ...Array.from(data.unMatched).map((item: any) => ({
                  file: getRealPath({
                    file,
                    dep: item.sourceValue,
                  }),
                  isDependency: false,
                })),
              ],
            });
          },
          exportAllMembers: this.opts.exportAllMembers,
          unMatchLibs: this.opts.unMatchLibs,
          remoteName: this.opts.mfName,
          alias: this.alias,
          externals: this.externals,
        },
      ],
    ];
  }
}
