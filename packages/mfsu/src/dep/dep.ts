import { pkgUp, winPath } from '@umijs/utils';
import assert from 'assert';
import enhancedResolve from 'enhanced-resolve';
import { readFileSync } from 'fs';
import { isAbsolute, join } from 'path';
import { MF_VA_PREFIX } from '../constants';
import { MFSU } from '../mfsu';
import { trimFileContent } from '../utils/trimFileContent';
import { getExposeFromContent } from './getExposeFromContent';

const resolver = enhancedResolve.create({
  mainFields: ['module', 'browser', 'main'], // es module first
  extensions: ['.js', '.json', '.mjs'],
  exportsFields: ['exports'],
  conditionNames: ['import', 'module', 'require', 'node'],
});

async function resolve(context: string, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    resolver(context, path, (err: Error, result: string) =>
      err ? reject(err) : resolve(result),
    );
  });
}

export class Dep {
  public file: string;
  public version: string;
  public cwd: string;
  public shortFile: string;
  public normalizedFile: string;
  public filePath: string;
  public mfsu: MFSU;

  constructor(opts: {
    file: string;
    version: string;
    cwd: string;
    mfsu: MFSU;
  }) {
    this.file = winPath(opts.file);
    this.version = opts.version;
    this.cwd = opts.cwd;
    this.shortFile = this.file;
    this.normalizedFile = this.shortFile.replace(/\//g, '_').replace(/:/g, '_');
    this.filePath = `${MF_VA_PREFIX}${this.normalizedFile}.js`;
    this.mfsu = opts.mfsu;
  }

  async buildExposeContent() {
    // node natives
    // @ts-ignore
    const isNodeNatives = !!process.binding('natives')[this.file];
    if (isNodeNatives) {
      return trimFileContent(
        this.mfsu.opts.excludeNodeNatives
          ? `
const _ = require('${this.file}');
module.exports = _;
      `
          : `
import _ from '${this.file}';
export default _;
export * from '${this.file}';
      `,
      );
    }

    // none node natives
    const realFile = await this.getRealFile();
    assert(realFile, `filePath not found of ${this.file}`);
    const content = readFileSync(realFile, 'utf-8');
    return await getExposeFromContent({
      content,
      filePath: realFile,
      dep: this,
    });
  }

  async getRealFile() {
    try {
      // don't need to handle alias here
      // it's already handled by babel plugin
      return await resolve(this.cwd, this.file);
    } catch (e) {
      return null;
    }
  }

  static buildDeps(opts: {
    deps: Record<string, { file: string; version: string }>;
    cwd: string;
    mfsu: MFSU;
  }) {
    return Object.keys(opts.deps).map((file) => {
      return new Dep({
        ...opts.deps[file],
        cwd: opts.cwd,
        mfsu: opts.mfsu,
      });
    });
  }

  static getDepVersion(opts: { dep: string; cwd: string }): string {
    // @ts-ignore
    if (!!process.binding('natives')[opts.dep]) {
      return '*';
    }
    const dep = isAbsolute(opts.dep)
      ? opts.dep
      : join(opts.cwd, 'node_modules', opts.dep);
    const pkg = pkgUp.pkgUpSync({
      cwd: dep,
    });
    assert(pkg, `package.json not found for ${opts.dep}`);
    return require(pkg).version;
  }
}
