import { pkgUp, winPath, logger, chalk } from '@umijs/utils';
import assert from 'assert';
import { readFileSync } from 'fs';
import { isAbsolute, join, dirname } from 'path';
import { MF_VA_PREFIX } from '../constants';
import { MFSU } from '../mfsu/mfsu';
import { trimFileContent } from '../utils/trimFileContent';
import { getExposeFromContent } from './getExposeFromContent';
import { resolveFromContexts } from '../utils/resolveUtils';

export class Dep {
  public file: string;
  public version: string;
  public cwd: string;
  public shortFile: string;
  public normalizedFile: string;
  public filePath: string;
  public excludeNodeNatives: boolean;
  public importer: string | undefined;

  constructor(opts: {
    file: string;
    version: string;
    cwd: string;
    excludeNodeNatives: boolean;
    importer?: string;
  }) {
    this.file = winPath(opts.file);
    this.version = opts.version;
    this.cwd = opts.cwd;
    this.shortFile = this.file;
    this.normalizedFile = this.shortFile.replace(/\//g, '_').replace(/:/g, '_');
    this.filePath = `${MF_VA_PREFIX}${this.normalizedFile}.js`;
    this.excludeNodeNatives = opts.excludeNodeNatives!;
    this.importer = opts.importer;
  }

  async buildExposeContent() {
    // node natives
    // @ts-ignore
    const isNodeNatives = !!process.binding('natives')[this.file];
    if (isNodeNatives) {
      return trimFileContent(
        this.excludeNodeNatives
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

    if (!realFile) {
      logger.error(
        `Can not resolve dependence : '${chalk.red(
          this.file,
        )}', please install it`,
      );
    }
    assert(realFile, `dependence not found: ${this.file}`);
    const content = readFileSync(realFile, 'utf-8');
    return await getExposeFromContent({
      content,
      filePath: realFile,
      dep: this,
    });
  }

  async getRealFile() {
    try {
      const contexts = [this.cwd];
      if (this.importer) {
        contexts.push(dirname(this.importer));
      }

      // don't need to handle alias here
      // it's already handled by babel plugin
      return await resolveFromContexts(contexts, this.file);
    } catch (e) {
      return null;
    }
  }

  static buildDeps(opts: {
    deps: Record<string, { file: string; version: string; importer?: string }>;
    cwd: string;
    mfsu: MFSU;
  }) {
    return Object.keys(opts.deps).map((file) => {
      return new Dep({
        ...opts.deps[file],
        cwd: opts.cwd,
        excludeNodeNatives: opts.mfsu.opts.excludeNodeNatives!,
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
    return require(pkg).version || null;
  }
}
