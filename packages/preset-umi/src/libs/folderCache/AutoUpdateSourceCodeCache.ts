import {
  ImportSpecifier,
  init as esModuleLexerInit,
  parse,
} from '@umijs/bundler-utils/compiled/es-module-lexer';
import { build as esBuild } from '@umijs/bundler-utils/compiled/esbuild';
import { logger, winPath } from '@umijs/utils';
// @ts-ignore
import fg from 'fast-glob';
import { readFileSync } from 'fs';
import { extname, join, relative } from 'path';
import { AutoUpdateFolderCache } from './AutoUpdateFolderCache';
import type { FileChangeEvent } from './types';
import { DEFAULT_SRC_IGNORES } from './constant';

export type MergedCodeInfo = {
  code: string;
  imports: readonly ImportSpecifier[];
  events: FileChangeEvent[];
};

export type Listener = (info: MergedCodeInfo) => void;

export class AutoUpdateSrcCodeCache {
  private readonly srcPath: string;
  private readonly cachePath: string;
  folderCache: AutoUpdateFolderCache;
  private listeners: Listener[] = [];

  private ignores: string[] = DEFAULT_SRC_IGNORES;

  constructor(opts: { cwd: string; cachePath: string }) {
    this.srcPath = opts.cwd;
    this.cachePath = opts.cachePath;

    this.folderCache = new AutoUpdateFolderCache({
      cwd: this.srcPath,
      exts: ['ts', 'js', 'jsx', 'tsx'],
      ignored: this.ignores,
      debouncedTimeout: 200,
      filesLoader: async (files: string[]) => {
        const loaded: Record<string, string> = {};
        await this.batchProcess(files);

        for (const f of files) {
          let newFile = join(this.cachePath, relative(this.srcPath, f));

          newFile = newFile.replace(new RegExp(`${extname(newFile)}$`), '.js');

          loaded[f] = readFileSync(newFile, 'utf-8');
        }
        return loaded;
      },
      onCacheUpdate: (_cache, events) => {
        const merged = this.getMergedCode();
        const info = { ...merged, events };

        this.listeners.forEach((l) => l(info));
      },
    });
  }

  async init() {
    const [files] = await Promise.all([this.initFileList(), esModuleLexerInit]);

    await this.folderCache.loadFiles(files);
  }

  private async initFileList(): Promise<string[]> {
    const start = Date.now();
    const files = await fg(
      winPath(join(this.srcPath, '**', '*.{ts,js,jsx,tsx}')),
      {
        dot: true,
        ignore: this.ignores,
      },
    );
    logger.debug('[MFSU][eager] fast-glob costs', Date.now() - start);

    return files;
  }

  async batchProcess(files: string[]) {
    try {
      await esBuild({
        entryPoints: files,
        bundle: false,
        outdir: this.cachePath,
        outbase: this.srcPath,
        loader: {
          // in case some js using some feature, eg: decorator
          '.js': 'tsx',
          '.jsx': 'tsx',
        },
        logLevel: 'error',
      });
    } catch (e) {
      // error ignored due to user have to update code to fix then trigger another batchProcess;
      // @ts-ignore
      if (e.errors?.length || e.warnings?.length) {
        logger.warn(
          'transpile code with esbuild got ',
          // @ts-ignore
          e.errors?.length || 0,
          'errors,',
          // @ts-ignore
          e.warnings?.length || 0,
          'warnings',
        );
        logger.debug('esbuild transpile code with error', e);
      } else {
        logger.warn('transpile code with esbuild error', e);
      }
    }
  }

  getMergedCode() {
    const fileContentCache = this.folderCache.getFileCache();
    const code = Object.values(fileContentCache).join('\n');
    const [imports] = parse(code);
    const merged = {
      code,
      imports,
    };
    return merged;
  }

  register(l: Listener) {
    if (this.listeners.indexOf(l) < 0) {
      this.listeners.push(l);
    }

    return () => {
      const i = this.listeners.indexOf(l);
      this.listeners.splice(i, 1);
    };
  }

  unwatch() {
    return this.folderCache.unwatch();
  }
}
