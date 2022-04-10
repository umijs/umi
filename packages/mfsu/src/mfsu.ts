import { parseModule } from '@umijs/bundler-utils';
import type {
  NextFunction,
  Request,
  Response,
} from '@umijs/bundler-utils/compiled/express';
import { lodash, logger, tryPaths, winPath } from '@umijs/utils';
import assert from 'assert';
import { readFileSync, statSync } from 'fs';
import { extname, join } from 'path';
import webpack, { Configuration } from 'webpack';
import { lookup } from '../compiled/mrmime';
// @ts-ignore
import WebpackVirtualModules from '../compiled/webpack-virtual-modules';
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
import getAwaitImportHandler from './esbuildHandlers/awaitImport';
import { Mode } from './types';
import { makeArray } from './utils/makeArray';
import { BuildDepPlugin } from './webpackPlugins/buildDepPlugin';

interface IOpts {
  cwd?: string;
  excludeNodeNatives?: boolean;
  exportAllMembers?: Record<string, string[]>;
  getCacheDependency?: Function;
  onMFSUProgress?: Function;
  mfName?: string;
  mode?: Mode;
  tmpBase?: string;
  unMatchLibs?: string[];
  runtimePublicPath?: boolean | string;
  implementor: typeof webpack;
  buildDepWithESBuild?: boolean;
  depBuildConfig: any;
}

export class MFSU {
  public opts: IOpts;
  public alias: Record<string, string> = {};
  public externals: (Record<string, string> | Function)[] = [];
  public depInfo: DepInfo;
  public depBuilder: DepBuilder;
  public depConfig: Configuration | null = null;
  public buildDepsAgain: boolean = false;
  public progress: any = { done: false };
  public onProgress: Function;
  constructor(opts: IOpts) {
    this.opts = opts;
    this.opts.mfName = this.opts.mfName || DEFAULT_MF_NAME;
    this.opts.tmpBase =
      this.opts.tmpBase || join(process.cwd(), DEFAULT_TMP_DIR_NAME);
    this.opts.mode = this.opts.mode || Mode.development;
    this.opts.getCacheDependency = this.opts.getCacheDependency || (() => ({}));
    this.onProgress = (progress: any) => {
      this.progress = {
        ...this.progress,
        ...progress,
      };
      this.opts.onMFSUProgress?.(this.progress);
    };
    this.opts.cwd = this.opts.cwd || process.cwd();
    this.depInfo = new DepInfo({ mfsu: this });
    this.depBuilder = new DepBuilder({ mfsu: this });
    this.depInfo.loadCache();
  }

  // swc don't support top-level await
  // ref: https://github.com/vercel/next.js/issues/31054
  asyncImport(content: string) {
    return `await import('${winPath(content)}');`;
    // return `(async () => await import('${content}'))();`;
  }

  async setWebpackConfig(opts: {
    config: Configuration;
    depConfig: Configuration;
  }) {
    const { mfName } = this.opts;

    /**
     * config
     */
    // set alias and externals with reference for babel plugin
    Object.assign(this.alias, opts.config.resolve?.alias || {});
    this.externals.push(...makeArray(opts.config.externals || []));
    // entry
    const entry: Record<string, string> = {};
    const virtualModules: Record<string, string> = {};
    // ensure entry object type
    const entryObject = lodash.isString(opts.config.entry)
      ? { default: [opts.config.entry] }
      : (opts.config.entry as Record<string, string[]>);
    assert(
      lodash.isPlainObject(entryObject),
      `webpack config 'entry' value must be a string or an object.`,
    );
    for (const key of Object.keys(entryObject)) {
      const virtualPath = `./mfsu-virtual-entry/${key}.js`;
      const virtualContent: string[] = [];
      let index = 1;
      let hasDefaultExport = false;
      const entryFiles = lodash.isArray(entryObject[key])
        ? entryObject[key]
        : ([entryObject[key]] as unknown as string[]);
      for (let entry of entryFiles) {
        // ensure entry is a file
        if (statSync(entry).isDirectory()) {
          const realEntry = tryPaths([
            join(entry, 'index.tsx'),
            join(entry, 'index.ts'),
          ]);
          assert(
            realEntry,
            `entry file not found, please configure the specific entry path. (e.g. 'src/index.tsx')`,
          );
          entry = realEntry;
        }
        const content = readFileSync(entry, 'utf-8');
        const [_imports, exports] = await parseModule({ content, path: entry });
        if (exports.length) {
          virtualContent.push(`const k${index} = ${this.asyncImport(entry)}`);
          for (const exportName of exports) {
            if (exportName === 'default') {
              hasDefaultExport = true;
              virtualContent.push(`export default k${index}.${exportName}`);
            } else {
              virtualContent.push(
                `export const ${exportName} = k${index}.${exportName}`,
              );
            }
          }
        } else {
          virtualContent.push(this.asyncImport(entry));
        }
        index += 1;
      }
      if (!hasDefaultExport) {
        virtualContent.push(`export default 1;`);
      }
      virtualModules[virtualPath] = virtualContent.join('\n');
      entry[key] = virtualPath;
    }
    opts.config.entry = entry;
    // plugins
    opts.config.plugins = opts.config.plugins || [];

    // support publicPath auto
    let publicPath = opts.config.output!.publicPath;
    if (publicPath === 'auto') {
      publicPath = '/';
    }

    opts.config.plugins!.push(
      ...[
        new WebpackVirtualModules(virtualModules),
        new this.opts.implementor.container.ModuleFederationPlugin({
          name: '__',
          remotes: {
            [mfName!]: this.opts.runtimePublicPath
              ? // ref:
                // https://webpack.js.org/concepts/module-federation/#promise-based-dynamic-remotes
                `
promise new Promise(resolve => {
  const remoteUrlWithVersion = window.publicPath + '${REMOTE_FILE_FULL}';
  const script = document.createElement('script');
  script.src = remoteUrlWithVersion;
  script.onload = () => {
    // the injected script has loaded and is available on window
    // we can now resolve this Promise
    const proxy = {
      get: (request) => window['${mfName}'].get(request),
      init: (arg) => {
        try {
          return window['${mfName}'].init(arg);
        } catch(e) {
          console.log('remote container already initialized');
        }
      }
    }
    resolve(proxy);
  }
  // inject this script with the src set to the versioned remoteEntry.js
  document.head.appendChild(script);
})
                `.trimLeft()
              : `${mfName}@${publicPath}${REMOTE_FILE_FULL}`,
          },
        }),
        new BuildDepPlugin({
          onCompileDone: () => {
            if (this.depBuilder.isBuilding) {
              this.buildDepsAgain = true;
            } else {
              this.buildDeps()
                .then(() => {
                  this.onProgress({
                    done: true,
                  });
                })
                .catch((e: Error) => {
                  logger.error(e);
                  this.onProgress({
                    done: true,
                  });
                });
            }
          },
        }),
        // new WriteCachePlugin({
        //   onWriteCache: lodash.debounce(() => {
        //     this.depInfo.writeCache();
        //   }, 300),
        // }),
      ],
    );

    // ensure topLevelAwait enabled
    lodash.set(opts.config, 'experiments.topLevelAwait', true);

    /**
     * depConfig
     */
    this.depConfig = opts.depConfig;
  }

  async buildDeps() {
    const shouldBuild = this.depInfo.shouldBuild();
    if (!shouldBuild) {
      logger.info('MFSU skip buildDeps');
      return;
    }
    this.depInfo.snapshot();
    const deps = Dep.buildDeps({
      deps: this.depInfo.moduleGraph.depSnapshotModules,
      cwd: this.opts.cwd!,
      mfsu: this,
    });
    logger.info(`MFSU buildDeps since ${shouldBuild}`);
    logger.debug(deps.map((dep) => dep.file).join(', '));
    await this.depBuilder.build({
      deps,
    });

    // Write cache
    this.depInfo.writeCache();

    if (this.buildDepsAgain) {
      logger.info('MFSU buildDepsAgain');
      this.buildDepsAgain = false;
      this.buildDeps().catch((e) => {
        logger.error(e);
      });
    }
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
            res.setHeader(
              'content-type',
              lookup(extname(req.path)) || 'text/plain',
            );
            const relativePath = req.path.replace(
              new RegExp(`^${publicPath}`),
              '/',
            );
            const content = readFileSync(
              join(this.opts.tmpBase!, relativePath),
            );
            res.send(content);
          });
        } else {
          next();
        }
      },
    ];
  }

  private getAwaitImportCollectOpts() {
    return {
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
          // @ts-ignore
          deps: [
            ...Array.from(data.matched).map((item: any) => ({
              file: item.sourceValue,
              isDependency: true,
              version: Dep.getDepVersion({
                dep: item.sourceValue,
                cwd: this.opts.cwd!,
              }),
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
    };
  }

  getBabelPlugins() {
    return [[awaitImport, this.getAwaitImportCollectOpts()]];
  }

  getEsbuildLoaderHandler() {
    const cache = new Map<string, any>();
    const checkOpts = this.getAwaitImportCollectOpts();

    return [
      getAwaitImportHandler({
        cache,
        opts: checkOpts,
      }),
    ] as any[];
  }
}
