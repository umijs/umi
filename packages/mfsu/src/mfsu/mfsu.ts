import { parseModule } from '@umijs/bundler-utils';
import type {
  NextFunction,
  Request,
  Response,
} from '@umijs/bundler-utils/compiled/express';
import express from '@umijs/bundler-utils/compiled/express';
import { lodash, logger, printHelp, winPath } from '@umijs/utils';
import assert from 'assert';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
import webpack, { Configuration } from 'webpack';
import type { Worker } from 'worker_threads';
import isAbsoluteUrl from '../../compiled/is-absolute-url';
import { lookup } from '../../compiled/mrmime';
// @ts-ignore
import WebpackVirtualModules from '../../compiled/webpack-virtual-modules';
import {
  DEFAULT_MF_NAME,
  DEFAULT_TMP_DIR_NAME,
  MF_DEP_PREFIX,
  MF_STATIC_PREFIX,
  MF_VA_PREFIX,
  REMOTE_FILE,
  REMOTE_FILE_FULL,
} from '../constants';
import { Dep } from '../dep/dep';
import { DepBuilder } from '../depBuilder/depBuilder';
import { DepModule } from '../depInfo';
import getAwaitImportHandler, {
  getImportHandlerV4,
} from '../esbuildHandlers/awaitImport';
import { Mode } from '../types';
import { makeArray } from '../utils/makeArray';
import { getResolver } from '../utils/webpackUtils';
import {
  BuildDepPlugin,
  IBuildDepPluginOpts,
} from '../webpackPlugins/buildDepPlugin';
import { StrategyCompileTime } from './strategyCompileTime';
import { StaticAnalyzeStrategy } from './strategyStaticAnalyze';

interface IOpts {
  cwd?: string;
  excludeNodeNatives?: boolean;
  exportAllMembers?: Record<string, string[]>;
  getCacheDependency?: Function;
  onMFSUProgress?: Function;
  mfName?: string;
  mode?: Mode;
  tmpBase?: string;
  unMatchLibs?: Array<string | RegExp>;
  runtimePublicPath?: boolean | string;
  implementor: typeof webpack;
  buildDepWithESBuild?: boolean;
  depBuildConfig: any;
  strategy?: 'eager' | 'normal';
  include?: string[];
  srcCodeCache?: any;
  shared?: any;
  remoteName?: string;
  remoteAliases?: string[];
  startBuildWorker: (dep: any[]) => Worker;
}

export class MFSU {
  public opts: IOpts;
  public alias: Record<string, string> = {};
  public externals: (Record<string, string> | Function)[] = [];
  public depBuilder: DepBuilder;
  public depConfig: Configuration | null = null;
  public buildDepsAgain: boolean = false;
  public progress: any = { done: false };
  public onProgress: Function;
  public publicPath: string = '/';
  private strategy: IMFSUStrategy;
  private lastBuildError: any = null;

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

    if (this.opts.strategy === 'eager') {
      if (opts.srcCodeCache) {
        logger.info('MFSU eager strategy enabled');
        this.strategy = new StaticAnalyzeStrategy({
          mfsu: this,
          srcCodeCache: opts.srcCodeCache,
        });
      } else {
        logger.warn(
          'fallback to MFSU normal strategy, due to srcCache is not provided',
        );
        this.strategy = new StrategyCompileTime({ mfsu: this });
      }
    } else {
      this.strategy = new StrategyCompileTime({ mfsu: this });
    }

    this.strategy.loadCache();

    this.depBuilder = new DepBuilder({ mfsu: this });
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
    const entry: Record<string, string | string[]> = {};
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
      // 如果是项目导出的远端模块 不需要处理成动态加载的模块 以避免加载错误
      if (key === this.opts.remoteName) {
        entry[key] = entryObject[key];
        continue;
      }

      const virtualPath = `./mfsu-virtual-entry/${key}.js`;
      const virtualContent: string[] = [];
      let index = 1;
      let hasDefaultExport = false;
      const entryFiles = lodash.isArray(entryObject[key])
        ? entryObject[key]
        : ([entryObject[key]] as unknown as string[]);

      const resolver = getResolver(opts.config);
      for (let entry of entryFiles) {
        // ensure entry is a file
        const realEntry = resolver(entry);
        assert(
          realEntry,
          `entry file not found (${entry}), please configure the specific entry path. (e.g. 'src/index.tsx')`,
        );
        entry = realEntry;

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
    let publicPath = resolvePublicPath(opts.config);
    this.publicPath = publicPath;

    opts.config.plugins!.push(
      ...[
        new WebpackVirtualModules(virtualModules),
        new this.opts.implementor.container.ModuleFederationPlugin({
          name: '__',
          shared: this.opts.shared || {},
          remotes: {
            [mfName!]: this.opts.runtimePublicPath
              ? // ref:
                // https://webpack.js.org/concepts/module-federation/#promise-based-dynamic-remotes
                `
promise new Promise(resolve => {
  const remoteUrlWithVersion = (window.publicPath || '/') + '${REMOTE_FILE_FULL}';
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
              : `${mfName}@${publicPath}${REMOTE_FILE_FULL}`, // mfsu 的入口文件如果需要在其他的站点上被引用,需要显示的指定publicPath,以保证入口文件的正确访问
          },
        }),
        new BuildDepPlugin(this.strategy.getBuildDepPlugConfig()),
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

    this.strategy.init(opts.config);
  }

  async buildDeps() {
    try {
      const shouldBuild = this.strategy.shouldBuild();
      if (!shouldBuild) {
        logger.info('[MFSU] skip buildDeps');
        return;
      }

      // Snapshot after compiled success
      this.strategy.refresh();

      const staticDeps = this.strategy.getDepModules();

      const deps = Dep.buildDeps({
        deps: staticDeps,
        cwd: this.opts.cwd!,
        mfsu: this,
      });
      logger.info(`[MFSU] buildDeps since ${shouldBuild}`);
      logger.debug(deps.map((dep) => dep.file).join(', '));

      await this.depBuilder.build({
        deps,
      });
      this.lastBuildError = null;

      // Write cache
      this.strategy.writeCache();

      if (this.buildDepsAgain) {
        logger.info('[MFSU] buildDepsAgain');
        this.buildDepsAgain = false;
        this.buildDeps().catch((e: Error) => {
          printHelp.runtime(e);
        });
      }
    } catch (e) {
      this.lastBuildError = e;
      throw e;
    }
  }

  getMiddlewares() {
    return [
      (req: Request, res: Response, next: NextFunction) => {
        const publicPath = this.publicPath;
        const relativePublicPath = isAbsoluteUrl(publicPath)
          ? new URL(publicPath).pathname
          : publicPath;
        const isMF =
          req.path.startsWith(`${relativePublicPath}${MF_VA_PREFIX}`) ||
          req.path.startsWith(`${relativePublicPath}${MF_DEP_PREFIX}`) ||
          req.path.startsWith(`${relativePublicPath}${MF_STATIC_PREFIX}`);
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
              new RegExp(`^${relativePublicPath}`),
              '/',
            );

            const realFilePath = join(this.opts.tmpBase!, relativePath);

            if (!existsSync(realFilePath)) {
              logger.error(`MFSU dist file: ${realFilePath} not found`);
              if (this.lastBuildError) {
                logger.error(`MFSU latest build error: `, this.lastBuildError);
              }

              res.status(404);
              return res.end();
            }

            const content = readFileSync(realFilePath);
            res.send(content);
          });
        } else {
          next();
        }
      },
      // 兜底依赖构建时, 代码中有指定 chunk 名的情况
      // TODO: should respect to publicPath
      express.static(this.opts.tmpBase!),
    ];
  }

  getBabelPlugins() {
    return [this.strategy.getBabelPlugin()];
  }

  getEsbuildLoaderHandler() {
    if (this.opts.strategy === 'eager') {
      const opts = this.strategy.getBabelPlugin()[1] as any;

      return [getImportHandlerV4(opts)];
    }

    const cache = new Map<string, any>();
    const checkOpts = this.strategy.getBabelPlugin()[1];

    return [
      getAwaitImportHandler({
        cache,
        opts: checkOpts,
      }),
    ] as any[];
  }

  public getCacheFilePath() {
    return this.strategy.getCacheFilePath();
  }
}

export function resolvePublicPath(config: Configuration): string {
  let publicPath = config.output?.publicPath ?? 'auto';
  if (publicPath === 'auto') {
    publicPath = '/';
  }

  assert(typeof publicPath === 'string', 'Not support function publicPath now');

  return publicPath;
}

export interface IMFSUStrategy {
  init(webpackConfig: Configuration): void;

  shouldBuild(): string | boolean;

  getBabelPlugin(): any[];

  getBuildDepPlugConfig(): IBuildDepPluginOpts;

  loadCache(): void;

  getCacheFilePath(): string;

  getDepModules(): Record<string, DepModule>;

  refresh(): void;

  writeCache(): void;
}
