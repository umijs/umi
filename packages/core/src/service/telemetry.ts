type MetreEvent = {
  name: string;
  timestamp?: number;
  payload: any;
};

interface IStorage {
  save(e: MetreEvent): Promise<void>;
}

export interface IMetry {
  record(e: MetreEvent): void;
  recordAsync(e: MetreEvent): Promise<boolean>;
  flush(): Promise<void>;
}
export class Telemetry implements IMetry {
  private queuedEvents: {
    event: MetreEvent;
    tried: number;
    status: 'queued' | 'sending' | 'sent';
    promise?: Promise<void>;
  }[] = [];
  private storage: IStorage = new NoopStorage();
  constructor() {}

  prefixWith(prefix: string): IMetry {
    const upStream = this;
    return {
      record(e: MetreEvent) {
        const { name, ...rest } = e;
        upStream.record({
          name: `${prefix}:${name}`,
          ...rest,
        });
      },
      async flush(): Promise<void> {
        return upStream.flush();
      },
      recordAsync(e: MetreEvent): Promise<boolean> {
        const { name, ...rest } = e;
        return upStream.recordAsync({
          name: `${prefix}:${name}`,
          ...rest,
        });
      },
    };
  }

  useStorage(s: IStorage) {
    this.storage = s;
  }
  record(e: MetreEvent) {
    this.storage.save(this.addTimeStamp(e)).catch(() => {
      this.queuedEvents.push({ event: e, tried: 1, status: 'queued' });
      this.scheduleFlush();
    });
  }

  async recordAsync(e: MetreEvent): Promise<boolean> {
    try {
      await this.storage.save(this.addTimeStamp(e));
      return true;
    } catch (e) {
      return false;
    }
  }

  public async flush() {
    const events = this.unFinishedEvents().map((e) => {
      if (e.status === 'queued') {
        e.status = 'sending';
        e.tried++;
        e.promise = this.storage.save(e.event).then(
          () => {
            e.status = 'sent';
          },
          () => {
            e.status = 'queued';
          },
        );
      }
      return e;
    });
    this.queuedEvents = events;

    await Promise.all(events.map(({ promise }) => promise));
  }

  private scheduleFlush() {
    setTimeout(() => {
      this.flush().then(this.afterFlush, this.afterFlush);
    }, 5000);
  }

  private afterFlush = () => {
    const un = this.unFinishedEvents();

    if (un.length) {
      this.scheduleFlush();
    } else {
      this.queuedEvents = [];
    }
  };

  private unFinishedEvents() {
    return this.queuedEvents.filter((e) => {
      if (e.status === 'sent') {
        return false;
      }
      return e.tried < 3;
    });
  }

  private addTimeStamp(e: MetreEvent) {
    if (!e.timestamp) {
      e.timestamp = Date.now();
    }
    return e;
  }
}

class NoopStorage implements IStorage {
  async save(_e: MetreEvent): Promise<void> {
    return;
  }
}

export const noopStorage = new NoopStorage();
