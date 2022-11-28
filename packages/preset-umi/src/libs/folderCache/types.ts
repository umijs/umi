type FileContent = string;

export type AbsPath = string;
export type FileContentCache = Record<AbsPath, FileContent>;

export type FileChangeEvent = {
  event: 'unlink' | 'change' | 'add';
  path: string;
};

export type Event = FileChangeEvent['event'];
