import { logger, printHelp } from '@umijs/utils';
import { checkMatch } from '../babelPlugins/awaitImport/checkMatch';
import mfImport from '../babelPlugins/awaitImport/MFImport';
import { StaticDepInfo } from '../staticDepInfo/staticDepInfo';
import { IBuildDepPluginOpts } from '../webpackPlugins/buildDepPlugin';
import type { IMFSUStrategy, MFSU } from './mfsu';
import type { Configuration } from 'webpack';
import { extractBabelPluginImportOptions } from '../utils/webpackUtils';

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

        // webpack init run
        if (!c.modifiedFiles || c.modifiedFiles.size === 0) {
          return;
        }

        // if no js code file changed, just compile, dont wait static analysis
        if (
          !hasJSCodeFiles(c.modifiedFiles) &&
          !hasJSCodeFiles(c.removedFiles)
        ) {
          return;
        }

        const start = Date.now();
        let event = this.staticDepInfo.getProducedEvent();
        while (event.length === 0) {
          await sleep(100);
          event = this.staticDepInfo.getProducedEvent();
          if (Date.now() - start > 5000) {
            logger.warn('webpack wait mfsu deps too long');
            break;
          }
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

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

const REG_CODE_EXT = /\.(jsx|js|ts|tsx)$/;

function hasJSCodeFiles(files: ReadonlySet<string>) {
  for (let file of files.values()) {
    if (REG_CODE_EXT.test(file)) {
      return true;
    }
  }
  return false;
}
