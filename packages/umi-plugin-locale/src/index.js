//
// TODOLIST:
//   - 单元测试
//   - example 里面的 antd 依赖改为 umi 插件
//

import { join, dirname, basename } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { winPath } from 'umi-utils';
import Mustache from 'mustache';
import globby from 'globby';
import groupBy from 'lodash.groupby';

const momentLocation = require.resolve('moment/locale/zh-cn').replace(/zh\-cn\.js$/, '');

function getMomentLocale(lang, country) {
  if (existsSync(join(momentLocation, `${lang}-${country.toLocaleLowerCase()}.js`))) {
    return `${lang}-${country.toLocaleLowerCase()}`;
  }
  if (existsSync(join(momentLocation, `${lang}.js`))) {
    return lang;
  }
  return '';
}

// export for test
export function getLocaleFileList(absSrcPath, absPagesPath, singular, separator = '-') {
  const localeFileMath = new RegExp(`^([a-z]{2})${separator}?([A-Z]{2})?\.(js|json|ts)$`);
  const localeFolder = singular ? 'locale' : 'locales';
  const localeFiles = globby
    .sync('*.{ts,js,json}', {
      cwd: join(absSrcPath, localeFolder),
    })
    .map(name => join(absSrcPath, localeFolder, name))
    .concat(
      globby
        .sync(`**/${localeFolder}/*.{ts,js,json}`, {
          cwd: absPagesPath,
        })
        .map(name => join(absPagesPath, name)),
    )
    .filter(p => localeFileMath.test(basename(p)))
    .map(fullname => {
      const fileName = basename(fullname);
      const fileInfo = localeFileMath
        .exec(fileName)
        .slice(1, 3)
        .filter(Boolean);
      return {
        name: fileInfo.join(separator),
        path: fullname,
      };
    });
  const groups = groupBy(localeFiles, 'name');
  return Object.keys(groups).map(name => {
    const fileInfo = name.split(separator);
    return {
      lang: fileInfo[0],
      name,
      country: fileInfo[1] || fileInfo[0].toUpperCase(),
      paths: groups[name].map(item => winPath(item.path)),
      momentLocale: getMomentLocale(fileInfo[0], fileInfo[1] || ''),
    };
  });
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
      const lowKey = key.toLocaleLowerCase();
      return polyfillTargets[lowKey] && polyfillTargets[lowKey] >= targets[key];
    }) !== undefined
  );
}

export default function(api, options = {}) {
  const { config, paths } = api;
  const { targets, ssr } = config;

  if (isNeedPolyfill(targets)) {
    api.addEntryPolyfillImports({
      source: 'intl',
    });
  }
  api.addRuntimePluginKey('locale');

  api.addPageWatcher(join(paths.absSrcPath, config.singular ? 'locale' : 'locales'));

  api.onOptionChange(newOpts => {
    options = newOpts;
    api.rebuildTmpFiles();
  });

  api.addRendererWrapperWithComponent(() => {
    const baseSeparator = options.baseSeparator || '-';
    const localeFileList = getLocaleFileList(
      paths.absSrcPath,
      paths.absPagesPath,
      config.singular,
      baseSeparator,
    );
    const wrapperTpl = readFileSync(join(__dirname, '../template/wrapper.jsx.tpl'), 'utf-8');
    const defaultLocale = options.default || `zh${baseSeparator}CN`;
    const [lang, country] = defaultLocale.split(baseSeparator);
    const wrapperContent = Mustache.render(wrapperTpl, {
      baseSeparator,
      localeList: localeFileList,
      antd: options.antd !== false,
      baseNavigator: options.baseNavigator !== false,
      useLocalStorage: options.useLocalStorage !== false,
      defaultLocale,
      defaultLang: lang,
      defaultAntdLocale: `${lang}_${country}`,
      defaultMomentLocale: getMomentLocale(lang, country),
      requireModule: ssr ? 'lib' : 'es',
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
        // umi/locale is deprecated
        // recommend use `import { getLocale } from 'umi-plugin-locale';` now.
        'umi/locale': join(__dirname, './locale.js'),
        'react-intl': dirname(require.resolve('react-intl/package.json')),
      },
    };
  });
}
