import { join } from 'path';
import { winPath } from '@umijs/utils';
import { Service } from '@umijs/core';
import { getMockData } from './utils';

describe('umi-mock:getMockData', () => {
  const fixtures = winPath(`${__dirname}/fixtures`);
  function stripPrefix(files: string[]) {
    return files.map(file => file.replace(`${fixtures}/`, ''));
  }

  describe('getMockData', () => {
    it('normal', async () => {
      const cwd = winPath(join(fixtures, 'normal'));

      const service = new Service({
        cwd,
        plugins: [],
      });
      await service.init();

      const { mockData } = getMockData({
        cwd: `${fixtures}/normal`,
        paths: service.paths,
      });
      expect(mockData.length).toEqual(2);
    });
  });

  describe('getMockFiles', () => {
    it('normal', async () => {
      const cwd = winPath(join(fixtures, 'normal'));
      const service = new Service({
        cwd,
        plugins: [],
      });
      await service.init();

      const { mockPaths } = getMockData({
        cwd,
        paths: service.paths,
      });

      expect(stripPrefix(mockPaths)).toEqual([
        'normal/mock/_c.js',
        'normal/mock/a.js',
        'normal/mock/b.js',
        // 'normal/pages/a/_mock.js',
        // 'normal/pages/b/_mock.js',
      ]);
    });

    it('exclude', async () => {
      const cwd = winPath(join(fixtures, 'normal'));

      const service = new Service({
        cwd,
        plugins: [],
      });
      await service.init();

      const { mockPaths } = getMockData({
        cwd,
        ignore: ['**/_*.js'],
        paths: service.paths,
      });
      expect(stripPrefix(mockPaths)).toEqual([
        'normal/mock/a.js',
        'normal/mock/b.js',
      ]);
    });

    it('.umirc.mock.js', async () => {
      const cwd = winPath(join(fixtures, 'umirc-mock-file'));

      const service = new Service({
        cwd,
        plugins: [],
      });
      await service.init();

      const { mockPaths } = getMockData({
        cwd: `${fixtures}/umirc-mock-file`,
        paths: service.paths,
      });
      expect(stripPrefix(mockPaths)).toEqual([
        'umirc-mock-file/mock/a.js',
        'umirc-mock-file/.umirc.mock.js',
      ]);
    });

    it('ts', async () => {
      const cwd = winPath(join(fixtures, 'ts'));

      const service = new Service({
        cwd,
        plugins: [],
      });
      await service.init();
      const { mockPaths } = getMockData({
        cwd,
        paths: service.paths,
      });
      expect(stripPrefix(mockPaths)).toEqual(['ts/mock/a.ts']);
    });

    it('normal data', async () => {
      const cwd = winPath(join(fixtures, 'mock-files'));

      const service = new Service({
        cwd,
        plugins: [],
      });
      await service.init();
      const { mockData } = getMockData({
        cwd,
        ignore: [
          '**/string.js',
          '**/a_2.js',
          '**/with-keys.js',
          '**/with-method.js',
          '**/with-query.js',
        ],
        paths: service.paths,
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

      const service = new Service({
        cwd,
        plugins: [],
      });
      await service.init();
      const { mockData } = getMockData({
        cwd,
        ignore: [
          '**/string.js',
          '**/a_2.js',
          '**/a.js',
          '**/b.js',
          '**/with-keys.js',
        ],
        paths: service.paths,
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

      const service = new Service({
        cwd,
        plugins: [],
      });
      await service.init();
      expect(() => {
        getMockData({
          cwd,
          ignore: ['**/a_2.js', '**/a.js'],
          paths: service.paths,
        });
      }).toThrow(
        /mock value of \/api\/string should be function or object, but got string/,
      );
    });

    it('with keys', async () => {
      const cwd = winPath(join(fixtures, 'mock-files'));

      const service = new Service({
        cwd,
        plugins: [],
      });
      await service.init();
      const { mockData } = getMockData({
        cwd,
        ignore: ['**/string.js', '**/a_2.js', '**/a.js', '**/b.js'],
        paths: service.paths,
      });

      expect(mockData[0].keys.map(key => key.name)).toEqual(['users', 'posts']);
    });
  });
});
