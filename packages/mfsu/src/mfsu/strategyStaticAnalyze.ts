import { logger, printHelp, winPath } from '@umijs/utils';
import type { Configuration } from 'webpack';
import { checkMatch } from '../babelPlugins/awaitImport/checkMatch';
import mfImport from '../babelPlugins/awaitImport/MFImport';
import { StaticDepInfo } from '../staticDepInfo/staticDepInfo';
import { extractBabelPluginImportOptions } from '../utils/webpackUtils';
import { IBuildDepPluginOpts } from '../webpackPlugins/buildDepPlugin';
import type { IMFSUStrategy, MFSU } from './mfsu';

export class StaticAnalyzeStrategy implements IMFSUStrategy {
  private readonly mfsu: MFSU;
  private staticDepInfo: StaticDepInfo;

  constructor({ mfsu, srcCodeCache }: { mfsu: MFSU; srcCodeCache: any }) {
    this.mfsu = mfsu;

    this.staticDepInfo = new StaticDepInfo({
      mfsu,
      srcCodeCache,
    });
  }

  init(webpackConfig: Configuration) {
    const config = extractBabelPluginImportOptions(webpackConfig);
    this.staticDepInfo.setBabelPluginImportConfig(config);

    this.staticDepInfo.init();
  }

  getDepModules() {
    return this.staticDepInfo.getDepModules();
  }

  getCacheFilePath(): string {
    return this.staticDepInfo.getCacheFilePath();
  }

  shouldBuild() {
    return this.staticDepInfo.shouldBuild();
  }

  writeCache() {
    this.staticDepInfo.writeCache();
  }

  getBabelPlugin(): any[] {
    return [mfImport, this.getMfImportOpts()];
  }

  private getMfImportOpts() {
    const mfsu = this.mfsu;
    const mfsuOpts = this.mfsu.opts;

    const userUnMatches = mfsuOpts.unMatchLibs || [];
    const sharedUnMatches = Object.keys(mfsuOpts.shared || {});
    const remoteAliasUnMatches = (mfsuOpts.remoteAliases || []).map(
      (str) => new RegExp(`^${str}`),
    );

    const unMatches = [
      ...userUnMatches,
      ...sharedUnMatches,
      ...remoteAliasUnMatches,
    ];

    return {
      resolveImportSource: (source: string) => {
        const match = checkMatch({
          value: source,
          filename: '_.js',
          opts: {
            exportAllMembers: mfsuOpts.exportAllMembers,
            unMatchLibs: unMatches,
            remoteName: mfsuOpts.mfName,
            alias: mfsu.alias,
            externals: mfsu.externals,
          },
        });

        if (!match.isMatch) {
          return source;
        }

        const depMat = this.staticDepInfo.getDependencies();

        const m = depMat[match.value];
        if (m) {
          return m.replaceValue;
        }

        return match.value;
      },
      exportAllMembers: mfsuOpts.exportAllMembers,
      unMatchLibs: mfsuOpts.unMatchLibs,
      remoteName: mfsuOpts.mfName,
      alias: mfsu.alias,
      externals: mfsu.externals,
    };
  }

  getBuildDepPlugConfig(): IBuildDepPluginOpts {
    const mfsu = this.mfsu;
    return {
      beforeCompile: async () => {
        if (mfsu.depBuilder.isBuilding) {
          mfsu.buildDepsAgain = true;
        } else {
          logger.event(`[MFSU][eager] start build deps`);
          this.staticDepInfo.consumeAllProducedEvents();
          mfsu
            .buildDeps()
            .then(() => {
              mfsu.onProgress({
                done: true,
              });
            })
            .catch((e: Error) => {
              printHelp.runtime(e);
              mfsu.onProgress({
                done: true,
              });
            });
        }
      },
      onFileChange: async (c) => {
        logger.debug(
          'webpack found changes modified:',
          c.modifiedFiles,
          'removed:',
          c.removedFiles,
        );

        const srcPath = this.staticDepInfo.opts.srcCodeCache.getSrcPath();

        const fileEvents = [
          ...this.staticDepInfo.opts.srcCodeCache.replayChangeEvents(),

          ...extractJSCodeFiles(srcPath, c.modifiedFiles).map((f) => {
            return {
              event: 'change' as const,
              path: f,
            };
          }),
          ...extractJSCodeFiles(srcPath, c.removedFiles).map((f) => {
            return {
              event: 'unlink' as const,
              path: f,
            };
          }),
        ];
        logger.debug('all file events', fileEvents);

        // if no js code file changed, just compile, no need to analysis
        if (fileEvents.length === 0) {
          return;
        }

        const start = Date.now();

        try {
          await this.staticDepInfo.opts.srcCodeCache.handleFileChangeEvents(
            fileEvents,
          );
        } catch (e) {
          logger.error('MFSU[eager] analyze dependencies failed with error', e);
        }

        logger.debug(`webpack waited ${Date.now() - start} ms`);
      },
      onCompileDone: () => {
        // fixme if mf module finished earlier than src compile
      },
    };
  }

  loadCache() {
    this.staticDepInfo.loadCache();
  }

  refresh() {
    this.staticDepInfo.snapshot();
  }
}

const REG_CODE_EXT = /\.(jsx|js|ts|tsx)$/;

function extractJSCodeFiles(folderBase: string, files: ReadonlySet<string>) {
  const jsFiles: string[] = [];
  if (!files) {
    return jsFiles;
  }

  for (let file of files.values()) {
    if (
      winPath(file).startsWith(winPath(folderBase)) &&
      REG_CODE_EXT.test(file) &&
      file.indexOf('node_modules') === -1
    ) {
      jsFiles.push(file);
    }
  }
  return jsFiles;
}
