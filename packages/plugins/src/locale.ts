import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi } from 'umi';
import { lodash, Mustache, winPath } from 'umi/plugin-utils';
import {
  exactLocalePaths,
  getAntdLocale,
  getLocaleList,
  getMomentLocale,
  IAddAntdLocales,
  IGetLocaleFileListResult,
  isNeedPolyfill,
} from './utils/localeUtils';
import { withTmpPath } from './utils/withTmpPath';

interface ILocaleConfig {
  default?: string;
  baseNavigator?: boolean;
  useLocalStorage?: boolean;
  /** title 开启国际化 */
  title?: boolean;
  antd?: boolean;
  baseSeparator?: string;
}

export const packageNormalize = (packageName: string) =>
  packageName.replace(/[@\/\-.]/g, '_');

// TODO: runtime plugin
export default (api: IApi) => {
  // TODO: antd 的校验考虑 antd 插件
  let hasAntd = false;
  try {
    hasAntd = !!require.resolve('antd');
  } catch (e) {
    api.logger.warn('antd is not installed. <SelecLang /> unavailable');
  }

  const defaultConfig = {
    baseNavigator: true,
    useLocalStorage: true,
    baseSeparator: '-',
    antd: hasAntd,
  };

  api.describe({
    key: 'locale',
    config: {
      schema(joi) {
        return joi.object({
          default: joi.string(),
          useLocalStorage: joi.boolean(),
          baseNavigator: joi.boolean(),
          title: joi.boolean(),
          antd: joi.boolean(),
          baseSeparator: joi.string(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  const reactIntlPkgPath = winPath(
    dirname(require.resolve('react-intl/package')),
  );

  // polyfill
  api.addEntryImportsAhead(() =>
    isNeedPolyfill(api.config.targets || {})
      ? [
          {
            source: require.resolve('intl'),
          },
        ]
      : [],
  );

  const addAntdLocales: IAddAntdLocales = async (args) =>
    await api.applyPlugins({
      key: 'addAntdLocales',
      type: api.ApplyPluginsType.add,
      initialValue: [
        `antd/${api.config?.ssr ? 'lib' : 'es'}/locale/${getAntdLocale(
          args.lang,
          args.country,
        )}`,
      ],
      args,
    });

  const getList = async (
    resolveKey: string,
  ): Promise<IGetLocaleFileListResult[]> => {
    const { paths } = api;
    return getLocaleList({
      localeFolder: 'locales',
      separator: api.config.locale?.baseSeparator,
      absSrcPath: paths.absSrcPath,
      absPagesPath: paths.absPagesPath,
      addAntdLocales,
      resolveKey,
    });
  };

  api.onGenerateFiles(async () => {
    const localeTpl = readFileSync(
      join(__dirname, '../libs/locale/locale.tpl'),
      'utf-8',
    );
    // moment2dayjs
    const resolveKey = api.config.moment2dayjs ? 'dayjs' : 'moment';
    const momentPkgPath = winPath(
      dirname(require.resolve(`${resolveKey}/package.json`)),
    );
    const EventEmitterPkg = winPath(
      dirname(require.resolve('event-emitter/package')),
    );

    const { baseSeparator, baseNavigator, antd, title, useLocalStorage } = {
      ...defaultConfig,
      ...(api.config.locale as ILocaleConfig),
    };
    const defaultLocale = api.config.locale?.default || `zh${baseSeparator}CN`;
    const localeList = await getList(resolveKey);
    const momentLocales = localeList
      .map(({ momentLocale }) => momentLocale)
      .filter((locale) => locale);
    const antdLocales = localeList
      .map(({ antdLocale }) => antdLocale)
      .filter((locale) => locale);

    let MomentLocales = momentLocales;
    let DefaultMomentLocale = '';
    // set moment default accounding to locale.default
    if (!MomentLocales.length && api.config.locale?.default) {
      const [lang, country = ''] = defaultLocale.split(baseSeparator);
      const { momentLocale } = getMomentLocale(lang, country, resolveKey);
      if (momentLocale) {
        MomentLocales = [momentLocale];
        DefaultMomentLocale = momentLocale;
      }
    }

    let DefaultAntdLocales: string[] = [];
    // set antd default locale
    if (!antdLocales.length && api.config.locale?.antd) {
      const [lang, country = ''] = defaultLocale.split(baseSeparator);
      DefaultAntdLocales = lodash.uniq(
        await addAntdLocales({
          lang,
          country,
        }),
      );
    }
    const NormalizeAntdLocalesName = function () {
      // @ts-ignore
      return packageNormalize(this);
    };

    api.writeTmpFile({
      content: Mustache.render(localeTpl, {
        MomentLocales,
        DefaultMomentLocale,
        NormalizeAntdLocalesName,
        DefaultAntdLocales,
        Antd: !!antd,
        Title: title && api.config.title,
        BaseSeparator: baseSeparator,
        DefaultLocale: defaultLocale,
        DefaultLang: defaultLocale,
        momentPkgPath,
      }),
      path: 'locale.tsx',
    });

    const localeExportsTpl = readFileSync(
      join(__dirname, '../libs/locale/localeExports.tpl'),
      'utf-8',
    );
    const localeDirName = 'locales';
    const localeDirPath = join(api.paths!.absSrcPath!, localeDirName);
    api.writeTmpFile({
      path: 'localeExports.ts',
      content: Mustache.render(localeExportsTpl, {
        EventEmitterPkg,
        BaseSeparator: baseSeparator,
        BaseNavigator: baseNavigator,
        UseLocalStorage: !!useLocalStorage,
        LocaleDir: localeDirName,
        ExistLocaleDir: existsSync(localeDirPath),
        LocaleList: localeList.map((locale) => ({
          ...locale,
          antdLocale: locale.antdLocale.map((antdLocale, index) => ({
            locale: antdLocale,
            index: index,
          })),
          paths: locale.paths.map((path, index) => ({
            path,
            index,
          })),
        })),
        Antd: !!antd,
        DefaultLocale: JSON.stringify(defaultLocale),
        warningPkgPath: winPath(require.resolve('warning/package')),
        reactIntlPkgPath,
      }),
    });
    // runtime.tsx
    const runtimeTpl = readFileSync(
      join(__dirname, '../libs/locale/runtime.tpl'),
      'utf-8',
    );
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: Mustache.render(runtimeTpl, {
        Title: !!title,
      }),
    });

    // SelectLang.tsx
    const selectLang = readFileSync(
      join(__dirname, '../libs/locale/SelectLang.tpl'),
      'utf-8',
    );

    api.writeTmpFile({
      path: 'SelectLang.tsx',
      content: Mustache.render(selectLang, {
        Antd: !!antd,
        LocaleList: localeList,
        ShowSelectLang: localeList.length > 1 && !!antd,
        antdFiles: api.config?.ssr ? 'lib' : 'es',
      }),
    });

    // index.ts
    api.writeTmpFile({
      path: 'index.ts',
      content: `
export { setLocale, getLocale, useIntl, formatMessage, FormattedMessage } from './localeExports.ts';
export { SelectLang } from './SelectLang.tsx';
`,
    });
  });

  // Runtime Plugin
  api.addRuntimePlugin(() => [withTmpPath({ api, path: 'runtime.tsx' })]);
  api.addRuntimePluginKey(() => ['locale']);

  // watch locale files
  api.addTmpGenerateWatcherPaths(async () => {
    const resolveKey = api.config.moment2dayjs ? 'dayjs' : 'moment';
    const localeList = await getList(resolveKey);
    return exactLocalePaths(localeList);
  });
};
