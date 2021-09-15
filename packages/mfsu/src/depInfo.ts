import { lodash } from '@umijs/utils';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { MFSU } from './index';
import { ModuleGraph } from './moduleGraph';

interface IOpts {
  mfsu: MFSU;
}

export class DepInfo {
  private opts: IOpts;
  public cacheFilePath: string;
  public moduleGraph: ModuleGraph = new ModuleGraph();
  public cacheDependency: object = {};
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
      return true;
    }

    if (this.moduleGraph.hasDepChanged()) {
      return true;
    }
  }

  snapshot() {
    this.cacheDependency = this.opts.mfsu.opts.getCacheDependency!();
    this.moduleGraph.snapshotDeps();
  }

  loadCache() {
    if (existsSync(this.cacheFilePath)) {
      const { cacheDependency, moduleGraph } = JSON.parse(
        readFileSync(this.cacheFilePath, 'utf-8'),
      );
      this.cacheDependency = cacheDependency;
      this.moduleGraph.restore(moduleGraph);
    }
  }

  writeCache() {
    writeFileSync(
      this.cacheFilePath,
      JSON.stringify(
        {
          cacheDependency: this.cacheDependency,
          moduleGraph: this.moduleGraph.toJSON(),
        },
        null,
        2,
      ),
      'utf-8',
    );
  }
}
