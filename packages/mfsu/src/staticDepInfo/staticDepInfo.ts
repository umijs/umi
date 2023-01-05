import { ImportSpecifier } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { fsExtra, lodash, logger } from '@umijs/utils';
import { existsSync, readFileSync, writeFileSync } from 'fs';
// @ts-ignore
import why from 'is-equal/why';
import { dirname, join } from 'path';
import { checkMatch } from '../babelPlugins/awaitImport/checkMatch';
import { Dep } from '../dep/dep';
import { MFSU } from '../mfsu/mfsu';
import createPluginImport from './simulations/babel-plugin-import';

type FileChangeEvent = {
  event: 'unlink' | 'change' | 'add';
  path: string;
};
type MergedCodeInfo = {
  imports: readonly ImportSpecifier[];

  code: string;
  events: FileChangeEvent[];
};
type AutoUpdateSrcCodeCache = {
  register(listener: (info: MergedCodeInfo) => void): void;
  getMergedCode(): MergedCodeInfo;
  handleFileChangeEvents(events: FileChangeEvent[]): void;
  replayChangeEvents(): FileChangeEvent[];
  getSrcPath(): string;
};

interface IOpts {
  mfsu: MFSU;
  srcCodeCache: AutoUpdateSrcCodeCache;
  safeList?: string[];
}

export type Match = ReturnType<typeof checkMatch> & { version: string };

type Matched = Record<string, Match>;

export class StaticDepInfo {
  public opts: IOpts;
  private readonly cacheFilePath: string;

  private mfsu: MFSU;
  private readonly include: string[];
  private currentDep: Record<string, Match> = {};
  private builtWithDep: Record<string, Match> = {};
  private cacheDependency: object = {};

  private produced: { changes: unknown[] }[] = [];
  private readonly cwd: string;
  private readonly runtimeSimulations: {
    packageName: string;
    handleImports: <T>(
      opts: {
        imports: ImportSpecifier[];
        rawCode: string;
        mfName: string;
        alias: Record<string, string>;
        pathToVersion(p: string): string;
      },
      handleConfig?: T,
    ) => Match[];
  }[];

  constructor(opts: IOpts) {
    this.mfsu = opts.mfsu;

    this.include = this.mfsu.opts.include || [];

    this.opts = opts;
    this.cacheFilePath = join(
      this.opts.mfsu.opts.tmpBase!,
      'MFSU_CACHE_v4.json',
    );

    this.cwd = this.mfsu.opts.cwd!;

    opts.srcCodeCache.register((info) => {
      this.currentDep = this._getDependencies(info.code, info.imports);
    });

    this.runtimeSimulations = [];
  }

  getProducedEvent() {
    return this.produced;
  }

  consumeAllProducedEvents() {
    this.produced = [];
  }

  shouldBuild() {
    const currentCacheDep = this.opts.mfsu.opts.getCacheDependency!();

    if (!lodash.isEqual(this.cacheDependency, currentCacheDep)) {
      if (process.env.DEBUG_UMI) {
        const reason = why(this.cacheDependency, currentCacheDep);
        logger.info(
          '[MFSU][eager]: isEqual(cacheDependency,currentCacheDep) === false, because ',
          reason,
        );
      }

      return 'cacheDependency has changed';
    }

    if (lodash.isEqual(this.builtWithDep, this.currentDep)) {
      return false;
    } else {
      if (process.env.DEBUG_UMI) {
        const reason = why(this.builtWithDep, this.currentDep);
        logger.info(
          '[MFSU][eager]: isEqual(oldDep,newDep) === false, because ',
          reason,
        );
      }
      return 'dependencies changed';
    }
  }

  getDepModules() {
    const map = this.getDependencies();

    const staticDeps: Record<string, { file: string; version: string }> = {};
    const keys = Object.keys(map);
    for (const k of keys) {
      staticDeps[k] = {
        file: k,
        version: map[k].version,
      };
    }

    return staticDeps;
  }

  snapshot() {
    this.builtWithDep = this.currentDep;
    this.cacheDependency = this.mfsu.opts.getCacheDependency!();
  }

  loadCache() {
    if (existsSync(this.cacheFilePath)) {
      try {
        const { dep = {}, cacheDependency = {} } = JSON.parse(
          readFileSync(this.cacheFilePath, 'utf-8'),
        );

        this.builtWithDep = dep;
        this.cacheDependency = cacheDependency;
        logger.info('[MFSU][eager] restored cache');
      } catch (e) {
        logger.warn(
          '[MFSU][eager] restore cache failed, fallback to Empty dependency',
          e,
        );
      }
    }
  }

  writeCache() {
    fsExtra.mkdirpSync(dirname(this.cacheFilePath));
    const newContent = JSON.stringify(
      {
        dep: this.builtWithDep,
        cacheDependency: this.cacheDependency,
      },
      null,
      2,
    );
    if (
      existsSync(this.cacheFilePath) &&
      readFileSync(this.cacheFilePath, 'utf-8') === newContent
    ) {
      return;
    }

    logger.info('[MFSU][eager] write cache');
    writeFileSync(this.cacheFilePath, newContent, 'utf-8');
  }

  public getCacheFilePath() {
    return this.cacheFilePath;
  }

  public getDependencies() {
    return this.currentDep;
  }

  init() {
    const merged = this.opts.srcCodeCache.getMergedCode();
    this.currentDep = this._getDependencies(merged.code, merged.imports);
  }

  private _getDependencies(
    bigCodeString: string,
    imports: readonly ImportSpecifier[],
  ): Record<string, Match> {
    const start = Date.now();

    const cwd = this.mfsu.opts.cwd!;

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

    const opts = {
      exportAllMembers: this.mfsu.opts.exportAllMembers,
      unMatchLibs: unMatches,
      remoteName: this.mfsu.opts.mfName,
      alias: this.mfsu.alias,
      externals: this.mfsu.externals,
    };

    const matched: Record<string, Match> = {};
    const unMatched = new Set<string>();

    const pkgNames = this.runtimeSimulations.map(
      ({ packageName }) => packageName,
    );
    const groupedMockImports: Record<string, ImportSpecifier[]> = {};

    for (const imp of imports) {
      // when import('base/${comp}')
      if (!imp.n) {
        continue;
      }

      if (pkgNames.indexOf(imp.n!) >= 0) {
        const name = imp.n!;
        if (groupedMockImports[name]) {
          groupedMockImports[name].push(imp);
        } else {
          groupedMockImports[name] = [imp];
        }
        continue;
      }

      if (unMatched.has(imp.n!)) {
        continue;
      }

      if (matched[imp.n!]) {
        continue;
      }

      const match = checkMatch({
        value: imp.n as string,
        depth: 1,
        filename: '_.js',
        opts,
      });

      if (match.isMatch) {
        matched[match.value] = {
          ...match,
          version: Dep.getDepVersion({
            dep: match.value,
            cwd,
          }),
        };
      } else {
        unMatched.add(imp.n!);
      }
    }

    this.simulateRuntimeTransform(matched, groupedMockImports, bigCodeString);

    this.appendIncludeList(matched, opts);

    logger.debug('[MFSU][eager] _getDependencies costs', Date.now() - start);
    return matched;
  }

  private simulateRuntimeTransform(
    matched: Matched,
    groupedImports: Record<string, ImportSpecifier[]>,
    rawCode: string,
  ) {
    for (const mock of this.runtimeSimulations) {
      const name = mock.packageName;

      const pathToVersion = (dep: string) => {
        return Dep.getDepVersion({
          dep,
          cwd: this.cwd,
        });
      };

      const ms = mock.handleImports({
        imports: groupedImports[name],
        rawCode,
        alias: this.mfsu.alias,
        mfName: this.mfsu.opts.mfName!,
        pathToVersion,
      });

      for (const m of ms) {
        matched[m.value] = m;
      }
    }
  }

  private appendIncludeList(matched: Matched, opts: any) {
    for (const p of this.include) {
      const match = checkMatch({
        value: p,
        depth: 1,
        filename: '_.js',
        opts,
      });
      if (match.isMatch) {
        matched[match.value] = {
          ...match,
          version: Dep.getDepVersion({
            dep: match.value,
            cwd: this.cwd,
          }),
        };
      }
    }
  }

  async allRuntimeHelpers() {
    // todo mfsu4
  }

  setBabelPluginImportConfig(config: Map<string, any>) {
    for (const [key, c] of config.entries()) {
      this.runtimeSimulations.push({
        packageName: key,
        handleImports: createPluginImport(c),
      });
    }
  }
}
