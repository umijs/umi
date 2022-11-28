import { chokidar, lodash, logger } from '@umijs/utils';
import { readFileSync } from 'fs';
import { join, relative } from 'path';
import type { FileChangeEvent, FileContentCache } from './types';

const { watch } = chokidar;
type FSWatcher = ReturnType<typeof watch>;

export class AutoUpdateFolderCache {
  fileContentCache: FileContentCache = {};
  private watcher: FSWatcher;
  private readonly readyPromise: Promise<void>;
  private readonly cwd: string;

  pendingChanges: FileChangeEvent[] = [];
  private readonly debouchedHandleChanges: () => void;
  private readonly onCacheUpdated: (
    cache: FileContentCache,
    events: FileChangeEvent[],
  ) => void;
  private readonly filesLoader: (
    files: string[],
  ) => Promise<Record<string, string>>;

  constructor(opts: {
    cwd: string;
    exts: string[];
    onCacheUpdate: (cache: FileContentCache, events: FileChangeEvent[]) => void;
    debouncedTimeout?: number;
    /* ([anymatch](https://github.com/micromatch/anymatch)-compatible definition array*/
    ignored: string[];
    filesLoader?: (files: string[]) => Promise<Record<string, string>>;
  }) {
    this.cwd = opts.cwd;
    this.onCacheUpdated = opts.onCacheUpdate;
    this.filesLoader = opts.filesLoader || this._defaultLoader;

    this.watcher = watch(`./**/*.{${opts.exts.join(',')}}`, {
      ignored: opts.ignored || [],
      cwd: opts.cwd,
      ignorePermissionErrors: true,
      ignoreInitial: true,
    });

    this.watchAll();

    this.readyPromise = new Promise<void>((resolve) => {
      this.watcher.on('ready', () => {
        resolve();
      });
    });

    this.debouchedHandleChanges = lodash.debounce(async () => {
      const modifiedFiles = [];

      const events = this.pendingChanges.slice();
      while (this.pendingChanges.length > 0) {
        const c = this.pendingChanges.pop()!;

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
      await this.onCacheUpdated(this.fileContentCache, events);
    }, opts.debouncedTimeout);
  }

  unwatch() {
    return this.watcher.close();
  }

  async init() {
    await this.readyPromise;
  }

  private watchAll() {
    this.watcher.on('all', (eventName, path) => {
      switch (eventName) {
        case 'change':
          this.pendingChanges.push({
            event: 'change',
            path: join(this.cwd, path),
          });
          this.debouchedHandleChanges();
          break;
        case 'add':
          this.pendingChanges.push({
            event: 'add',
            path: join(this.cwd, path),
          });
          this.debouchedHandleChanges();
          break;
        case 'unlink':
          this.pendingChanges.push({
            event: 'unlink',
            path: join(this.cwd, path),
          });
          this.debouchedHandleChanges();
          break;
        default:
        // ignore all others;
      }
    });
  }

  getFileCache() {
    return this.fileContentCache;
  }

  public async loadFiles(files: string[]) {
    const loaded = await this.filesLoader(files);

    for (const f of Object.keys(loaded)) {
      this.fileContentCache[f] = loaded[f];
    }
  }

  private async _defaultLoader(files: string[]) {
    const loaded: Record<string, string> = {};
    for (let file of files) {
      try {
        loaded[file] = readFileSync(file, 'utf-8');
      } catch (e) {
        logger.error(
          '[fileCache] load file',
          relative(this.cwd, file),
          'failed ',
          e,
        );
      }
    }
    return loaded;
  }
}
