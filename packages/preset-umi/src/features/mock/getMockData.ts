import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { glob, lodash, register } from '@umijs/utils';
import assert from 'assert';
import { MOCK_FILE_GLOB, VALID_METHODS } from './constants';

export interface IMock {
  method: string;
  path: string;
  handler: Function;
  file?: string;
}

export function getMockData(opts: { cwd: string }): Record<string, IMock> {
  register.register({
    implementor: esbuild,
  });
  register.clearFiles();
  const ret = glob
    .sync(MOCK_FILE_GLOB, { cwd: opts.cwd })
    .reduce<Record<string, any>>((memo, file) => {
      const mockFile = `${opts.cwd}/${file}`;
      const m = require(mockFile);
      const obj = m.default;
      for (const key of Object.keys(obj)) {
        const mock = getMock({ key, obj });
        mock.file = mockFile;
        // check conflict
        const id = `${mock.method} ${mock.path}`;
        assert(
          lodash.isArray(mock.handler) ||
            lodash.isPlainObject(mock.handler) ||
            typeof mock.handler === 'function',
          `Mock handler must be function or array or object, but got ${typeof mock.handler} for ${
            mock.method
          } in ${mock.file}`,
        );
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
  const spliced = key.split(' ');
  const len = spliced.length;
  if (len === 1) {
    return { method: 'GET', path: key };
  } else {
    const [method, path] = spliced;
    const upperCaseMethod = method.toUpperCase();
    assert(
      VALID_METHODS.includes(upperCaseMethod),
      `method ${method} is not supported`,
    );
    return { method: upperCaseMethod, path };
  }
}
