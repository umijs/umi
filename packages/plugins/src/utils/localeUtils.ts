import { existsSync } from 'fs';
import { basename, join } from 'path';
import { glob, lodash, winPath } from 'umi/plugin-utils';

export type IAddAntdLocales = (args: {
  lang: string;
  country: string;
}) => Promise<string[]>;

export interface IGetLocaleFileListOpts {
  localeFolder: string;
  separator?: string;
  absSrcPath?: string;
  absPagesPath?: string;
  addAntdLocales: IAddAntdLocales;
  resolveKey: string;
}

/**
 * 获取 moment 包的 locale 名称
 * @param lang 语言
 * @param country 国家
 * @param resolveKey 用来resolve的key，moment 或者 dayjs，为了使 dayjs 可以替换 moment
 */
export const getMomentLocale = (
  lang: string,
  country: string,
  resolveKey: string,
  script = '',
): { momentLocale: string } => {
  const momentLocation = require
    .resolve(`${resolveKey}/locale/zh-cn`)
    .replace(/zh\-cn\.js$/, '');

  const names = [
    [lang, script, country].filter(Boolean).join('-'),
    [lang, script].filter(Boolean).join('-'),
    [lang, country].filter(Boolean).join('-'),
    lang,
  ].map((name) => name.toLowerCase());
  return {
    momentLocale:
      lodash
        .uniq(names)
        .find((name) => existsSync(join(momentLocation, `${name}.js`))) || '',
  };
};

export const getAntdLocale = (lang: string, country: string): string =>
  `${lang}_${(country || lang).toLocaleUpperCase()}`;

export interface IGetLocaleFileListResult {
  lang: string;
  country: string;
  name: string;
  locale: string;
  script: string;
  paths: string[];
  antdLocale: string[];
  momentLocale: string;
}

/**
 * 有些情况下可能项目包含的locale和antd的不匹配
 * 这个方法用于检测
 * @param localePath
 * @returns
 */
const modulesHasLocale = (localePath: string) => {
  try {
    require.resolve(localePath);
    return true;
  } catch (error) {
    return false;
  }
};

export const getLocaleList = async (
  opts: IGetLocaleFileListOpts,
): Promise<IGetLocaleFileListResult[]> => {
  const {
    localeFolder,
    separator = '-',
    absSrcPath = '',
    absPagesPath = '',
    addAntdLocales,
    resolveKey = 'moment',
  } = opts;
  const sep = `(?:${lodash.escapeRegExp(separator)})?`;
  const localeFilePattern = new RegExp(
    `^([a-z]{2,3})(?:${sep}([A-Z][a-z]{3}))?(?:${sep}([A-Z]{2}|\\d{3}))?\\.(?:js|json|ts)$`,
  );

  const localeFiles = glob
    .sync('*.{ts,js,json}', {
      cwd: winPath(join(absSrcPath, localeFolder)),
    })
    .map((name) => winPath(join(absSrcPath, localeFolder, name)))
    .concat(
      glob
        .sync(`**/${localeFolder}/*.{ts,js,json}`, {
          cwd: absPagesPath,
        })
        .map((name) => winPath(join(absPagesPath, name))),
    )
    .flatMap((path) => {
      const match = localeFilePattern.exec(basename(path));
      if (!match || !existsSync(path)) return [];
      const [, lang, script = '', country = ''] = match;
      const name = [lang, script, country].filter(Boolean).join(separator);
      return [{ lang, script, country, name, path }];
    });

  const groups = lodash.groupBy(localeFiles, 'name');

  const promises = Object.keys(groups).map(async (name) => {
    const { lang, script, country } = groups[name][0];
    const { momentLocale } = getMomentLocale(lang, country, resolveKey, script);
    const antdLocale = lodash
      .uniq(await addAntdLocales({ lang, country }))
      .filter((localePath) => modulesHasLocale(localePath));

    return {
      lang,
      name,
      // react-intl Function.supportedLocalesOf
      // Uncaught RangeError: Incorrect locale information provided
      locale: [lang, script, country].filter(Boolean).join('-'),
      script,
      country,
      antdLocale,
      paths: groups[name].map((item) => winPath(item.path)),
      momentLocale,
    };
  });
  return Promise.all(promises);
};

export const exactLocalePaths = (
  data: IGetLocaleFileListResult[],
): string[] => {
  return lodash.flatten(data.map((item) => item.paths));
};

export function isNeedPolyfill(targets = {}) {
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
  return (
    Object.keys(targets).find((key) => {
      const lowKey = key.toLocaleLowerCase();
      // @ts-ignore
      return polyfillTargets[lowKey] && polyfillTargets[lowKey] >= targets[key];
    }) !== undefined
  );
}
