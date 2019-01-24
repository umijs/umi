import { join } from 'path';
import { readFileSync, unlinkSync } from 'fs';
import localePlugin, { getLocaleFileList, isNeedPolyfill } from '../src/index';

const absSrcPath = join(__dirname, '../examples/base/src');
const absPagesPath = join(__dirname, '../examples/base/src/page');

let wrapperFile;

const api = {
  addRendererWrapperWithComponent(func) {
    wrapperFile = func();
  },
  addPageWatcher() {},
  onOptionChange() {},
  rebuildTmpFiles() {},
  modifyAFWebpackOpts() {},
  paths: {
    absSrcPath,
    absPagesPath,
    absTmpDirPath: absSrcPath,
  },
  config: {
    singular: true,
  },
};

describe('test plugin', () => {
  test('enable is true', () => {
    localePlugin(api, {
      enable: true,
      baseNavigator: false,
      default: 'en-US',
    });

    const ret = readFileSync(wrapperFile, 'utf-8');

    expect(ret).toEqual(expect.stringContaining('<LocaleProvider'));
    expect(ret).toEqual(expect.stringContaining('<IntlProvider'));
    expect(ret).toEqual(expect.stringContaining('<IntlProvider'));
    expect(ret).toEqual(
      expect.stringContaining('antd/lib/locale-provider/en_US'),
    );
    expect(ret).toEqual(expect.stringContaining('moment/locale/zh-cn'));
    unlinkSync(wrapperFile);
  });
});

test('antd is false', () => {
  localePlugin(api, {
    enable: true,
    antd: false,
    baseNavigator: false,
  });

  const ret = readFileSync(wrapperFile, 'utf-8');

  expect(ret).not.toEqual(expect.stringContaining('<LocaleProvider'));
  expect(ret).toEqual(expect.stringContaining('<IntlProvider'));
  expect(ret).not.toEqual(
    expect.stringContaining('antd/lib/locale-provider/zh_CN'),
  );
  expect(ret).not.toEqual(expect.stringContaining('moment/locale/zh-cn'));
  unlinkSync(wrapperFile);
});

describe('test func with singular true', () => {
  test('getLocaleFileList', () => {
    const list = getLocaleFileList(absSrcPath, absPagesPath, true);
    expect(list).toEqual([
      {
        lang: 'en',
        country: 'US',
        name: 'en-US',
        paths: [
          `${absSrcPath}/locale/en-US.js`,
          `${absPagesPath}/temp/locale/en-US.js`,
        ],
        momentLocale: '',
      },
      {
        lang: 'zh',
        country: 'CN',
        name: 'zh-CN',
        paths: [
          `${absSrcPath}/locale/zh-CN.js`,
          `${absPagesPath}/temp/locale/zh-CN.js`,
        ],
        momentLocale: 'zh-cn',
      },
    ]);
  });
});

describe('test func with singular false', () => {
  test('getLocaleFileList', () => {
    const list = getLocaleFileList(absSrcPath, absPagesPath, false);
    expect(list).toEqual([]);
  });
});

describe('test utils', () => {
  test('isNeedPolyfill', () => {
    expect(isNeedPolyfill()).toEqual(false);
    expect(
      isNeedPolyfill({
        chrome: 24,
        ios: 9.4,
      }),
    ).toEqual(false);
    expect(
      isNeedPolyfill({
        chrome: 24,
        ios_saf: '9.3',
      }),
    ).toEqual(true);
    expect(
      isNeedPolyfill({
        chrome: 50,
        ucandroid: '9.3',
      }),
    ).toEqual(true);
    expect(
      isNeedPolyfill({
        ie: 11,
        android: 4.3,
      }),
    ).toEqual(true);
    expect(
      isNeedPolyfill({
        ie: 11,
        android: '4.4',
      }),
    ).toEqual(false);
    expect(
      isNeedPolyfill({
        ie: 11,
        Android: '4.1',
      }),
    ).toEqual(true);
    expect(
      isNeedPolyfill({
        OperaMobile: 12,
      }),
    ).toEqual(true);
  });
});
