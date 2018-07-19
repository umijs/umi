import { join } from 'path';
import localePlugin, { getLocaleFileList } from '../src/index';

const absSrcPath = join(__dirname, '../examples/base/src');

const api = {
  placeholder: {
    IMPORT: 'test-placeholder',
  },
  utils: {
    winPath: p => {
      return p;
    },
  },
  service: {
    config: {
      singular: true,
    },
    paths: {
      absSrcPath,
    },
  },
  register() {},
};

describe('test plugin', () => {
  test('enable is true', () => {
    api.register = (name, handler) => {
      if (name === 'modifyPageWatchers') {
        const ret = handler({
          memo: ['/some/test'],
        });
        expect(ret).toEqual(['/some/test', `${absSrcPath}/locale`]);
      }
      if (name === 'modifyRouterContent') {
        const ret = handler({
          memo: '<Router />',
        });
        expect(ret).toEqual(expect.stringContaining('<Router />'));
        expect(ret).toEqual(expect.stringContaining('<Router />'));
        expect(ret).toEqual(expect.stringContaining('<LocaleProvider'));
        expect(ret).toEqual(expect.stringContaining('<IntlProvider'));
      }
      if (name === 'modifyRouterFile') {
        const ret = handler({
          memo: 'test-placeholder',
        });
        expect(ret).toEqual(expect.stringContaining('test-placeholder'));
        expect(ret).toEqual(expect.stringContaining('LocaleProvider'));
        expect(ret).toEqual(expect.stringContaining('IntlProvider'));
      }
      if (name === 'modifyAFWebpackOpts') {
        const ret = handler({
          memo: {
            xxx: {},
            alias: {
              test: 'hi/hello',
            },
          },
        });
        expect(ret).toEqual({
          xxx: {},
          alias: {
            test: 'hi/hello',
            'umi/locale': join(__dirname, '../src/locale.js'),
            'react-intl': expect.stringContaining('react-intl'),
          },
        });
      }
    };
    localePlugin(api);
  });
});

test('antd is false', () => {
  api.register = (name, handler) => {
    if (name === 'modifyPageWatchers') {
      const ret = handler({
        memo: ['/some/test'],
      });
      expect(ret).toEqual(['/some/test', `${absSrcPath}/locale`]);
    }
    if (name === 'modifyRouterContent') {
      const ret = handler({
        memo: '<Router />',
      });
      expect(ret).toEqual(expect.stringContaining('<Router />'));
      expect(ret).toEqual(expect.stringContaining('<Router />'));
      expect(ret).not.toEqual(expect.stringContaining('<LocaleProvider'));
      expect(ret).toEqual(expect.stringContaining('<IntlProvider'));
    }
    if (name === 'modifyRouterFile') {
      const ret = handler({
        memo: 'test-placeholder',
      });
      expect(ret).toEqual(expect.stringContaining('test-placeholder'));
      expect(ret).not.toEqual(expect.stringContaining('LocaleProvider'));
      expect(ret).not.toEqual(expect.stringContaining('antd'));
      expect(ret).toEqual(expect.stringContaining('IntlProvider'));
    }
    if (name === 'modifyAFWebpackOpts') {
      const ret = handler({
        memo: {
          xxx: {},
          alias: {
            test: 'hi/hello',
          },
        },
      });
      expect(ret).toEqual({
        xxx: {},
        alias: {
          test: 'hi/hello',
          'umi/locale': join(__dirname, '../src/locale.js'),
          'react-intl': expect.stringContaining('react-intl'),
        },
      });
    }
  };
  localePlugin(api, {
    antd: false,
  });
});

describe('test func with singular true', () => {
  test('getLocaleFileList', () => {
    const list = getLocaleFileList(absSrcPath, true);
    expect(list).toEqual([
      {
        lang: 'en',
        country: 'US',
        name: 'en-US',
        path: `${absSrcPath}/locale/en-US.js`,
      },
      {
        lang: 'zh',
        country: 'CN',
        name: 'zh-CN',
        path: `${absSrcPath}/locale/zh-CN.js`,
      },
    ]);
  });
});

describe('test func with singular false', () => {
  test('getLocaleFileList', () => {
    const list = getLocaleFileList(absSrcPath, false);
    expect(list).toEqual([]);
  });
});
