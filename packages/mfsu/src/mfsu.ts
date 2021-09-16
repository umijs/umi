import type {
  NextFunction,
  Request,
  Response,
} from '@umijs/bundler-webpack/compiled/express';
import webpack, {
  Configuration,
} from '@umijs/bundler-webpack/compiled/webpack';
import { logger } from '@umijs/utils';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as process from 'process';
import autoExport from './babelPlugins/autoExport';
import awaitImport from './babelPlugins/awaitImport/awaitImport';
import { getRealPath } from './babelPlugins/awaitImport/getRealPath';
import {
  DEFAULT_MF_NAME,
  DEFAULT_TMP_DIR_NAME,
  MF_DEP_PREFIX,
  MF_STATIC_PREFIX,
  MF_VA_PREFIX,
  REMOTE_FILE,
  REMOTE_FILE_FULL,
} from './constants';
import { Dep } from './dep/dep';
import { DepBuilder } from './depBuilder/depBuilder';
import { DepInfo } from './depInfo';
import { Mode } from './types';
import { makeArray } from './utils/makeArray';
import { BuildDepPlugin } from './webpackPlugins/buildDepPlugin';
import { WriteCachePlugin } from './webpackPlugins/writeCachePlugin';

interface IOpts {
  cwd?: string;
  excludeNodeNatives?: boolean;
  exportAllMembers?: Record<string, string[]>;
  getCacheDependency?: Function;
  mfName?: string;
  mode?: Mode;
  tmpBase?: string;
  unMatchLibs?: string[];
  implementor: typeof webpack;
}

export class MFSU {
  public opts: IOpts;
  public alias: Record<string, string> = {};
  public externals: (Record<string, string> | Function)[] = [];
  public depInfo: DepInfo;
  public depBuilder: DepBuilder;
  public depConfig: Configuration | null = null;
  constructor(opts: IOpts) {
    this.opts = opts;
    this.opts.mfName = this.opts.mfName || DEFAULT_MF_NAME;
    this.opts.tmpBase =
      this.opts.tmpBase || join(process.cwd(), DEFAULT_TMP_DIR_NAME);
    this.opts.mode = this.opts.mode || Mode.development;
    this.opts.getCacheDependency = this.opts.getCacheDependency || (() => ({}));
    this.opts.cwd = this.opts.cwd || process.cwd();
    this.depInfo = new DepInfo({ mfsu: this });
    this.depBuilder = new DepBuilder({ mfsu: this });
  }

  setWebpackConfig(opts: { config: Configuration; depConfig: Configuration }) {
    const { mfName } = this.opts;

    /**
     * config
     */
    // set alias and externals with reference for babel plugin
    Object.assign(this.alias, opts.config.resolve?.alias || {});
    this.externals.push(...makeArray(opts.config.externals || []));
    opts.config.plugins = opts.config.plugins || [];
    opts.config.plugins!.push(
      ...[
        new this.opts.implementor.container.ModuleFederationPlugin({
          name: '__',
          remotes: {
            [mfName!]: `${mfName}@${REMOTE_FILE_FULL}`,
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

    /**
     * depConfig
     */
    this.depConfig = opts.depConfig;
  }

  async buildDeps() {
    if (!this.depInfo.shouldBuild()) return;
    this.depInfo.snapshot();
    const deps = Dep.buildDeps({
      deps: this.depInfo.moduleGraph.depSnapshotModules,
      cwd: this.opts.cwd!,
      mfsu: this,
    });
    await this.depBuilder.build({
      deps,
    });
  }

  getMiddlewares() {
    return [
      (req: Request, res: Response, next: NextFunction) => {
        const publicPath = '/';
        const isMF =
          req.path.startsWith(`${publicPath}${MF_VA_PREFIX}`) ||
          req.path.startsWith(`${publicPath}${MF_DEP_PREFIX}`) ||
          req.path.startsWith(`${publicPath}${MF_STATIC_PREFIX}`);
        if (isMF) {
          this.depBuilder.onBuildComplete(() => {
            if (!req.path.includes(REMOTE_FILE)) {
              res.setHeader('cache-control', 'max-age=31536000,immutable');
            }
            const relativePath = req.path.replace(
              new RegExp(`^${publicPath}`),
              '/',
            );
            const content = readFileSync(
              join(this.opts.tmpBase!, relativePath),
              'utf-8',
            );
            res.send(content);
          });
        } else {
          next();
        }
      },
    ];
  }

  getBabelPlugins() {
    return [
      autoExport,
      [
        awaitImport,
        {
          onTransformDeps: () => {},
          onCollect: ({
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
