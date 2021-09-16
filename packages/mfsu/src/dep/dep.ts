import assert from 'assert';
import { readFileSync } from 'fs';
import { isAbsolute, join } from 'path';
import * as process from 'process';
import { MF_VA_PREFIX } from '../constants';
import { MFSU } from '../index';
import { trimFileContent } from '../utils/trimFileContent';
import { getExposeFromContent } from './getExposeFromContent';
import { getFilePath } from './getFilePath';

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
    this.file = opts.file;
    this.version = opts.version;
    this.cwd = opts.cwd;
    this.shortFile = this.file.replace(this.cwd, '$CWD$');
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
    const realFile = this.getRealFile();
    assert(realFile, `filePath not found of ${this.file}`);
    const content = readFileSync(realFile, 'utf-8');
    return getExposeFromContent({
      content,
      filePath: realFile,
      dep: this,
    });
  }

  getRealFile() {
    const absFiles = isAbsolute(this.file)
      ? [this.file]
      : // TODO: support config dep module resolver
        [this.cwd, this.cwd !== process.cwd() && process.cwd()]
          .filter(Boolean)
          .map((base: any) => join(base, this.file));
    for (const path of absFiles) {
      const realFile = getFilePath({ path });
      if (realFile) return realFile;
    }
    return null;
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
}
