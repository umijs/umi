import { logger } from '@umijs/utils';
import { readFileSync } from 'fs';
import { relative } from 'path';

type AbsPath = string;
type FileContent = string;
type FileContentCache = Record<AbsPath, FileContent>;

export type FileChangeEvent = {
  event: 'unlink' | 'change' | 'add';
  path: string;
};

export class LazyFolderCache {
  fileContentCache: FileContentCache = {};
  private readonly cwd: string;

  pendingChanges: FileChangeEvent[] = [];
  private readonly onCacheUpdated: (
    cache: FileContentCache,
    events: FileChangeEvent[],
  ) => Promise<void>;
  private readonly filesLoader: (
    files: string[],
  ) => Promise<Record<string, string>>;

  constructor(opts: {
    cwd: string;
    exts: string[];
    onCacheUpdate: (
      cache: FileContentCache,
      events: FileChangeEvent[],
    ) => Promise<void>;
    debouncedTimeout?: number;
    /* ([anymatch](https://github.com/micromatch/anymatch)-compatible definition array*/
    ignored: string[];
    filesLoader?: (files: string[]) => Promise<Record<string, string>>;
  }) {
    this.cwd = opts.cwd;
    this.onCacheUpdated = opts.onCacheUpdate;
    this.filesLoader = opts.filesLoader || this._defaultLoader;
  }

  async handleFileChangeEvents(events: FileChangeEvent[]) {
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
    await this.onCacheUpdated(this.fileContentCache, events);
  }

  async init() {
    return;
  }

  getFileCache() {
    return this.fileContentCache;
  }

  public async loadFiles(files: string[]) {
    const loaded = await this.filesLoader(files);

    for (const f of Object.keys(loaded)) {
      console.log('file', f);
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
