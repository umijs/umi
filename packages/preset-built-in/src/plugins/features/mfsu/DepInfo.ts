import { IApi, IConfig } from '@umijs/types';
import { createDebug, lodash, winPath } from '@umijs/utils';
import assert from 'assert';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CWD, DEP_INFO_CACHE_FILE, MF_VA_PREFIX } from './constants';
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
  tmpDeps: IDeps;
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
  public cachePath: string;
  public webpackAlias: any;
  private api: IApi;
  private debouncedWriteCache: Function;

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
    this.webpackAlias = opts.webpackAlias || {};
    this.cachePath = join(this.cacheDir!, DEP_INFO_CACHE_FILE);
    this.debouncedWriteCache = lodash.debounce(this.writeCache.bind(this), 300);

    assert(
      ['development', 'production'].includes(this.mode),
      `[MFSU] Unsupported mode ${this.mode}`,
    );

    this.data = {
      deps: {},
      config: {},
      tmpDeps: {},
    };
  }

  loadCache() {
    const path = this.cachePath;
    try {
      if (existsSync(path)) {
        debug('cache exists');
        const data = JSON.parse(readFileSync(path, 'utf-8')) as IData;
        assert(data.deps, `[MFSU] cache parse failed, deps not found.`);

        const normalizedDeps = {};
        Object.keys(data.deps).forEach((key) => {
          const normalizeKey = key.replace(CWD, winPath(this.api.cwd));
          normalizedDeps[normalizeKey] = data.deps[key];
        });
        data.deps = normalizedDeps;
        const normalizedTmpDeps = {};
        Object.keys(data.tmpDeps || {}).forEach((key) => {
          const normalizeKey = key.replace(CWD, winPath(this.api.cwd));
          normalizedDeps[normalizeKey] = data.tmpDeps[key];
        });
        data.tmpDeps = normalizedTmpDeps;
        this.data = data;
      }
    } catch (e) {
      throw new Error(`${e.message}, try to remove cache file and retry.`);
    }
  }

  addTmpDep(dep: string | ITmpDep, from: string) {
    debug(`add tmp dep ${dep}`);
    if (typeof dep === 'object' && dep.key && dep.version) {
      this.setTmpDep({ ...dep, from });
    } else if (typeof dep === 'string') {
      const version = getDepVersion({
        dep,
        cwd: this.cwd,
        webpackAlias: this.webpackAlias,
        from,
      });
      this.setTmpDep({ key: dep, version, from });
    }
  }

  setTmpDep(opts: { key: string; version: string; from: string }) {
    if (
      this.data.tmpDeps[opts.key] &&
      this.data.tmpDeps[opts.key] !== opts.version
    ) {
      throw new Error(
        `[MFSU] dep ${opts.key} conflicts of ${opts.version} and ${
          this.data.tmpDeps[opts.key]
        }`,
      );
    }
    this.data.tmpDeps[opts.key] = opts.version;
    this.debouncedWriteCache();
  }

  loadTmpDeps(): { shouldBuild: boolean } {
    const shouldBuild = this.shouldBuild();
    if (shouldBuild) {
      Object.assign(this.data.deps, this.data.tmpDeps);
      this.data.config = this.getConfig();
      // clear tmp deps
      this.data.tmpDeps = {};
    }
    return { shouldBuild };
  }

  shouldBuild(): boolean {
    debug('tmpDeps', this.data.tmpDeps);

    // 没有变更，不 build
    if (!Object.keys(this.data.tmpDeps).length) {
      return false;
    }

    // 没有 remoteEntry 时始终预编译依赖
    if (!existsSync(join(this.cacheDir, `${MF_VA_PREFIX}remoteEntry.js`))) {
      return true;
    }

    // 配置变更后，强制 build
    if (!lodash.isEqual(this.getConfig(), this.data.config)) {
      debug(
        `config changed, new: ${JSON.stringify(
          this.getConfig(),
        )}, origin: ${JSON.stringify(this.data.config)}`,
      );
      return true;
    }

    debug('this.data.deps', this.data.deps);
    if (this.mode === 'production') {
      return !lodash.isEqual(this.data.tmpDeps, this.data.deps);
    } else {
      for (const key of Object.keys(this.data.tmpDeps)) {
        // 新增或修改
        if (this.data.deps[key] !== this.data.tmpDeps[key]) {
          return true;
        }
      }
      return false;
    }
  }

  getConfig() {
    return {
      // 会触发依赖重新编译的配置
      theme: this.api.config.theme || {},
      externals: this.api.config.externals || {},
      runtimePublicPath: this.api.config.runtimePublicPath || false,

      // umi 版本变更后需要重新编译一次
      // TODO: ModuleGraph 上线后可以删掉这个
      umiVersion: process.env.UMI_VERSION,
      bigfishVersion: process.env.BIGFISH_VERSION || 'null',
    };
  }

  writeCache() {
    const noAbsDeps = {};
    Object.keys(this.data.deps).forEach((depName) => {
      const noAbsDepName = depName.replace(winPath(this.api.cwd), CWD);
      noAbsDeps[noAbsDepName] = this.data.deps[depName];
    });

    const content = JSON.stringify({ ...this.data, deps: noAbsDeps }, null, 2);
    writeFileSync(this.cachePath, content, 'utf-8');
  }
}
