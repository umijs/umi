import { IntlProvider } from 'react-intl';
import renderer from 'react-test-renderer';
import { mockGlobalVars } from '../src/mock';
import {
  formatMessage,
  formatHTMLMessage,
  FormattedMessage,
  getLocale,
  intlShape,
  setLocale,
  now,
  onError,
  formatDate,
  formatTime,
  formatRelative,
  formatNumber,
  formatPlural,
  _setIntlObject,
} from '../src/locale';

// eslint-disable-next-line wrap-iife
const InjectedWrapper = (function() {
  const sfc = (props, context) => {
    _setIntlObject(context.intl);
    return props.children;
  };
  sfc.contextTypes = {
    intl: intlShape,
  };
  return sfc;
})();

const removeMockEffects = mockGlobalVars();
afterAll(() => removeMockEffects());

describe('test umi-plugin-locale', () => {
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
    expect(now).toBeTruthy();
    expect(onError).toBeTruthy();
    expect(formatDate).toBeTruthy();
    expect(formatTime).toBeTruthy();
    expect(formatRelative).toBeTruthy();
    expect(formatNumber).toBeTruthy();
    expect(formatPlural).toBeTruthy();
    wrapper.unmount();
  });

  test('api exist before mounted', () => {
    expect(formatMessage).toBeTruthy();
    expect(formatHTMLMessage).toBeTruthy();
    expect(setLocale).toBeTruthy();
    expect(getLocale).toBeTruthy();
    expect(FormattedMessage).toBeTruthy();
    expect(now).toBeTruthy();
    expect(onError).toBeTruthy();
    expect(formatDate).toBeTruthy();
    expect(formatTime).toBeTruthy();
    expect(formatRelative).toBeTruthy();
    expect(formatNumber).toBeTruthy();
    expect(formatPlural).toBeTruthy();
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
