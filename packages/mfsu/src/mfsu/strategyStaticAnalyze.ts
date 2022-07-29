import { logger, printHelp } from '@umijs/utils';
import { checkMatch } from '../babelPlugins/awaitImport/checkMatch';
import mfImport from '../babelPlugins/awaitImport/MFImport';
import { StaticDepInfo } from '../staticDepInfo/staticDepInfo';
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

  init() {
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
        logger.event(`[MFSU][eager] start build deps`);
        if (mfsu.depBuilder.isBuilding) {
          mfsu.buildDepsAgain = true;
        } else {
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

        const start = Date.now();
        let event = this.staticDepInfo.getProducedEvent();
        while (event.length === 0) {
          await sleep(200);
          event = this.staticDepInfo.getProducedEvent();
          if (Date.now() - start > 5000) {
            logger.warn('webpack wait mfsu deps too long');
            break;
          }
        }
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
