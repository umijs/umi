//
// TODOLIST:
//   - 单元测试
//   - example 里面的 antd 依赖改为 umi 插件
//

import { join, dirname,basename,extname } from 'path';
import {
  existsSync,
  statSync,
  readdirSync,
  readFileSync,
  writeFileSync
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

function getLocaleFiles(localePath){
  const localeList = [];
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

//递归获取文件
function recursiveGetFiles(localPath,key=''){
  let dirList = readdirSync(localPath);
	let fileList=[];
	dirList.forEach(function(item){
        var readResult=statSync(join(localPath,item));
        const preFix=(!!key)?`${key}.`:"";
		if(readResult.isFile()&&/\.(js|ts)$/.exec(item)){
            const fileNameWithOutExt=basename(item,extname(item));
            fileList.push({
                path:winPath(join(localPath,item)),
                key:`${preFix}${fileNameWithOutExt}`
            });
        }
        else if(readResult.isDirectory()){
            const subFiles=recursiveGetFiles(join(localPath,item),`${preFix}${item}`);
            fileList=fileList.concat(subFiles);
        }
	});
	
	return fileList;
}

function getLocaleFolderFiles(localePath){
  const localeList = [];
  if (existsSync(localePath)) {
    const localePaths = readdirSync(localePath);
    for (let i = 0; i < localePaths.length; i++) {
      const fullname = join(localePath, localePaths[i]);
      const stats = statSync(fullname);
      const fileInfo = /^([a-z]{2})-([A-Z]{2})$/.exec(localePaths[i]);
      if (stats.isDirectory() && fileInfo) {
        let language={
          lang: fileInfo[1],
          country: fileInfo[2],
          name: `${fileInfo[1]}-${fileInfo[2]}`,
          path:JSON.stringify(recursiveGetFiles(fullname)),// winPath(fullname),
          momentLocale: getMomentLocale(fileInfo[1], fileInfo[2]),
        };
        localeList.push(language);
      }
    }
  }
  return localeList;
}

// export for test
export function getLocaleFileList(absSrcPath, singular,localeFolders) {
  const localePath = join(absSrcPath, singular ? 'locale' : 'locales');
  if(localeFolders){
    return getLocaleFolderFiles(localePath);
    
  }
  else{
    return getLocaleFiles(localePath);
  }
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
    const localeFileList = getLocaleFileList(paths.absSrcPath, config.singular,options.localeFolders);
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
      localeFolders:options.localeFolders
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
