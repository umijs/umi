import { IntlProvider } from 'react-intl';
import renderer from 'react-test-renderer';
import {
  formatMessage,
  formatHTMLMessage,
  FormattedMessage,
  getLocale,
  intlShape,
  setLocale,
  _setIntlObject,
} from '../src/locale';

/* eslint-disable */
const localStorageMock = (function() {
  let store = {};

  return {
    // Reference: greasemonkey_api_test.js@chromium
    getItem: function(key) {
      if (key in store) {
        return store[key];
      }
      return null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
  };
})();

const InjectedWrapper = (function() {
  let sfc = (props, context) => {
    _setIntlObject(context.intl);
    return props.children;
  };
  sfc.contextTypes = {
    intl: intlShape,
  };
  return sfc;
})();
/* eslint-enable */

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// eslint-disable-next-line
Object.defineProperty(location, 'reload', {
  value: () => {
    window.g_lang = window.localStorage.getItem('umi_locale');
  },
});

describe('test umi/locale', () => {
  test('api exist', () => {
    const wrapper = renderer.create(
      <IntlProvider locale="en">
        <InjectedWrapper>Fallback</InjectedWrapper>
      </IntlProvider>,
    );
    expect(formatMessage).toBeTruthy();
    expect(formatHTMLMessage).toBeTruthy();
    expect(setLocale).toBeTruthy();
    expect(getLocale).toBeTruthy();
    expect(FormattedMessage).toBeTruthy();
    wrapper.unmount();
  });

  test('setLocale', () => {
    expect(() => {
      setLocale('xxll1');
    }).toThrow();
    expect(() => {
      setLocale('zh-cn');
    }).toThrow();
    expect(() => {
      setLocale('zh_CN');
    }).toThrow();

    setLocale('zh-CN');
    expect(window.localStorage.getItem('umi_locale')).toBe('zh-CN');
    expect(getLocale()).toBe('zh-CN');
    setLocale('en-US');
    expect(getLocale()).toBe('en-US');
    setLocale();
    expect(window.localStorage.getItem('umi_locale')).toBe('');
  });
});
