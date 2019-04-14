import path from 'path';
import { winPath } from 'umi-utils';
import renderer from 'react-test-renderer';
import createMockWrapper, { mockGlobalVars } from '../src/mock';
import { getLocaleFileList } from '../src/index';

jest.mock('antd');
jest.mock('umi-plugin-locale');

const removeMockEffects = mockGlobalVars();
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

afterAll(() => removeMockEffects());

describe('test umi-plugin-locale createMockWrapper', () => {
  it('api exists', () => {
    expect(createMockWrapper).toBeTruthy();
    expect(getLocaleFileList).toBeTruthy();
  });

  it('en-US', () => {
    setLocale('en-US');
    const warpperInstance = renderer.create(
      <Wrapper>
        <MyComponent />
      </Wrapper>,
    );
    const json = warpperInstance.toJSON();
    expect(json).toBeTruthy();
    expect(json.children).toHaveLength(2);
    expect(json.children[0].type).toBe('span');
    expect(json.children[0].children[0]).toBe('test en umi');
    expect(json.children[1]).toBe('test en locale');
    warpperInstance.unmount();
  });

  it('zh-CN', () => {
    setLocale('zh-CN');
    const warpperInstance = renderer.create(
      <Wrapper>
        <MyComponent />
      </Wrapper>,
    );
    const json = warpperInstance.toJSON();
    expect(json.children[0].children[0]).toBe('测试中文 umi');
    expect(json.children[1]).toBe('测试中文 locale');
    warpperInstance.unmount();
  });

  it('default locale', () => {
    localStorage.clear();
    const LocalWrapper = createMockWrapper(fileList, {
      antd: false,
      default: 'en-US',
      baseNavigator: false,
    });
    const warpperInstance = renderer.create(
      <LocalWrapper>
        <MyComponent />
      </LocalWrapper>,
    );
    const json = warpperInstance.toJSON();
    expect(json.children[1]).toBe('test en locale');
    warpperInstance.unmount();
  });
});
