/**
 * mock `localStorage` and `location.reload` for 'umi_locale'
 * @returns {(oldGlobalVars?: Partial<Window>) => void} removeMockEffects
 */
export const mockGlobalVars = () => {
  // eslint-disable-next-line wrap-iife
  const localStorageMock = (function() {
    return {
      // Reference: greasemonkey_api_test.js@chromium
      getItem(key) {
        return key in this ? this[key] : null;
      },
      setItem(key, value) {
        this[key] = `${value}`;
      },
      clear() {
        Object.entries(this).forEach(item => {
          if (typeof item[1] === 'string') {
            this.removeItem(item[0]);
          }
        });
      },
      removeItem(key) {
        delete this[key];
      },
    };
  })();

  const defaultOldGlobalVars = {
    ...window,
    location: { ...window.location },
  };

  Object.defineProperty(window, 'localStorage', {
    writable: true,
    value: localStorageMock,
  });
  Object.defineProperty(window.location, 'reload', {
    writable: true,
    value: () => {
      window.g_lang = window.localStorage.getItem('umi_locale');
    },
  });

  return (oldGlobalVars = defaultOldGlobalVars) => {
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: oldGlobalVars.localStorage,
    });
    Object.defineProperty(window.location, 'reload', {
      writable: true,
      value: oldGlobalVars.location.reload,
    });
  };
};

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const createMockWrapper = (localeList = [], options = {}) => {
  const { antd = true, baseNavigator = true } = options;
  const defaultLocale = options.default || 'zh-CN';
  const [lang, country] = defaultLocale.split('-');
  const defaultAntdLocale = `${lang}_${country}`;
  const defaultMomentLocale = (localeList.find(locale => locale.name === defaultLocale) || {})
    .momentLocale;
  const React = require('react');
  return class MockWrapper extends React.Component {
    moment = {};

    localePkg = {};

    localeInfo = {};

    defaultAntd = {};

    appLocale = {
      locale: defaultLocale,
      messages: {},
      data: require(`react-intl/locale-data/${lang}`),
      momentLocale: defaultMomentLocale,
    };

    constructor() {
      super();
      if (localeList.length) {
        this.localePkg = require('umi-plugin-locale');
        const { _setIntlObject, intlShape } = this.localePkg;
        this.InjectedWrapper = (() => {
          const FC = (props, context) => {
            _setIntlObject(context.intl);
            return props.children;
          };
          FC.contextTypes = { intl: intlShape };
          return FC;
        })();
      }
      localeList.forEach(locale => {
        this.localeInfo[locale.name] = {
          messages: locale.paths.reduce(
            (prev, curr) => ({ ...prev, ...require(curr).default }),
            {},
          ),
          locale: locale.name,
          data: require(`react-intl/locale-data/${locale.lang}`),
          momentLocale: locale.momentLocale,
        };
        if (antd) {
          const antdLocalePath = `antd/lib/locale-provider/${locale.lang}_${locale.country}`;
          const antdLocale = require(antdLocalePath);
          this.localeInfo[locale.name].antd = antdLocale.default || antdLocale;
        }
      });
      if (antd) {
        this.LocaleProvider = require('antd').LocaleProvider;
        if (defaultMomentLocale) {
          require(`moment/locale/${defaultMomentLocale}`);
        }
        const defaultAntd = require(`antd/lib/locale-provider/${defaultAntdLocale}`);
        this.defaultAntd = defaultAntd.default || defaultAntd;
      }
      const umiLocale = localStorage.getItem('umi_locale');
      if (umiLocale && this.localeInfo[umiLocale]) {
        this.appLocale = this.localeInfo[umiLocale];
      } else if (this.localeInfo[navigator.language] && baseNavigator) {
        this.appLocale = this.localeInfo[navigator.language];
      } else {
        this.appLocale = this.localeInfo[defaultLocale] || this.appLocale;
      }
      window.g_lang = this.appLocale.locale;
      if (localeList.length && this.appLocale.data) {
        this.localePkg.addLocaleData(this.appLocale.data);
      }
    }

    InjectedWrapper = props => props.children;

    LocaleProvider = props => props.children;

    render() {
      const { IntlProvider } = this.localePkg;
      let { children: ret } = this.props;
      if (localeList.length) {
        ret = React.createElement(
          IntlProvider,
          { locale: this.appLocale.locale, messages: this.appLocale.messages },
          React.createElement(this.InjectedWrapper, null, ret),
        );
      }
      if (antd) {
        ret = React.createElement(
          this.LocaleProvider,
          { locale: this.appLocale.antd || this.defaultAntd },
          ret,
        );
      }
      return ret;
    }
  };
};

export default createMockWrapper;
