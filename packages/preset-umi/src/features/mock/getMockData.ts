import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { chalk, glob, lodash, logger, register } from '@umijs/utils';
import assert from 'assert';
import { join } from 'path';
import { DEFAULT_METHOD, MOCK_FILE_GLOB, VALID_METHODS } from './constants';

export interface IMock {
  method: string;
  path: string;
  handler: Function;
  file?: string;
}

export function getMockData(opts: {
  cwd: string;
  mockConfig: { exclude?: string[]; include?: string[] };
}): Record<string, IMock> {
  register.register({
    implementor: esbuild,
  });
  register.clearFiles();

  function normalizeMockFile(file: string) {
    const cwd = opts.cwd.endsWith('/') ? opts.cwd : `${opts.cwd}/`;
    return chalk.yellow(file.replace(cwd, ''));
  }

  const ret = [MOCK_FILE_GLOB, ...(opts.mockConfig.include || [])]
    .reduce<string[]>((memo, pattern) => {
      memo.push(
        ...glob.sync(pattern, {
          cwd: opts.cwd,
          ignore: ['**/*.d.ts', ...(opts.mockConfig.exclude || [])],
        }),
      );
      return memo;
    }, [])
    .reduce<Record<string, any>>((memo, file) => {
      const mockFile = join(opts.cwd, file);
      let m;
      try {
        delete require.cache[mockFile];
        m = require(mockFile);
      } catch (e) {
        throw new Error(
          `Mock file ${mockFile} parse failed.\n${(e as Error).message}`,
          { cause: e },
        );
      }
      // Cannot convert undefined or null to object
      // Support esm and cjs
      const obj = m?.default || m || {};
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
          logger.warn(
            `${id} is duplicated in ${normalizeMockFile(
              mockFile,
            )} and ${normalizeMockFile(memo[id].file)}`,
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
  const spliced = key.split(/\s+/);
  const len = spliced.length;
  if (len === 1) {
    return { method: DEFAULT_METHOD, path: key };
  } else {
    const [method, path] = spliced;
    const upperCaseMethod = method.toUpperCase();
    assert(
      VALID_METHODS.includes(upperCaseMethod),
      `method ${method} is not supported`,
    );
    assert(path, `${key}, path is undefined`);

    return { method: upperCaseMethod, path };
  }
}
