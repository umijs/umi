import {
  createIntl,
  IntlShape,
  MessageDescriptor,
} from '{{{ reactIntlPkgPath }}}';
import { getPluginManager } from '../core/plugin';
import EventEmitter from '{{{EventEmitterPkg}}}';
// @ts-ignore
import warning from '{{{ warningPkgPath }}}';

export {
  createIntl,
};
export {
  FormattedDate,
  FormattedDateParts,
  FormattedDisplayName,
  FormattedHTMLMessage,
  FormattedList,
  FormattedMessage,
  FormattedNumber,
  FormattedNumberParts,
  FormattedPlural,
  FormattedRelativeTime,
  FormattedTime,
  FormattedTimeParts,
  IntlContext,
  IntlProvider,
  RawIntlProvider,
  createIntlCache,
  defineMessages,
  injectIntl,
  useIntl,
} from '{{{ reactIntlPkgPath }}}';

let g_intl: IntlShape;

const useLocalStorage = {{{UseLocalStorage}}};

// @ts-ignore
export const event = new EventEmitter();

export const LANG_CHANGE_EVENT = Symbol('LANG_CHANGE');

{{#LocaleList}}
{{#antdLocale}}
import {{lang}}{{country}}{{index}} from '{{{locale}}}';
{{/antdLocale}}
{{#paths}}
import lang_{{lang}}{{country}}{{index}} from "{{{path}}}";
{{/paths}}
{{/LocaleList}}

const flattenMessages=(
  nestedMessages: Record<string, any>,
  prefix = '',
) => {
  return Object.keys(nestedMessages).reduce(
    (messages: Record<string, any>, key) => {
      const value = nestedMessages[key];
      const prefixedKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        messages[prefixedKey] = value;
      } else {
        Object.assign(messages, flattenMessages(value, prefixedKey));
      }
      return messages;
    },
    {},
  );
}

export const localeInfo: {[key: string]: any} = {
  {{#LocaleList}}
  '{{name}}': {
    messages: {
      {{#paths}}...flattenMessages(lang_{{lang}}{{country}}{{index}}),{{/paths}}
    },
    locale: '{{locale}}',
    {{#Antd}}antd: {
      {{#antdLocale}}
      ...{{lang}}{{country}}{{index}},
      {{/antdLocale}}
    },{{/Antd}}
    momentLocale: '{{momentLocale}}',
  },
  {{/LocaleList}}
};

/**
 * 增加一个新的国际化语言
 * @param name 语言的 key
 * @param messages 对应的枚举对象
 * @param extraLocales momentLocale, antd 国际化
 */
export const addLocale = (
  name: string,
  messages: Object,
  extraLocales: {
    momentLocale:string;
    antd: import('antd/es/locale').Locale
  },
) => {
  if (!name) {
    return;
  }
  // 可以合并
  const mergeMessages = localeInfo[name]?.messages
    ? Object.assign({}, localeInfo[name].messages, messages)
    : messages;

  // 用户只是追加 messages 时，extraLocales 可选
  const { momentLocale = localeInfo[name]?.momentLocale, antd = localeInfo[name]?.antd } = extraLocales || {};
  const locale = name.split('{{BaseSeparator}}')?.join('-')
  localeInfo[name] = {
    messages: mergeMessages,
    locale,
    momentLocale: momentLocale,
    {{#Antd}}antd,{{/Antd}}
  };
   // 如果这是的 name 和当前的locale 相同需要重新设置一下，不然更新不了
  if (locale === getLocale()) {
    event.emit(LANG_CHANGE_EVENT, locale);
  }
};

const applyRuntimeLocalePlugin = (initialValue: any) => {
  return getPluginManager().applyPlugins({
    key: 'locale',
    type: 'modify',
    initialValue
  });
}

const _createIntl = (locale: string) => {
    const runtimeLocale = applyRuntimeLocalePlugin(localeInfo[locale]);
    const { cache, ...config } = runtimeLocale;
    return createIntl(config, cache);
}

/**
 * 获取当前的 intl 对象，可以在 node 中使用
 * @param locale 需要切换的语言类型
 * @param changeIntl 是否不使用 g_intl
 * @returns IntlShape
 */
export const getIntl = (locale?: string, changeIntl?: boolean) => {
  // 如果全局的 g_intl 存在，且不是 setIntl 调用
  if (g_intl && !changeIntl && !locale) {
    return g_intl;
  }
  // 获取当前 locale
  if (!locale) locale = getLocale();
  // 如果存在于 localeInfo 中
  if (locale&&localeInfo[locale]) {
    return _createIntl(locale);
  }
  {{#ExistLocaleDir}}
  // 不存在需要一个报错提醒
  warning(
    !locale||!!localeInfo[locale],
    `The current popular language does not exist, please check the {{{LocaleDir}}} folder!`,
  );
  {{/ExistLocaleDir}}
  // 使用 zh-CN
  if (localeInfo[{{{ DefaultLocale }}}]) {
    return _createIntl({{{ DefaultLocale }}});
  }

  // 如果还没有，返回一个空的
  return createIntl({
    locale: {{{ DefaultLocale }}},
    messages: {}
  });
};

/**
 * 切换全局的 intl 的设置
 * @param locale 语言的key
 */
export const setIntl = (locale: string) => {
  g_intl = getIntl(locale, true);
};

/**
 * 获取当前选择的语言
 * @returns string
 */
export const getLocale = () => {
  const runtimeLocale = applyRuntimeLocalePlugin({});
  // runtime getLocale for user define
  if (typeof runtimeLocale?.getLocale === 'function') {
   return runtimeLocale.getLocale();
  }
  // please clear localStorage if you change the baseSeparator config
  // because changing will break the app
  const lang =
      navigator.cookieEnabled && typeof localStorage !== 'undefined' && useLocalStorage
        ? window.localStorage.getItem('umi_locale')
        : '';
  // support baseNavigator, default true
  let browserLang;
  {{#BaseNavigator}}
  const isNavigatorLanguageValid =
    typeof navigator !== 'undefined' && typeof navigator.language === 'string';
  browserLang = isNavigatorLanguageValid
    ? navigator.language.split('-').join('{{BaseSeparator}}')
    : '';
  {{/BaseNavigator}}
  return lang || browserLang || {{{DefaultLocale}}};
};


/**
 * 获取当前选择的方向
 * @returns string
 */
export const getDirection = () => {
  const lang = getLocale();
  // array with all prefixs for rtl langueges ex: ar-EG , he-IL
  const rtlLangs = ['he', 'ar', 'fa', 'ku']
  const direction =  rtlLangs.filter(lng => lang.startsWith(lng)).length ? 'rtl' : 'ltr';
  return direction;
};

/**
 * 切换语言
 * @param lang 语言的 key
 * @param realReload 是否刷新页面，默认刷新
 * @returns string
 */
export const setLocale = (lang: string, realReload: boolean = true) => {
  //const { pluginManager } = useAppContext();
  //const runtimeLocale = pluginManagerapplyPlugins({
  //  key: 'locale',
  //  workaround: 不使用 ApplyPluginsType.modify 是为了避免循环依赖，与 fast-refresh 一起用时会有问题
  //  type: 'modify',
  //  initialValue: {},
  //});

  const updater = () => {
    if (getLocale() !== lang) {
       if (navigator.cookieEnabled && typeof window.localStorage !== 'undefined' && useLocalStorage) {
          window.localStorage.setItem('umi_locale', lang || '');
       }
      setIntl(lang);
      if (realReload) {
        window.location.reload();
      } else {
        event.emit(LANG_CHANGE_EVENT, lang);
        // chrome 不支持这个事件。所以人肉触发一下
        if (window.dispatchEvent) {
          const event = new Event('languagechange');
          window.dispatchEvent(event);
        }
      }
    }
  }

  //if (typeof runtimeLocale?.setLocale === 'function') {
  //  runtimeLocale.setLocale({
  //    lang,
  //    realReload,
  //    updater: updater,
  //  });
  //  return;
  //}

  updater();
};

let firstWaring = true;

/**
 * intl.formatMessage 的语法糖
 * @deprecated 使用此 api 会造成切换语言的时候无法自动刷新，请使用 useIntl 或 injectIntl
 * @param descriptor { id : string, defaultMessage : string }
 * @param values { [key:string] : string }
 * @returns string
 */
export const formatMessage: IntlShape['formatMessage'] = (
  descriptor: MessageDescriptor,
  values: any,
) => {
  if (firstWaring) {
    warning(
      false,
      `Using this API will cause automatic refresh when switching languages, please use useIntl or injectIntl.

使用此 api 会造成切换语言的时候无法自动刷新，请使用 useIntl 或 injectIntl。

http://j.mp/37Fkd5Q
      `,
    );
    firstWaring = false;
  }
  if (!g_intl) {
    setIntl(getLocale());
  }
  return g_intl.formatMessage(descriptor, values);
};

/**
 * 获取语言列表
 * @returns string[]
 */
export const getAllLocales = () => Object.keys(localeInfo);
