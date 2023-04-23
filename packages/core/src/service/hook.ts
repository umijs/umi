import assert from 'assert';
import { Plugin } from './plugin';

export interface IOpts {
  plugin: Plugin;
  key: string;
  fn: Function;
  before?: string;
  stage?: number;
}

export class Hook {
  plugin: Plugin;
  key: string;
  fn: Function;
  before?: string;
  stage?: number;
  constructor(opts: IOpts) {
    assert(
      opts.key && opts.fn,
      `Invalid hook ${opts}, key and fn must supplied.`,
    );
    this.plugin = opts.plugin;
    this.key = opts.key;
    this.fn = opts.fn;
    this.before = opts.before;
    this.stage = opts.stage || 0;
  }
}
