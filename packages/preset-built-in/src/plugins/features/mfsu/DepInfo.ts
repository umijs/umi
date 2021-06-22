import { IApi, IConfig } from '@umijs/types';
import { createDebug, lodash } from '@umijs/utils';
import assert from 'assert';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DEP_INFO_CACHE_FILE } from './constants';
import { getDepVersion } from './getDepVersion';
import { TMode } from './mfsu';

const debug = createDebug('umi:mfsu:DepInfo');

export enum BUILD_STATUS {
  IDLE,
  BUILDING,
  SUCCESS,
  FAIL,
}

export interface IDeps {
  [name: string]: string;
}

export interface IData {
  deps: IDeps;
  config: Partial<IConfig>;
}

export interface ITmpDep {
  key: string;
  version: string;
}

export default class DepInfo {
  public data: IData;
  public cacheDir: string;
  public cwd: string;
  public mode: TMode;
  public tmpDeps: IDeps;
  public cachePath: string;
  public webpackAlias: any;
  private api: IApi;

  constructor(opts: {
    tmpDir: string;
    api: IApi;
    cwd: string;
    mode: TMode;
    webpackAlias: any;
  }) {
    this.api = opts.api;
    this.cwd = opts.cwd;
    this.cacheDir = opts.tmpDir;
    this.mode = opts.mode;
    this.tmpDeps = {};
    this.webpackAlias = opts.webpackAlias || {};
    this.cachePath = join(this.cacheDir!, DEP_INFO_CACHE_FILE);

    assert(
      ['development', 'production'].includes(this.mode),
      `[MFSU] Unsupported mode ${this.mode}`,
    );

    this.data = {
      deps: {},
      config: {},
    };
  }

  loadCache() {
    const path = this.cachePath;
    try {
      if (existsSync(path)) {
        debug('cache exists');
        const data = JSON.parse(readFileSync(path, 'utf-8')) as IData;
        assert(data.deps, `[MFSU] cache parse failed, deps not found.`);
        this.data = data;
      }
    } catch (e) {
      throw new Error(`${e.message}, try to remove cache file and retry.`);
    }
  }

  addTmpDep(dep: string | ITmpDep) {
    debug(`add tmp dep ${dep}`);
    if (typeof dep === 'object' && dep.key && dep.version) {
      this.setTmpDep(dep);
    } else if (typeof dep === 'string') {
      const version = getDepVersion({
        dep,
        cwd: this.cwd,
        webpackAlias: this.webpackAlias,
      });
      this.setTmpDep({ key: dep, version });
    }
  }

  setTmpDep(opts: { key: string; version: string }) {
    if (this.tmpDeps[opts.key] && this.tmpDeps[opts.key] !== opts.version) {
      throw new Error(
        `[MFSU] dep ${opts.key} conflicts of ${opts.version} and ${
          this.tmpDeps[opts.key]
        }`,
      );
    }
    this.tmpDeps[opts.key] = opts.version;
  }

  loadTmpDeps(): { shouldBuild: boolean } {
    const shouldBuild = this.shouldBuild();
    if (shouldBuild) {
      Object.assign(this.data.deps, this.tmpDeps);
      this.data.config = this.getConfig();
      // clear tmp deps
      this.tmpDeps = {};
    }
    return { shouldBuild };
  }

  shouldBuild(): boolean {
    debug('tmpDeps', this.tmpDeps);

    // 没有变更，不 build
    if (!Object.keys(this.tmpDeps).length) {
      return false;
    }

    // 配置变更后，强制 build
    if (!lodash.isEqual(this.getConfig(), this.data.config)) {
      return true;
    }

    debug('this.data.deps', this.data.deps);
    if (this.mode === 'production') {
      return !lodash.isEqual(this.tmpDeps, this.data.deps);
    } else {
      for (const key of Object.keys(this.tmpDeps)) {
        // 新增或修改
        if (this.data.deps[key] !== this.tmpDeps[key]) {
          return true;
        }
      }
      return false;
    }
  }

  getConfig() {
    return {
      // 目前只有 theme 会触发依赖重新编译
      theme: this.api.config.theme || {},
    };
  }

  writeCache() {
    const content = JSON.stringify(this.data, null, 2);
    writeFileSync(this.cachePath, content, 'utf-8');
  }
}
