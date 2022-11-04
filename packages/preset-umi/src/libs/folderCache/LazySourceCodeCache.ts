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
import { FileChangeEvent } from './AutoUpdateFolderCache';
import { FolderWatch } from './FolderWatch';

export type MergedCodeInfo = {
  code: string;
  imports: readonly ImportSpecifier[];
};

type AbsPath = string;
type FileContent = string;
type FileContentCache = Record<AbsPath, FileContent>;

export type Listener = (info: MergedCodeInfo) => void;

export class LazySourceCodeCache {
  private readonly srcPath: string;
  private readonly cachePath: string;
  folderWatch: FolderWatch;
  private listeners: Listener[] = [];

  private ignores: string[] = [
    '**/*.d.ts',
    '**/*.{test,spec}.{js,ts,jsx,tsx}',
    '**/cypress/**',
    '**/.umi-production/**',
    '**/.umi-test/**',
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/coverage/**',
    '**/jest.config.{ts,js}',
    '**/jest-setup.{ts,js}',
  ];

  fileContentCache: FileContentCache = {};
  private pendingNewFiles = new Set<string>();

  constructor(opts: { cwd: string; cachePath: string }) {
    this.srcPath = opts.cwd;
    this.cachePath = opts.cachePath;

    this.folderWatch = new FolderWatch({
      cwd: this.srcPath,
      exts: ['ts', 'js', 'jsx', 'tsx'],
      ignored: this.ignores,
      events: ['add'],
    });
    this.folderWatch.listen((e) => {
      this.pendingNewFiles.add(e.path);
    });
  }

  async init() {
    const [files] = await Promise.all([
      this.initFileList(),
      esModuleLexerInit,
      this.folderWatch.init(),
    ]);

    await this.loadFiles(files);
  }

  public async loadFiles(files: string[]) {
    const loaded = await this.filesLoader(files);

    for (const f of Object.keys(loaded)) {
      console.log('file', f);
      this.fileContentCache[f] = loaded[f];
    }
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

  getMergedCode() {
    const code = Object.values(this.fileContentCache).join('\n');
    const [imports] = parse(code);
    const merged = {
      code,
      imports,
    };
    return merged;
  }

  public consumePendingNewFiles() {
    const files = Array.from(this.pendingNewFiles);
    this.pendingNewFiles.clear();
    return files;
  }

  public async handleFileChangeEvents(events: FileChangeEvent[]) {
    const eventsCopy = events.slice();
    const modifiedFiles: string[] = [];
    while (eventsCopy.length > 0) {
      const c = eventsCopy.pop()!;

      switch (c.event) {
        case 'unlink':
          delete this.fileContentCache[c.path];
          break;
        case 'change':
        case 'add':
          modifiedFiles.push(c.path);
          break;
        default:
          ((_n: never) => {})(c.event);
      }
    }
    await this.loadFiles(modifiedFiles);

    this.notify();
  }

  notify() {
    const merged = this.getMergedCode();
    const info = { ...merged };
    this.listeners.forEach((l) => l(info));
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

  async filesLoader(files: string[]) {
    const loaded: Record<string, string> = {};
    await esbuildTransform(files, {
      srcPath: this.srcPath,
      cachePath: this.cachePath,
    });

    for (const f of files) {
      let newFile = join(this.cachePath, relative(this.srcPath, f));

      newFile = newFile.replace(new RegExp(`${extname(newFile)}$`), '.js');

      loaded[f] = readFileSync(newFile, 'utf-8');
    }
    return loaded;
  }

  unwatch() {}
}

async function esbuildTransform(
  files: string[],
  opts: { cachePath: string; srcPath: string },
) {
  try {
    await esBuild({
      entryPoints: files,
      bundle: false,
      outdir: opts.cachePath,
      outbase: opts.srcPath,
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
