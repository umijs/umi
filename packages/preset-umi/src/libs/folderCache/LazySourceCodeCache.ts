import {
  ImportSpecifier,
  init as esModuleLexerInit,
  parse,
} from '@umijs/bundler-utils/compiled/es-module-lexer';
import { build as esBuild } from '@umijs/bundler-utils/compiled/esbuild';
// @ts-ignore
import { logger, winPath } from '@umijs/utils';
import fg from 'fast-glob';
import { readFileSync } from 'fs';
import { extname, join, relative } from 'path';
import { DEFAULT_SRC_IGNORES, possibleExtUsingEmptyLoader } from './constant';
import { FolderWatch } from './FolderWatch';
import type { FileChangeEvent, FileContentCache } from './types';

export type MergedCodeInfo = {
  code: string;
  imports: readonly ImportSpecifier[];
};

export type Listener = (info: MergedCodeInfo) => void;

export class LazySourceCodeCache {
  private readonly srcPath: string;
  private readonly cachePath: string;
  private folderWatch: FolderWatch;
  private listeners: Listener[] = [];

  private ignores: string[] = DEFAULT_SRC_IGNORES;

  fileContentCache: FileContentCache = {};
  private pendingFilesEvents: FileChangeEvent[] = [];
  private root: string;
  private tsConfigRaw = '{}';

  constructor(opts: { cwd: string; cachePath: string; root: string }) {
    this.root = opts.root;
    this.srcPath = opts.cwd;
    this.cachePath = opts.cachePath;

    this.folderWatch = new FolderWatch({
      cwd: this.srcPath,
      exts: ['ts', 'js', 'jsx', 'tsx'],
      ignored: this.ignores,
      events: ['add', 'unlink'],
    });
    this.folderWatch.listen((e) => {
      this.pendingFilesEvents.push(e);
    });

    try {
      this.tsConfigRaw = readFileSync(
        join(this.root, 'tsconfig.json'),
        'utf-8',
      );
    } catch (e) {
      logger.debug(
        'load project tsconfig.json failed, fallback to empty config',
      );
    }
  }

  async init(files: string[]) {
    await Promise.all([esModuleLexerInit, this.folderWatch.init()]);

    await this.loadFiles(files);
  }

  async initWithScan() {
    const [files] = await Promise.all([
      this.initFileList(),
      esModuleLexerInit,
      this.folderWatch.init(),
    ]);

    await this.loadFiles(files);
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

  getSrcPath() {
    return this.srcPath;
  }

  public async loadFiles(files: string[]) {
    const loaded = await this.filesLoader(files);

    for (const f of Object.keys(loaded)) {
      this.fileContentCache[f] = loaded[f];
    }
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

  public replayChangeEvents(): FileChangeEvent[] {
    const newFiles = new Set<string>();
    const events = this.pendingFilesEvents.slice();

    this.pendingFilesEvents = [];

    for (let e of events) {
      const event = e.event;

      if (event === 'add') {
        newFiles.add(e.path);
      } else if (event === 'unlink') {
        newFiles.delete(e.path);
      }
    }
    /*
     * 只处理新增的文件, 删除的文件不处理,
     * 如果是项目实际使用文件的删除, webpack 会携带该信息, 在新编译前触发扫描, 判断是否重新bm
     * 如果是非项目实际使用文件, 但是扫描的文件, 先不处理, 等待下次启动再处理无关的依赖变化;
     * */
    return Array.from(newFiles).map((p) => ({
      event: 'add',
      path: p,
    }));
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
      tsconfigRaw: this.tsConfigRaw,
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
  opts: { cachePath: string; srcPath: string; tsconfigRaw: string },
) {
  try {
    await esBuild({
      entryPoints: files,
      bundle: false,
      outdir: opts.cachePath,
      outbase: opts.srcPath,
      loader: {
        ...possibleExtUsingEmptyLoader,
        // in case some js using some feature, eg: decorator
        '.js': 'tsx',
        '.jsx': 'tsx',
      },
      logLevel: 'error',
      tsconfigRaw: opts.tsconfigRaw,
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
