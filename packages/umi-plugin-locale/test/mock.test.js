import path from 'path';
import { winPath } from 'umi-utils';
import renderer from 'react-test-renderer';
import createMockWrapper, { getLocaleFileList } from '../src/mock';

jest.mock('antd');
jest.mock('umi-plugin-locale');

const { FormattedMessage, formatMessage, setLocale } = require('umi-plugin-locale');
const absSrcPath = winPath(path.join(__dirname, '../examples/base/src'));
const absPagesPath = winPath(path.join(__dirname, '../examples/base/src/page'));
const fileList = getLocaleFileList(absSrcPath, absPagesPath, true);
const Wrapper = createMockWrapper(fileList);
const MyComponent = () => (
  <div>
    <FormattedMessage id="test" values={{ name: 'umi' }} />
    {formatMessage({ id: 'test' }, { name: 'locale' })}
  </div>
);

describe('test getLocaleFileList', () => {
  test('singular: true', () => {
    const list = getLocaleFileList(absSrcPath, absPagesPath, true);
    expect(list).toEqual([
      {
        lang: 'en',
        country: 'US',
        name: 'en-US',
        paths: [`${absSrcPath}/locale/en-US.js`, `${absPagesPath}/temp/locale/en-US.js`],
        momentLocale: '',
      },
      {
        lang: 'zh',
        country: 'CN',
        name: 'zh-CN',
        paths: [`${absSrcPath}/locale/zh-CN.js`, `${absPagesPath}/temp/locale/zh-CN.js`],
        momentLocale: 'zh-cn',
      },
    ]);
  });

  test('singular: false', () => {
    const list = getLocaleFileList(absSrcPath, absPagesPath, false);
    expect(list).toEqual([]);
  });
});

describe('test umi-plugin-locale createMockWrapper', () => {
  it('api exists', () => {
    expect(createMockWrapper).toBeTruthy();
    expect(getLocaleFileList).toBeTruthy();
  });

  it('set locale and format message', () => {
    const wrapperInstance = renderer.create(
      <Wrapper>
        <MyComponent />
      </Wrapper>,
    );
    setLocale('en-US');
    const enJSON = wrapperInstance.toJSON();
    expect(enJSON).toBeTruthy();
    expect(enJSON.children).toHaveLength(2);
    expect(enJSON.children[0].type).toBe('span');
    expect(enJSON.children[0].children[0]).toBe('test en umi');
    expect(enJSON.children[1]).toBe('test en locale');
    setLocale('zh-CN');
    wrapperInstance.update(
      <Wrapper>
        <MyComponent />
      </Wrapper>,
    );
    const zhJSON = wrapperInstance.toJSON();
    expect(zhJSON.children[0].children[0]).toBe('测试中文 umi');
    expect(zhJSON.children[1]).toBe('测试中文 locale');
    wrapperInstance.unmount();
  });

  it('default locale', () => {
    localStorage.clear();
    const LocalWrapper = createMockWrapper(fileList, {
      antd: false,
      default: 'en-US',
      baseNavigator: false,
      mockGlobalVars: false,
    });
    const wrapperInstance = renderer.create(
      <LocalWrapper>
        <MyComponent />
      </LocalWrapper>,
    );
    const json = wrapperInstance.toJSON();
    expect(json.children[1]).toBe('test en locale');
    wrapperInstance.unmount();
  });

  it('baseNavigator', () => {
    const LocalWrapper = createMockWrapper(fileList, {
      antd: false,
      baseNavigator: true,
      mockGlobalVars: false,
    });
    const wrapperInstance = renderer.create(
      <LocalWrapper>
        <MyComponent />
      </LocalWrapper>,
    );
    const json = wrapperInstance.toJSON();
    const isEN = navigator.language === 'en-US';
    expect(json.children[1]).toBe(isEN ? 'test en locale' : '测试中文 locale');
    wrapperInstance.unmount();
  });
});
