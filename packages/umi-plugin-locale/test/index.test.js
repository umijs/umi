import { join } from 'path';
import { readFileSync, unlinkSync } from 'fs';
import { winPath } from 'umi-utils';

import localePlugin, { getLocaleFileList, isNeedPolyfill } from '../src/index';

const absSrcPath = winPath(join(__dirname, '../examples/base/src'));
const absPagesPath = winPath(join(__dirname, '../examples/base/src/page'));

const absSeparatorSrcPath = winPath(join(__dirname, '../examples/base-separator/src'));
const absSeparatorPagesPath = winPath(join(__dirname, '../examples/base-separator/src/page'));

const absMultipleExtSrcPath = winPath(join(__dirname, '../examples/multiple-ext/src'));
const absMultipleExtPagesPath = winPath(join(__dirname, '../examples/multiple-ext/src/page'));

let wrapperFile;

const api = {
  addRendererWrapperWithComponent(func) {
    wrapperFile = func();
  },
  addPageWatcher() {},
  onOptionChange() {},
  addRuntimePluginKey() {},
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

    expect(ret).toEqual(expect.stringContaining('<AntdProvider'));
    expect(ret).toEqual(expect.stringContaining('<IntlProvider'));
    expect(ret).toEqual(expect.stringContaining('<IntlProvider'));
    expect(ret).toEqual(expect.stringContaining('antd/es/locale-provider/en_US'))
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

  expect(ret).not.toEqual(expect.stringContaining('<AntdProvider'));
  expect(ret).toEqual(expect.stringContaining('<IntlProvider'));
  expect(ret).not.toEqual(expect.stringContaining('antd/es/locale-provider/zh_CN'));
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
        paths: [`${absSrcPath}/locale/en-US.js`, `${absPagesPath}/temp/locale/en-US.js`],
        momentLocale: '',
      },
      {
        lang: 'sk',
        country: 'SK',
        name: 'sk',
        paths: [`${absSrcPath}/locale/sk.js`, `${absPagesPath}/temp/locale/sk.js`],
        momentLocale: 'sk',
      },
      {
        lang: 'zh',
        country: 'CN',
        name: 'zh-CN',
        paths: [`${absSrcPath}/locale/zh-CN.js`, `${absPagesPath}/temp/locale/zh-CN.js`],
        momentLocale: 'zh-cn',
      },
    ]);
  });
});

describe('test func with baseSeparator', () => {
  test('getLocaleFileList', () => {
    const list = getLocaleFileList(absSeparatorSrcPath, absSeparatorPagesPath, false, '_');
    expect(list).toEqual([
      {
        lang: 'en',
        country: 'US',
        name: 'en_US',
        paths: [
          `${absSeparatorSrcPath}/locales/en_US.js`,
          `${absSeparatorPagesPath}/temp/locales/en_US.js`,
        ],
        momentLocale: '',
      },
      {
        lang: 'sk',
        country: 'SK',
        name: 'sk',
        paths: [
          `${absSeparatorSrcPath}/locales/sk.js`,
          `${absSeparatorPagesPath}/temp/locales/sk.js`,
        ],
        momentLocale: 'sk',
      },
      {
        lang: 'zh',
        country: 'CN',
        name: 'zh_CN',
        paths: [
          `${absSeparatorSrcPath}/locales/zh_CN.js`,
          `${absSeparatorPagesPath}/temp/locales/zh_CN.js`,
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

describe('test func with multiple locale ext', () => {
  test('getLocaleFileList', () => {
    const list = getLocaleFileList(absMultipleExtSrcPath, absMultipleExtPagesPath, true);
    expect(list).toEqual([
      {
        lang: 'en',
        country: 'US',
        name: 'en-US',
        paths: [
          `${absMultipleExtSrcPath}/locale/en-US.js`,
          `${absMultipleExtPagesPath}/temp/locale/en-US.js`,
        ],
        momentLocale: '',
      },
      {
        lang: 'sk',
        country: 'SK',
        name: 'sk',
        paths: [
          `${absMultipleExtSrcPath}/locale/sk.json`,
          `${absMultipleExtPagesPath}/temp/locale/sk.json`,
        ],
        momentLocale: 'sk',
      },
      {
        lang: 'zh',
        country: 'CN',
        name: 'zh-CN',
        paths: [
          `${absMultipleExtSrcPath}/locale/zh-CN.ts`,
          `${absMultipleExtPagesPath}/temp/locale/zh-CN.ts`,
        ],
        momentLocale: 'zh-cn',
      },
    ]);
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
