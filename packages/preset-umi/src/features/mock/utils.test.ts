import { winPath } from '@umijs/utils';
import { join } from 'path';
import { getMockData } from './utils';

const fixtures = winPath(`${__dirname}/fixtures`);

describe('umi-mock:getMockData', () => {
  function stripPrefix(files: string[]) {
    return files.map((file) => file.replace(`${fixtures}/`, ''));
  }

  describe('getMockData', () => {
    it('normal', async () => {
      const { mockData } = getMockData({
        cwd: `${fixtures}/normal`,
      });
      expect(mockData.length).toEqual(2);
    });
  });

  describe('getMockFiles', () => {
    it('normal', async () => {
      const cwd = winPath(join(fixtures, 'normal'));

      const { mockPaths } = getMockData({
        cwd,
      });

      expect(stripPrefix(mockPaths)).toEqual([
        'normal/mock/a.ts',
        'normal/mock/b.ts',
        'normal/pages/a/_mock.ts',
        'normal/pages/b/_mock.ts',
      ]);
    });

    it('exclude', async () => {
      const cwd = winPath(join(fixtures, 'normal'));
      const { mockPaths } = getMockData({
        cwd,
        ignore: ['**/_*.ts'],
      });
      expect(stripPrefix(mockPaths)).toEqual([
        'normal/mock/a.ts',
        'normal/mock/b.ts',
      ]);
    });

    it('.umirc.mock.ts', async () => {
      const cwd = winPath(join(fixtures, 'umirc-mock-file'));

      const { mockPaths } = getMockData({
        cwd,
      });
      expect(stripPrefix(mockPaths)).toEqual([
        'umirc-mock-file/mock/a.ts',
        'umirc-mock-file/.umirc.mock.ts',
      ]);
    });

    it('js', async () => {
      const cwd = winPath(join(fixtures, 'js'));
      const { mockPaths } = getMockData({
        cwd,
      });
      expect(stripPrefix(mockPaths)).toEqual(['js/mock/a.js']);
    });

    it('normal data', async () => {
      const cwd = winPath(join(fixtures, 'mock-files'));
      const { mockData } = getMockData({
        cwd,
        ignore: [
          '**/string.ts',
          '**/a_2.ts',
          '**/with-keys.ts',
          '**/with-method.ts',
          '**/with-query.ts',
        ],
      });

      // '/api/a': { a: 1 },
      // '/api/b': { b: 1 },
      expect(mockData.length).toEqual(2);
      expect(mockData[0].method).toEqual('get');
      expect(mockData[0].path).toEqual('/api/a');
      expect(Object.keys(mockData[0])).toEqual([
        'method',
        'path',
        're',
        'keys',
        'handler',
      ]);

      expect(mockData[1].method).toEqual('get');
      expect(mockData[1].path).toEqual('/api/b');
    });

    it('with method', async () => {
      const cwd = winPath(join(fixtures, 'mock-files'));

      const { mockData } = getMockData({
        cwd,
        ignore: [
          '**/string.ts',
          '**/a_2.ts',
          '**/a.ts',
          '**/b.ts',
          '**/with-keys.ts',
        ],
      });

      expect(mockData.length).toEqual(5);
      expect(mockData[0].method).toEqual('get');
      expect(mockData[0].path).toEqual('/api/get');
      expect(mockData[1].method).toEqual('get');
      expect(mockData[1].path).toEqual('/api/get2');
      expect(mockData[2].method).toEqual('post');
      expect(mockData[2].path).toEqual('/api/samepath');
      expect(mockData[3].method).toEqual('get');
      expect(mockData[3].path).toEqual('/api/samepath');
      expect(mockData[4].method).toEqual('get');
      expect(mockData[4].path).toEqual('/api/list?campusClassId=1002');
    });

    it('conflicts', async () => {
      const cwd = winPath(join(fixtures, 'mock-files'));

      expect(() => {
        getMockData({
          cwd,
          ignore: ['**/a_2.ts', '**/a.ts'],
        });
      }).toThrow(
        /mock value of \/api\/string should be function or object, but got string/,
      );
    });

    it('with keys', async () => {
      const cwd = winPath(join(fixtures, 'mock-files'));

      const { mockData } = getMockData({
        cwd,
        ignore: ['**/string.ts', '**/a_2.ts', '**/a.ts', '**/b.ts'],
      });

      expect(mockData[0].keys.map((key) => key.name)).toEqual([
        'users',
        'posts',
      ]);
    });
  });
});
