import { isBrowser, setLocale } from 'umi';
import { setCookie, getCookie } from './utils/cookie';

/**
 * Expand language plugin, language order, cookie at runtime> browser default language> default language
 * When switching languages, localStorage and cookies will be set at the same time, and the keys will remain the same.
 * The cookie method is encapsulated, and it is suitable for both the server and the client, and the method for the client to get the cookie
 * See serverHelper.js, just expand the koa method, please learn by yourself for koa trial
 * Please refer to utils/cookie for the method of client obtain cookie
 *
 */
export const locale = {
  getLocale() {
    let lang;
    if (isBrowser()) {
      const navigatorLang = window.navigator.language.includes('zh')
        ? 'zh-CN'
        : 'en-US';
      /**
       * The final default is Chinese, here you can modify it according to your own project needs
       * Or you can define a config for locale separately, that is, give umirc
       * You can also import it here, assign it to the default language, and modify a place like this
       * You can complete the modification of the default language
       *
       */
      lang = getCookie('umi_locale') || navigatorLang || 'zh-CN';
    } else {
      lang = getCookie('umi_locale') || global._navigatorLang || 'zh-CN';
    }
    return lang;
  },
  setLocale({ lang, realReload = false, updater }) {
    if (!isBrowser()) {
      console.error('---------Setting voice failed in non-browser environment--------');
      return;
    }
    if (!lang) {
      console.error('---------The language to be switched must be entered, otherwise it cannot be switched--------');
      return;
    }
    localStorage.setItem('umi_locale', lang);
    setCookie('umi_locale', lang, null, 10000);
    if (realReload) {
      window.location.reload();
    }
    updater();
  },
};
