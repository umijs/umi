import { winPath } from 'umi-utils';
import getMockData, { normalizeConfig, getMockFiles, getMockConfigFromFiles } from './getMockData';

const fixtures = winPath(`${__dirname}/fixtures`);

function stripPrefix(files) {
  return files.map(file => file.replace(`${fixtures}/`, ''));
}

describe('umi-mock:getMockData', () => {
  describe('getMockData', () => {
    it('normal', () => {
      const config = getMockData({
        cwd: `${fixtures}/normal`,
      });
      expect(config.length).toEqual(2);
    });
  });

  describe('getMockFiles', () => {
    it('normal', () => {
      const files = getMockFiles({
        cwd: `${fixtures}/normal`,
      });

      expect(stripPrefix(files)).toEqual([
        'normal/mock/_c.js',
        'normal/mock/a.js',
        'normal/mock/b.js',
      ]);
    });

    it('exclude', () => {
      const files = getMockFiles({
        cwd: `${fixtures}/normal`,
        config: {
          mock: {
            exclude: ['**/_*.js'],
          },
        },
      });
      expect(stripPrefix(files)).toEqual(['normal/mock/a.js', 'normal/mock/b.js']);
    });

    it('mock in pages', () => {
      const files = getMockFiles({
        cwd: `${fixtures}/normal`,
        absPagesPath: `${fixtures}/normal/pages`,
      });
      expect(stripPrefix(files)).toEqual([
        'normal/mock/_c.js',
        'normal/mock/a.js',
        'normal/mock/b.js',
        'normal/pages/a/_mock.js',
        'normal/pages/b/_mock.js',
      ]);
    });

    it('.umirc.mock.js', () => {
      const files = getMockFiles({
        cwd: `${fixtures}/umirc-mock-file`,
      });
      expect(stripPrefix(files)).toEqual(['umirc-mock-file/.umirc.mock.js']);
    });

    it('ts', () => {
      const files = getMockFiles({
        cwd: `${fixtures}/ts`,
      });
      expect(stripPrefix(files)).toEqual(['ts/mock/a.ts']);
    });
  });

  describe('getMockConfigFromFiles', () => {
    it('normal', () => {
      const config = getMockConfigFromFiles([
        `${fixtures}/mock-files/a.js`,
        `${fixtures}/mock-files/b.js`,
      ]);
      expect(config).toEqual({
        '/api/a': { a: 1 },
        '/api/b': { b: 1 },
      });
    });
  });

  describe('normalizeConfig', () => {
    it('normal', () => {
      const config = normalizeConfig(
        getMockConfigFromFiles([`${fixtures}/mock-files/a.js`, `${fixtures}/mock-files/b.js`]),
      );
      expect(config.length).toEqual(2);
      expect(Object.keys(config[0])).toEqual(['method', 'path', 're', 'keys', 'handler']);
      expect(config[0].method).toEqual('get');
      expect(config[0].path).toEqual('/api/a');
      expect(config[0].keys).toEqual([]);
      expect(typeof config[0].handler).toEqual('function');
    });

    it('with method', () => {
      const config = normalizeConfig(
        getMockConfigFromFiles([`${fixtures}/mock-files/with-method.js`]),
      );
      expect(config.length).toEqual(4);
      expect(config[0].method).toEqual('get');
      expect(config[0].path).toEqual('/api/get');
      expect(config[1].method).toEqual('get');
      expect(config[1].path).toEqual('/api/get2');
      expect(config[2].method).toEqual('post');
      expect(config[2].path).toEqual('/api/samepath');
      expect(config[3].method).toEqual('get');
      expect(config[3].path).toEqual('/api/samepath');
    });

    it('conflicts', () => {
      const config = normalizeConfig(
        getMockConfigFromFiles([`${fixtures}/mock-files/a.js`, `${fixtures}/mock-files/a_2.js`]),
      );
      expect(config.length).toEqual(1);
    });

    it("throw error if value's type is string", () => {
      expect(() => {
        normalizeConfig(getMockConfigFromFiles([`${fixtures}/mock-files/string.js`]));
      }).toThrow(/mock value of \/api\/string should be function or object, but got string/);
    });

    it('with keys', () => {
      const config = normalizeConfig(
        getMockConfigFromFiles([`${fixtures}/mock-files/with-keys.js`]),
      );
      expect(config[0].keys.map(key => key.name)).toEqual(['users', 'posts']);
    });
  });

  test('getMockData parse failed', () => {
    let parseFailed = false;
    getMockData({
      cwd: `${fixtures}/parse-failed`,
      onError(e) {
        parseFailed = true;
      },
    });
    expect(parseFailed).toEqual(true);
  });
});
