import { setup } from '@umijs/bundler-webpack';
import webpack from '@umijs/bundler-webpack/compiled/webpack';
import { chalk, fsExtra, lodash, logger, rimraf } from '@umijs/utils';
import { isAbsolute, join, relative } from 'path';
import { Worker } from 'worker_threads';
import { LazySourceCodeCache } from '../../libs/folderCache/LazySourceCodeCache';
import { GenerateFilesFn, IApi } from '../../types';
import { getProjectFileList } from '../../utils/projectFileList';
import { getBabelOpts } from '../dev/getBabelOpts';

export abstract class MFSUUtilBase {
  protected mfsuCacheBase: string;
  protected cliName: string;
  constructor(readonly api: IApi) {
    const cacheBase =
      api.config.cacheDirectoryPath || join(api.cwd, 'node_modules/.cache');

    this.mfsuCacheBase =
      api.config?.mfsu?.cacheDirectoryPath || join(cacheBase, 'mfsu');

    this.cliName = this.api.appData.umi.cliName;
  }

  abstract jsonFilePath(): string;

  abstract getCacheJSON(): string;

  abstract listDeps(): void;

  abstract build(force?: boolean): Promise<void>;
  async prepare() {
    const api = this.api;
    logger.info(
      chalk.cyan.bold(`${api.appData.umi.name} v${api.appData.umi.version}`),
    );

    // clear tmp
    rimraf.sync(api.paths.absTmpPath);

    const generate: GenerateFilesFn = async (opts) => {
      await api.applyPlugins({
        key: 'onGenerateFiles',
        args: {
          files: opts.files || null,
          isFirstTime: opts.isFirstTime,
        },
      });
    };

    await generate({
      isFirstTime: true,
    });

    const {
      babelPreset,
      beforeBabelPlugins,
      beforeBabelPresets,
      extraBabelPlugins,
      extraBabelPresets,
    } = await getBabelOpts({ api });
    const chainWebpack = async (memo: any, args: Object) => {
      await api.applyPlugins({
        key: 'chainWebpack',
        type: api.ApplyPluginsType.modify,
        initialValue: memo,
        args,
      });
    };
    const modifyWebpackConfig = async (memo: any, args: Object) => {
      return await api.applyPlugins({
        key: 'modifyWebpackConfig',
        initialValue: memo,
        args,
      });
    };

    let srcCodeCache: LazySourceCodeCache | undefined;
    let startBuildWorker: (deps: any[]) => Worker = (() => {}) as any;

    if (api.config.mfsu?.strategy === 'eager') {
      srcCodeCache = new LazySourceCodeCache({
        cwd: api.paths.absSrcPath,
        cachePath: join(
          api.paths.absNodeModulesPath,
          '.cache',
          'mfsu',
          'mfsu_v4',
        ),
      });
      const fileList = getProjectFileList(api);
      await srcCodeCache!.init(fileList);
    }

    const entry = await api.applyPlugins({
      key: 'modifyEntry',
      initialValue: {
        umi: join(api.paths.absTmpPath, 'umi.ts'),
      },
    });

    const opts: any = {
      config: api.config,
      pkg: api.pkg,
      cwd: api.cwd,
      rootDir: process.cwd(),
      entry,
      port: api.appData.port,
      host: api.appData.host,
      ip: api.appData.ip,
      ...{ babelPreset, chainWebpack, modifyWebpackConfig },
      beforeBabelPlugins,
      beforeBabelPresets,
      extraBabelPlugins,
      extraBabelPresets,
      beforeMiddlewares: [],
      // vite 模式使用 ./plugins/ViteHtmlPlugin.ts 处理
      afterMiddlewares: [],
      onDevCompileDone(opts: any) {
        // debouncedPrintMemoryUsage();
        api.appData.bundleStatus.done = true;
        api.applyPlugins({
          key: 'onDevCompileDone',
          args: opts,
        });
      },
      onProgress(opts: any) {
        api.appData.bundleStatus.progresses = opts.progresses;
      },
      onMFSUProgress(opts: any) {
        api.appData.mfsuBundleStatus = {
          ...api.appData.mfsuBundleStatus,
          ...opts,
        };
      },
      mfsuWithESBuild: api.config.mfsu?.esbuild,
      mfsuStrategy: api.config.mfsu?.strategy,
      cache: {
        buildDependencies: [
          api.pkgPath,
          api.service.configManager!.mainConfigFile || '',
        ].filter(Boolean),
      },
      srcCodeCache,
      mfsuInclude: lodash.union([
        ...MFSU_EAGER_DEFAULT_INCLUDE,
        ...(api.config.mfsu?.include || []),
      ]),
      startBuildWorker,
      onBeforeMiddleware(app: any) {
        api.applyPlugins({
          key: 'onBeforeMiddleware',
          args: {
            app,
          },
        });
      },
    };

    await api.applyPlugins({
      key: 'onBeforeCompiler',
      args: { compiler: 'webpack', opts },
    });

    return opts;
  }
  removeCacheJSON() {
    return fsExtra.removeSync(this.jsonFilePath());
  }
  clearAllCache() {
    return fsExtra.removeSync(this.mfsuCacheBase);
  }

  printDeps(deps: any) {
    const depsList = Object.keys(deps)
      .map((key) => {
        const version = deps[key].version;
        return { dep: shortDep(key, this.api.cwd), version };
      })
      .sort((a, b) => b.dep.localeCompare(a.dep));

    for (const { dep, version } of depsList) {
      console.log(`${dep}@${version}`);
    }
  }
}

export class EagerUtil extends MFSUUtilBase {
  jsonFilePath(): string {
    return join(this.mfsuCacheBase, 'MFSU_CACHE_v4.json');
  }
  getCacheJSON(): any {
    const jsonFile = join(this.mfsuCacheBase, 'MFSU_CACHE_v4.json');
    if (fsExtra.existsSync(jsonFile)) {
      return require(jsonFile);
    } else {
      this.api.logger.error(
        `MFSU_CACHE_v4.json not found, please run \`${this.cliName} mfsu build\` or \`${this.cliName} dev\` first`,
      );
    }
  }
  async build() {
    const opts = await this.prepare();
    const { mfsu } = await setup(opts);

    await mfsu!.buildDeps({ useWorker: false });
    this.api.logger.info('[MFSU][eager] build success');
  }

  listDeps(): void {
    const cacheJSON = this.getCacheJSON();
    const deps = cacheJSON['dep'] || {};
    this.printDeps(deps);
  }
}

function shortDep(p: string, base: string): string {
  if (isAbsolute(p)) {
    const i = p.lastIndexOf('node_modules');
    if (i > -1) {
      return p.slice(i + 'node_modules'.length + 1);
    } else {
      return relative(base, p);
    }
  } else {
    return p;
  }
}
export class NormalUtil extends MFSUUtilBase {
  jsonFilePath(): string {
    return join(this.mfsuCacheBase, 'MFSU_CACHE.json');
  }
  getCacheJSON(): any {
    const jsonFile = join(this.mfsuCacheBase, 'MFSU_CACHE.json');
    if (fsExtra.existsSync(jsonFile)) {
      return require(jsonFile);
    } else {
      this.api.logger.error(
        `MFSU_CACHE_v4.json not found, please run \`${this.cliName} dev\` first`,
      );
    }
  }
  listDeps() {
    const cacheJSON = this.getCacheJSON();
    const deps = lodash.get(cacheJSON, 'moduleGraph.depModules', {});

    this.printDeps(deps);
  }

  async build(force: boolean) {
    if (force) {
      await this.normalBuild();
    } else {
      this.api.logger.info(
        `\n  mfsu with normal strategy not support build command,  please use \`${this.cliName} dev\``,
      );
    }
  }
  private async normalBuild() {
    const opts = await this.prepare();
    const { mfsu, webpackConfig } = await setup(opts);
    webpackConfig.watch = false;

    // prevent build deps in
    mfsu!.depBuilder!.isBuilding = true;

    // collect deps info
    await new Promise<void>((resolve, reject) => {
      const compiler = webpack(webpackConfig);
      compiler.run((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
        compiler.close(() => {});
      });
    });

    mfsu!.depBuilder!.isBuilding = false;
    mfsu!.buildDepsAgain = false;

    await mfsu?.buildDeps({ useWorker: false });

    this.api.logger.info('[MFSU] build success');
    return;
  }
}

const MFSU_EAGER_DEFAULT_INCLUDE = [
  'react',
  'react-error-overlay',
  'react/jsx-dev-runtime',
  '@umijs/utils/compiled/strip-ansi',
];
