import { join } from 'path';
import { parseScripts } from '../index';
import assert from 'assert';

describe('packages/umi-ui-tasks/src/server/util/index.ts', () => {
  describe('parseScripts', () => {
    it('pkg not exit', () => {
      const res = parseScripts({
        pkgPath: 'not-exist',
        key: 'build',
      });
      assert(!res.succes);
      assert(!res.exist);
    });

    it('pkg empty', () => {
      const res = parseScripts({
        pkgPath: join('./fixtures/empty.package.json'),
        key: 'build',
      });
      assert(!res.succes);
      assert(!res.exist);
    });

    it('script error', () => {
      const res = parseScripts({
        pkgPath: join(__dirname, './fixtures/error_script.package.json'),
        key: 'build',
      });
      assert(!res.succes);
      assert(res.exist);
      assert.deepEqual(res, {
        exist: true,
        succes: false,
        errMsg: 'Script contains && or || is not allowed',
        envs: [],
        bin: '',
        args: [],
      });
    });

    it('not umi', () => {
      const res = parseScripts({
        pkgPath: join(__dirname, './fixtures/not_umi.package.json'),
        key: 'build',
      });
      assert(!res.succes);
      assert(res.exist);
      assert.deepEqual(res, {
        exist: true,
        succes: false,
        errMsg: 'Not umi',
        envs: [],
        bin: '',
        args: [],
      });
    });

    it('success', () => {
      const res = parseScripts({
        pkgPath: join(__dirname, './fixtures/success.package.json'),
        key: 'build',
      });
      assert.deepEqual(res, {
        exist: true,
        succes: true,
        errMsg: '',
        envs: {
          love: 'love',
        },
        bin: 'umi',
        args: ['build'],
      });
    });
  });
});
