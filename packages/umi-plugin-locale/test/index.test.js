import { join } from 'path';
import { readFileSync, unlinkSync } from 'fs';
import localePlugin, { getLocaleFileList } from '../src/index';

const absSrcPath = join(__dirname, '../examples/base/src');

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

  unlinkSync(wrapperFile);
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
