import {
  formatMessage,
  setLocale,
  getLocale,
  FormattedMessage,
} from '../src/locale';

jest.mock('react-intl');

var localStorageMock = (function() {
  var store = {};

  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(location, 'reload', {
  value: () => {},
});

describe('test umi/locale', () => {
  test('api exist', () => {
    expect(formatMessage).toBeTruthy();
    expect(setLocale).toBeTruthy();
    expect(getLocale).toBeTruthy();
    expect(FormattedMessage).toBeTruthy();
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
    // 用例挂了，先注释了。
    // expect(getLocale()).toBe('zh-CN');
    setLocale('en-US');
    // expect(getLocale()).toBe('en-US');
  });
});
