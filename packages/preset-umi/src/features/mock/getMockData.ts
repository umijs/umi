import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { glob, register } from '@umijs/utils';
import assert from 'assert';
import { VALID_METHODS } from './constants';

interface IMock {
  method: string;
  path: string;
  handler: Function;
  file?: string;
}

export function getMockData(opts: { cwd: string }): Record<string, Function> {
  register.register({
    implementor: esbuild,
  });
  register.clearFiles();
  const ret = glob
    .sync(`mock/**/*.[jt]s`, { cwd: opts.cwd })
    .reduce<Record<string, any>>((memo, file) => {
      const mockFile = `${opts.cwd}/${file}`;
      const m = require(mockFile);
      const obj = { ...m, ...m.default };
      if (obj['default']) delete obj['default'];
      for (const key of Object.keys(obj)) {
        const mock = getMock({ key, obj });
        mock.file = mockFile;
        // check conflict
        const id = `${mock.method} ${mock.path}`;
        if (memo[id]) {
          throw new Error(
            `${id} is duplicated in ${mockFile} and ${memo[id].file}`,
          );
        }
        memo[id] = mock;
      }
      return memo;
    }, {});
  for (const file of register.getFiles()) {
    delete require.cache[file];
  }
  register.restore();
  return ret;
}

function getMock(opts: { key: string; obj: any }): IMock {
  const { method, path } = parseKey(opts.key);
  const handler = opts.obj[opts.key];
  return { method, path, handler };
}

function parseKey(key: string) {
  const splited = key.split(' ');
  const len = splited.length;
  if (len === 1) {
    return { method: 'GET', path: key };
  } else {
    const [method, path] = splited;
    const upperCaseMethod = method.toUpperCase();
    assert(
      VALID_METHODS.includes(upperCaseMethod),
      `method ${method} is not supported`,
    );
    return { method: upperCaseMethod, path };
  }
}
