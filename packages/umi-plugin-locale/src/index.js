//
// TODOLIST:
//   - 单元测试
//   - example 里面的 antd 依赖改为 umi 插件
//

import { join, dirname } from 'path';
import {
  existsSync,
  statSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { winPath } from 'umi-utils';
import Mustache from 'mustache';

const momentLocation = require
  .resolve('moment/locale/zh-cn')
  .replace(/zh\-cn\.js$/, '');

function getMomentLocale(lang, country) {
  if (
    existsSync(
      join(momentLocation, `${lang}-${country.toLocaleLowerCase()}.js`),
    )
  ) {
    return `${lang}-${country.toLocaleLowerCase()}`;
  }
  if (existsSync(join(momentLocation, `${lang}.js`))) {
    return lang;
  }
  return '';
}

// export for test
export function getLocaleFileList(absSrcPath, singular) {
  const localeList = [];
  const localePath = join(absSrcPath, singular ? 'locale' : 'locales');
  if (existsSync(localePath)) {
    const localePaths = readdirSync(localePath);
    for (let i = 0; i < localePaths.length; i++) {
      const fullname = join(localePath, localePaths[i]);
      const stats = statSync(fullname);
      const fileInfo = /^([a-z]{2})-([A-Z]{2})\.(js|ts)$/.exec(localePaths[i]);
      if (stats.isFile() && fileInfo) {
        localeList.push({
          lang: fileInfo[1],
          country: fileInfo[2],
          name: `${fileInfo[1]}-${fileInfo[2]}`,
          path: winPath(fullname),
          momentLocale: getMomentLocale(fileInfo[1], fileInfo[2]),
        });
      }
    }
  }
  return localeList;
}

// data come from https://caniuse.com/#search=intl
// you can find all browsers in https://github.com/browserslist/browserslist#browsers
const polyfillTargets = {
  ie: 10,
  firefox: 28,
  chrome: 23,
  safari: 9.1,
  opera: 12.1,
  ios: 9.3,
  ios_saf: 9.3,
  operamini: Infinity,
  op_mini: Infinity,
  android: 4.3,
  blackberry: Infinity,
  operamobile: 12.1,
  op_mob: 12.1,
  explorermobil: 10,
  ie_mob: 10,
  ucandroid: Infinity,
};

export function isNeedPolyfill(targets = {}) {
  return (
    Object.keys(targets).find(key => {
      return (
        polyfillTargets[key.toLocaleLowerCase()] &&
        polyfillTargets[key.toLocaleLowerCase()] >= targets[key]
      );
    }) !== undefined
  );
}

export default function(api, options = {}) {
  const { config, paths } = api;
  const { targets } = config;

  if (isNeedPolyfill(targets)) {
    api.addEntryPolyfillImports({
      source: 'intl',
    });
  }

  api.addPageWatcher(
    join(paths.absSrcPath, config.singular ? 'locale' : 'locales'),
  );

  api.onOptionChange(newOpts => {
    options = newOpts;
    api.rebuildTmpFiles();
  });

  api.addRendererWrapperWithComponent(() => {
    const localeFileList = getLocaleFileList(paths.absSrcPath, config.singular);
    const wrapperTpl = readFileSync(
      join(__dirname, '../template/wrapper.jsx.tpl'),
      'utf-8',
    );
    const defaultLocale = options.default || 'zh-CN';
    const [lang, country] = defaultLocale.split('-');
    const wrapperContent = Mustache.render(wrapperTpl, {
      localeList: localeFileList,
      antd: options.antd === undefined ? true : options.antd,
      baseNavigator:
        options.baseNavigator === undefined ? true : options.baseNavigator,
      useLocalStorage: true,
      defaultLocale,
      defaultLang: lang,
      defaultAntdLocale: `${lang}_${country}`,
      defaultMomentLocale: getMomentLocale(lang, country),
    });
    const wrapperPath = join(paths.absTmpDirPath, './LocaleWrapper.jsx');
    writeFileSync(wrapperPath, wrapperContent, 'utf-8');
    return wrapperPath;
  });

  api.modifyAFWebpackOpts(memo => {
    return {
      ...memo,
      alias: {
        ...(memo.alias || {}),
        'umi/locale': join(__dirname, './locale.js'),
        'react-intl': dirname(require.resolve('react-intl/package.json')),
      },
    };
  });
}
