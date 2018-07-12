import { resolve, join, dirname } from 'path';
import isAbsolute from 'path-is-absolute';
import isWindows from 'is-windows';
import slash from 'slash2';

const debug = require('debug')('umi:devDevOpts');

export default function(opts = {}) {
  debug(`opts: ${JSON.stringify(opts)}`);
  delete opts.extraResolveModules;

  let cwd = process.env.APP_ROOT;
  if (cwd) {
    if (!isAbsolute(cwd)) {
      cwd = join(process.cwd(), cwd);
    }
    cwd = slash(cwd);
    // 原因：webpack 的 include 规则得是 \ 才能判断出是绝对路径
    if (isWindows()) {
      cwd = cwd.replace(/\//g, '\\');
    }
  }

  return {
    cwd,
  };
}
