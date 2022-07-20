import { printHelp } from '@umijs/utils';
import awaitImport from '../babelPlugins/awaitImport/awaitImport';
import { getRealPath } from '../babelPlugins/awaitImport/getRealPath';
import { Dep } from '../dep/dep';
import { DepInfo, DepModule } from '../depInfo';
import { IBuildDepPluginOpts } from '../webpackPlugins/buildDepPlugin';
import type { IMFSUStrategy, MFSU } from './mfsu';

export class StrategyCompileTime implements IMFSUStrategy {
  private readonly mfsu: MFSU;
  private depInfo: DepInfo;

  constructor({ mfsu }: { mfsu: MFSU }) {
    this.mfsu = mfsu;
    this.depInfo = new DepInfo({ mfsu });
  }

  getDepModules(): Record<string, DepModule> {
    return this.depInfo.getDepModules();
  }

  getCacheFilePath(): string {
    return this.depInfo.getCacheFilePath();
  }

  init() {}

  shouldBuild() {
    return this.depInfo.shouldBuild();
  }

  loadCache() {
    this.depInfo.loadCache();
  }

  writeCache() {
    this.depInfo.writeCache();
  }

  refresh() {
    this.depInfo.snapshot();
  }

  getBabelPlugin(): any[] {
    return [awaitImport, this.getAwaitImportCollectOpts()];
  }

  getBuildDepPlugConfig(): IBuildDepPluginOpts {
    const mfsu = this.mfsu;

    return {
      onCompileDone: () => {
        if (mfsu.depBuilder.isBuilding) {
          mfsu.buildDepsAgain = true;
        } else {
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
    };
  }

  private getAwaitImportCollectOpts() {
    const mfsuOpts = this.mfsu.opts;
    const mfsu = this.mfsu;

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
                cwd: mfsuOpts.cwd!,
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
      exportAllMembers: mfsuOpts.exportAllMembers,
      unMatchLibs: unMatches,
      remoteName: mfsuOpts.mfName,
      alias: mfsu.alias,
      externals: mfsu.externals,
    };
  }
}
