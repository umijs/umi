import { join } from 'path';
import { existsSync } from 'fs';
import { spawn, SpawnOptions } from 'child_process';

export const error = (msg: string, name = 'TaskError') => {
  const err = new Error(msg);
  err.name = name;
  throw err;
};

export const runCommand = (script: string, options: SpawnOptions = {}) => {
  options.env = {
    ...process.env,
    ...options.env,
    FORCE_COLOR: '1',
  };

  options.cwd = options.cwd || process.cwd();
  options.stdio = options.stdio || 'pipe';

  let sh = 'sh';
  let shFlag = '-c';

  if (process.platform === 'win32') {
    sh = process.env.comspec || 'cmd';
    shFlag = '/d /s /c';
    options.windowsVerbatimArguments = true;
    if (
      script.indexOf('./') === 0 ||
      script.indexOf('.\\') === 0 ||
      script.indexOf('../') === 0 ||
      script.indexOf('..\\') === 0
    ) {
      const splits = script.split(' ');
      splits[0] = join(options.cwd, splits[0]);
      script = splits.join(' ');
    }
  }

  const proc = spawn(sh, [shFlag, script], options);
  return proc;
};

export const isScriptKeyExist = (pkgPath: string, key: string): boolean => {
  if (!existsSync(pkgPath)) {
    return false;
  }
  let pkg = {} as any;
  try {
    pkg = require(pkgPath);
  } catch (_) {
    console.log(_.stack);
    return false;
  }
  return !!(pkg.scripts && pkg.scripts[key]);
};

export function formatLog(log: string): string {
  return log;
}

export function formatEnv(env: object): object {
  const res = {} as any;
  Object.keys(env).forEach(key => {
    if (typeof env[key] === 'boolean') {
      res[key] = env[key] ? '1' : 'none';
    } else {
      res[key] = env[key];
    }
  });
  return res;
}
