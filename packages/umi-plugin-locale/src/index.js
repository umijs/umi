//
// TODOLIST:
//   - 单元测试
//   - example 里面的 antd 依赖改为 umi 插件
//

import { join, dirname, basename, extname } from 'path';
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

// function getLocaleFiles(localePath){
//   const localeList = [];
//   if (existsSync(localePath)) {
//     const localePaths = readdirSync(localePath);
//     for (let i = 0; i < localePaths.length; i++) {
//       const fullname = join(localePath, localePaths[i]);
//       const stats = statSync(fullname);
//       const fileInfo = /^([a-z]{2})-([A-Z]{2})\.(js|ts)$/.exec(localePaths[i]);
//       if (stats.isFile() && fileInfo) {
//         localeList.push({
//           lang: fileInfo[1],
//           country: fileInfo[2],
//           name: `${fileInfo[1]}-${fileInfo[2]}`,
//           path: winPath(fullname),
//           momentLocale: getMomentLocale(fileInfo[1], fileInfo[2]),
//         });
//       }
//     }
//   }
//   return localeList;
// }

/**
 * 递归获取文件
 * @param {string} localPath 路径
 * @param {string} key 键名称
 * @param {boolean} isTop 是否顶层
 * @description 最终生产的键为 文件夹.文件名.key  如果是语言文件夹根目录下，那么文件名为global的文件不会附件前缀
 */
function recursiveGetFiles(localleBasePath, language, searchPath, key) {
  let dirList = readdirSync(searchPath);
  let fileList = [];
  dirList.forEach(function(item) {
    var readResult = statSync(join(searchPath, item));
    const preFix = !!key ? `${key}.` : '';
    if (readResult.isFile() && /\.(js|ts)$/.exec(item)) {
      const fileNameWithOutExt = basename(item, extname(item));
      const fileNameKey =
        join(localleBasePath, language) === searchPath &&
        fileNameWithOutExt.toLocaleLowerCase() === 'global'
          ? ''
          : `${preFix}${fileNameWithOutExt}`;
      const relateFilePath = winPath(join(searchPath, item)).replace(
        winPath(localleBasePath),
        '',
      );
      fileList.push({
        path: relateFilePath,
        key: fileNameKey,
      });
    } else if (readResult.isDirectory()) {
      const subFiles = recursiveGetFiles(
        localleBasePath,
        language,
        join(searchPath, item),
        `${preFix}${item}`,
      );
      fileList = fileList.concat(subFiles);
    }
  });

  return fileList;
}

function getLocaleFolderFiles(localleBasePath) {
  const localeList = [];
  if (existsSync(localleBasePath)) {
    const localePaths = readdirSync(localleBasePath);
    for (let i = 0; i < localePaths.length; i++) {
      const fullname = join(localleBasePath, localePaths[i]);
      const stats = statSync(fullname);
      const fileInfo = /^([a-z]{2})-([A-Z]{2})$/.exec(localePaths[i]);
      if (stats.isDirectory() && fileInfo) {
        const name = `${fileInfo[1]}-${fileInfo[2]}`;
        let language = {
          lang: fileInfo[1],
          country: fileInfo[2],
          name: name,
          path: JSON.stringify(
            recursiveGetFiles(localleBasePath, name, fullname, '', true),
          ), // winPath(fullname),
          momentLocale: getMomentLocale(fileInfo[1], fileInfo[2]),
        };
        localeList.push(language);
      }
    }
  }
  return localeList;
}

// get locale obj
export function getLocalObj(absSrcPath, singular) {
  const localePath = join(absSrcPath, singular ? 'locale' : 'locales');
  return {
    localePath: winPath(localePath),
    localeFileList: getLocaleFolderFiles(localePath),
  };
}

export default function(api, options = {}) {
  const { config, paths } = api;

  api.addPageWatcher(
    join(paths.absSrcPath, config.singular ? 'locale' : 'locales'),
  );

  api.onOptionChange(newOpts => {
    options = newOpts;
    api.rebuildTmpFiles();
  });

  api.addRendererWrapperWithComponent(() => {
    const localeObj = getLocalObj(paths.absSrcPath, config.singular);
    const wrapperTpl = readFileSync(
      join(__dirname, '../template/wrapper.jsx.tpl'),
      'utf-8',
    );
    const defaultLocale = options.default || 'zh-CN';
    const [lang, country] = defaultLocale.split('-');
    const wrapperContent = Mustache.render(wrapperTpl, {
      localeList: localeObj.localeFileList,
      localePath: localeObj.localePath,
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
