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
  // 如果 importer 不存在, 需要保证 file 可以从 cwd 解析到
  importer?: string;
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
      try {
        const { cacheDependency, moduleGraph } = JSON.parse(
          readFileSync(this.cacheFilePath, 'utf-8'),
        );
        this.cacheDependency = cacheDependency;
        this.moduleGraph.restore(moduleGraph);
      } catch (e) {
        logger.error('[MFSU] restore cache failed', e);
        logger.error('please `rm -rf  node_modules/.cache`, and try again');
        // 如果 cache 恢复失败, 依赖信息是不完整, 项目代码编译使用了缓存, 那么分析出来的依赖是不完整的
        // 错误透传出去, 让用户删除缓存重新启动才能彻底解决
        throw e;
      }
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
