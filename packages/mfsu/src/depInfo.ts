import { fsExtra, lodash, logger } from '@umijs/utils';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { MFSU } from './mfsu/mfsu';
import { ModuleGraph } from './moduleGraph';

interface IOpts {
  mfsu: MFSU;
}

export type DepModule = {
  file: string;
  version: string;
};

export interface IDepInfo {
  shouldBuild(): string | boolean;

  snapshot(): void;

  loadCache(): void;

  writeCache(): void;

  getCacheFilePath(): string;

  getDepModules(): Record<string, DepModule>;
}

export class DepInfo implements IDepInfo {
  private opts: IOpts;
  private readonly cacheFilePath: string;
  public moduleGraph: ModuleGraph = new ModuleGraph();
  private cacheDependency: object = {};

  constructor(opts: IOpts) {
    this.opts = opts;
    this.cacheFilePath = join(this.opts.mfsu.opts.tmpBase!, 'MFSU_CACHE.json');
  }

  shouldBuild() {
    if (
      !lodash.isEqual(
        this.cacheDependency,
        this.opts.mfsu.opts.getCacheDependency!(),
      )
    ) {
      return 'cacheDependency has changed';
    }

    if (this.moduleGraph.hasDepChanged()) {
      return 'moduleGraph has changed';
    }
    // fixme always rebuild in dev
    return false;
  }

  snapshot() {
    this.cacheDependency = this.opts.mfsu.opts.getCacheDependency!();
    this.moduleGraph.snapshotDeps();
  }

  loadCache() {
    if (existsSync(this.cacheFilePath)) {
      logger.info('[MFSU] restore cache');
      const { cacheDependency, moduleGraph } = JSON.parse(
        readFileSync(this.cacheFilePath, 'utf-8'),
      );
      this.cacheDependency = cacheDependency;
      this.moduleGraph.restore(moduleGraph);
    }
  }

  writeCache() {
    fsExtra.mkdirpSync(dirname(this.cacheFilePath));
    const newContent = JSON.stringify(
      {
        cacheDependency: this.cacheDependency,
        moduleGraph: this.moduleGraph.toJSON(),
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

    logger.info('[MFSU] write cache');
    writeFileSync(this.cacheFilePath, newContent, 'utf-8');
  }

  getDepModules() {
    return this.moduleGraph.depSnapshotModules;
  }

  getCacheFilePath() {
    return this.cacheFilePath;
  }
}
