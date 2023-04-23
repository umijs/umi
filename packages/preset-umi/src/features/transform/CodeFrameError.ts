import type { SourceLocation } from '@umijs/bundler-utils/compiled/babel/code-frame';

export default class CodeFrameError extends Error {
  location: SourceLocation;

  constructor(msg: string, location: SourceLocation) {
    super(msg);
    this.location = location;
  }
}
