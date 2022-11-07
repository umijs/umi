import { chokidar } from '@umijs/utils';
import { join } from 'path';
import type { FileChangeEvent, Event } from './types';

const { watch } = chokidar;
type FSWatcher = ReturnType<typeof watch>;

export class FolderWatch {
  private readonly cwd: string;

  private watcher: FSWatcher;
  private readyPromise: Promise<void>;
  private listeners: ((e: FileChangeEvent) => void)[] = [];
  private eventMap: Record<Event, any> = { add: 0, unlink: 0, change: 0 };

  constructor(opts: {
    cwd: string;
    exts: string[];
    /* ([anymatch](https://github.com/micromatch/anymatch)-compatible definition array*/
    ignored: string[];
    events: Event[];
  }) {
    this.cwd = opts.cwd;

    this.watcher = watch(`./**/*.{${opts.exts.join(',')}}`, {
      ignored: opts.ignored || [],
      cwd: opts.cwd,
      ignorePermissionErrors: true,
      ignoreInitial: true,
    });

    this.startWatch();

    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.watcher.on('ready', () => {
        resolve();
      });

      this.watcher.on('error', (e) => {
        reject(e);
      });
    });

    for (let event of opts.events) {
      this.eventMap[event] = 1;
    }
  }

  async init() {
    return this.readyPromise;
  }

  private startWatch() {
    this.watcher.on('all', (eventName, path) => {
      switch (eventName) {
        case 'change':
          this.notify({
            event: 'change',
            path: join(this.cwd, path),
          });
          break;
        case 'add':
          this.notify({
            event: 'add',
            path: join(this.cwd, path),
          });
          break;
        case 'unlink':
          this.notify({
            event: 'unlink',
            path: join(this.cwd, path),
          });
          break;
        default:
        // ignore all others;
      }
    });
  }

  private notify(event: FileChangeEvent) {
    if (this.eventMap[event.event]) {
      this.listeners.forEach((l) => l(event));
    }
  }

  public listen(f: (e: FileChangeEvent) => void) {
    this.listeners.push(f);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== f);
    };
  }
}
