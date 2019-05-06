/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const dynamicRequireVars = {
  existsSync: null,
  globby: null,
  groupBy: null,
  momentLocation: null,
  path: null,
  resolved: false,
  winPath: null,
};

function checkDynamicRequire() {
  if (!dynamicRequireVars.resolved) {
    try {
      const globby = require('globby');
      const groupBy = require('lodash.groupby');
      dynamicRequireVars.globby = globby.default || globby;
      dynamicRequireVars.groupBy = groupBy.default || groupBy;
      dynamicRequireVars.path = require('path');
      dynamicRequireVars.existsSync = require('fs').existsSync;
      dynamicRequireVars.winPath = require('umi-utils').winPath;
      dynamicRequireVars.momentLocation = require
        .resolve('moment/locale/zh-cn')
        .replace(/zh\-cn\.js$/, '');
      dynamicRequireVars.resolved = true;
    } catch {
      return true;
    }
  }
}

export function getMomentLocale(lang, country) {
  if (checkDynamicRequire()) return '';
  const { existsSync, path, momentLocation } = dynamicRequireVars;
  if (existsSync(path.join(momentLocation, `${lang}-${country.toLocaleLowerCase()}.js`))) {
    return `${lang}-${country.toLocaleLowerCase()}`;
  }
  if (existsSync(path.join(momentLocation, `${lang}.js`))) {
    return lang;
  }
  return '';
}

// export for test
export function getLocaleFileList(absSrcPath, absPagesPath, singular) {
  if (checkDynamicRequire()) return [];
  const { globby, groupBy, path, winPath } = dynamicRequireVars;
  const localeFileMath = /^([a-z]{2})-([A-Z]{2})\.(js|ts)$/;
  const localeFolder = singular ? 'locale' : 'locales';
  const localeFiles = globby
    .sync('*.{ts,js}', {
      cwd: path.join(absSrcPath, localeFolder),
    })
    .map(name => path.join(absSrcPath, localeFolder, name))
    .concat(
      globby
        .sync(`**/${localeFolder}/*.{ts,js}`, {
          cwd: absPagesPath,
        })
        .map(name => path.join(absPagesPath, name)),
    )
    .filter(p => localeFileMath.test(path.basename(p)))
    .map(fullname => {
      const fileName = path.basename(fullname);
      const fileInfo = localeFileMath.exec(fileName);
      return {
        name: `${fileInfo[1]}-${fileInfo[2]}`,
        path: fullname,
      };
    });
  const groups = groupBy(localeFiles, 'name');
  return Object.keys(groups).map(name => {
    const fileInfo = name.split('-');
    return {
      lang: fileInfo[0],
      name,
      country: fileInfo[1],
      paths: groups[name].map(item => winPath(item.path)),
      momentLocale: getMomentLocale(fileInfo[0], fileInfo[1]),
    };
  });
}

/**
 * mock `localStorage` and `location.reload` for 'umi_locale'
 * @param {Partial<Window>} mockGlobalVars
 * @returns {(oldGlobalVars?: Partial<Window>) => void} removeMockEffects
 */
export const mockGlobalVars = (mockGlobalVars = {}) => {
  const defaultOldGlobalVars = {
    ...window,
    location: { ...window.location },
  };

  // Reference: greasemonkey_api_test.js@chromium
  const localStorageMock = mockGlobalVars.localStorage || {
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

  const { location: locationMock } = mockGlobalVars;
  let locationReloadMock = locationMock && locationMock.reload;
  if (!locationReloadMock) {
    locationReloadMock = () => {
      window.g_lang = localStorage.getItem('umi_locale');
    };
  }

  Object.defineProperty(window, 'localStorage', {
    writable: true,
    value: localStorageMock,
  });
  Object.defineProperty(window.location, 'reload', {
    writable: true,
    value: locationReloadMock,
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

const createMockWrapper = (localeList = [], options = {}) => {
  const { antd = true, baseNavigator = true } = options;
  const defaultLocale = options.default || 'zh-CN';
  const [lang, country] = defaultLocale.split('-');
  const defaultAntdLocale = `${lang}_${country}`;
  const defaultMomentLocale = (localeList.find(locale => locale.name === defaultLocale) || {})
    .momentLocale;
  const React = require('react');
  let removeMockEffects = () => {};
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
      if (options.mockGlobalVars || options.mockGlobalVars === undefined) {
        removeMockEffects = mockGlobalVars({
          location: { reload: () => this.forceUpdate() },
        });
      }
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
        const defaultAntd = require(`antd/lib/locale-provider/${defaultAntdLocale}`);
        this.defaultAntd = defaultAntd.default || defaultAntd;
      }
      this.getSnapshotBeforeUpdate();
    }

    componentDidUpdate() {}

    componentWillUnmount() {
      removeMockEffects();
    }

    getSnapshotBeforeUpdate() {
      const umiLocale = localStorage.getItem('umi_locale');
      if (umiLocale && this.localeInfo[umiLocale]) {
        this.appLocale = this.localeInfo[umiLocale];
      } else if (this.localeInfo[navigator.language] && baseNavigator) {
        this.appLocale = this.localeInfo[navigator.language];
      } else {
        this.appLocale = this.localeInfo[defaultLocale] || this.appLocale;
      }
      if (antd && this.appLocale.momentLocale) {
        require(`moment/locale/${this.appLocale.momentLocale}`);
      }
      window.g_lang = this.appLocale.locale;
      if (localeList.length && this.appLocale.data) {
        this.localePkg.addLocaleData(this.appLocale.data);
      }
      return null;
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
