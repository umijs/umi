import { existsSync } from 'fs';
import { SpawnOptions, execSync, fork } from 'child_process';
import spawn from 'cross-spawn';
import { NpmClient } from '../core/enums';

export const error = (msg: string, name = 'TaskError') => {
  const err = new Error(msg);
  err.name = name;
  throw err;
};

export const runCommand = (script: string, options: SpawnOptions = {}, ipc = false) => {
  options.env = {
    ...process.env,
    ...options.env,
    FORCE_COLOR: '1',
  };

  options.cwd = options.cwd || process.cwd();

  if (process.platform !== 'win32' || !ipc) {
    options.stdio = ipc ? [null, null, null, 'ipc'] : 'pipe';
    options.env = {
      ...process.env,
      ...options.env,
      FORCE_COLOR: '1',
    };

    options.cwd = options.cwd || process.cwd();

    let sh = 'sh';
    let shFlag = '-c';

    const proc = spawn(sh, [shFlag, script], options);
    return proc;
  }

  options.stdio = 'pipe';
  const binPath = require.resolve(
    script.indexOf('umi') > -1 ? 'umi/bin/umi' : '@alipay/bigfish/bin/bigfish',
    {
      paths: [options.cwd],
    },
  );
  const child = fork(binPath, ['dev'], options);
  return child;
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

export function getNpmClient(): NpmClient {
  try {
    execSync('tnpm --version', { stdio: 'ignore' });
    return NpmClient.tnpm;
  } catch (e) {}
  try {
    execSync('cnpm --version', { stdio: 'ignore' });
    return NpmClient.cnpm;
  } catch (e) {}
  try {
    execSync('npm --version', { stdio: 'ignore' });
    return NpmClient.npm;
  } catch (e) {}
  try {
    execSync('ayarn --version', { stdio: 'ignore' });
    return NpmClient.ayayn;
  } catch (e) {}
  try {
    execSync('tyarn --version', { stdio: 'ignore' });
    return NpmClient.tyarn;
  } catch (e) {}
  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return NpmClient.yarn;
  } catch (e) {}
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return NpmClient.pnpm;
  } catch (e) {}

  return NpmClient.npm;
}

// 默认关闭的环境变量，
const DEFAULT_CLOSE_ENV = [
  'UMI_UI',
  'ANALYZE',
  'ANALYZE_REPORT',
  'SPEED_MEASURE',
  'FORK_TS_CHECKER',
];

export function formatEnv(env: object): object {
  const res = {} as any;
  Object.keys(env).forEach(key => {
    if (env[key] === null) {
      return;
    }
    if (typeof env[key] === 'boolean') {
      if (DEFAULT_CLOSE_ENV.includes(key)) {
        // 默认关闭的环境变量，用户打开时才设置
        if (env[key]) {
          res[key] = '1';
        }
      } else {
        // 默认开启的，不开启时才能 none
        if (!env[key]) {
          res[key] = 'none';
        }
      }
    } else {
      res[key] = env[key];
    }
  });
  return res;
}

interface IParseKeyScriptRes {
  succes: boolean;
  errMsg?: string;
  envs?: object;
  bin?: string;
  args?: string[];
}

// TODO: args 增加参数校验
function parseKeyScript(key: string, script: string): IParseKeyScriptRes {
  const result = {
    succes: false,
    errMsg: '',
    envs: [],
    bin: '',
    args: [],
  };

  if (/\&\&|\|\|/.test(script)) {
    return {
      ...result,
      errMsg: 'Script contains && or || is not allowed',
    };
  }
  if (!/bigfish|umi/.test(script)) {
    return {
      ...result,
      errMsg: 'Not umi',
    };
  }

  try {
    const bin = /bigfish/.test(script) ? 'bigfish' : 'umi';
    const envs = {};
    const args = []; // TODO: args 应该取 bin 之后的
    script.split(' ').forEach(item => {
      if (['bigfish', 'umi'].indexOf(item) > -1) {
        return;
      }
      if (/=/.test(item)) {
        const [envKey, envValue] = item.split('=');
        envs[envKey] = envValue;
      } else if (/(dev|build|test|lint)/.test(item)) {
        args.push(item);
      }
    });
    return {
      ...result,
      succes: true,
      bin,
      envs,
      args,
    };
  } catch (e) {
    return {
      ...result,
      errMsg: `Parse ${key} script error. ${e.message}`,
    };
  }
}

interface IParseScriptsRes extends IParseKeyScriptRes {
  exist: boolean;
}

export function parseScripts(opts: { pkgPath: string; key: string }): IParseScriptsRes {
  const result = {
    succes: false,
    exist: false,
  };
  const { pkgPath, key } = opts;
  if (!existsSync(pkgPath)) {
    return result;
  }
  let pkg;
  try {
    pkg = require(pkgPath);
  } catch (_) {
    pkg = null;
  }

  const script = pkg.scripts && pkg.scripts[key];
  if (!script) {
    return {
      ...result,
      exist: false,
    };
  }

  const scriptConfig = parseKeyScript(key, script);
  return {
    exist: true,
    ...scriptConfig,
  };
}

export * from './stats';
