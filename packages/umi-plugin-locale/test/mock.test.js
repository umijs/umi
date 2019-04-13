import path from 'path';
import { winPath } from 'umi-utils';
import renderer from 'react-test-renderer';
import createMockWrapper, { getLocaleFileList } from '../src/mock';

jest.mock('umi-plugin-locale');

const { FormattedMessage, formatMessage } = require('umi-plugin-locale');
const absSrcPath = winPath(path.join(__dirname, '../examples/base/src'));
const absPagesPath = winPath(path.join(__dirname, '../examples/base/src/page'));
const MyComponent = () => (
  <div>
    <FormattedMessage id="test" values={{ name: 'umi' }} />
    {formatMessage({ id: 'test' }, { name: 'locale' })}
  </div>
);

describe('test umi-plugin-locale createMockWrapper', () => {
  it('api exists', () => {
    expect(createMockWrapper).toBeTruthy();
    expect(getLocaleFileList).toBeTruthy();
  });
  it('create wrapper', () => {
    const fileList = getLocaleFileList(absSrcPath, absPagesPath, true);
    const Wrapper = createMockWrapper(fileList, { antd: false });
    const warpperInstance = renderer
      .create(
        <Wrapper>
          <MyComponent />
        </Wrapper>,
      )
      .toJSON();
    expect(warpperInstance).toBeTruthy();
    expect(warpperInstance.children).toHaveLength(2);
    expect(warpperInstance.children[0].type).toBe('span');
    expect(warpperInstance.children[0].children[0]).toBe('test en umi');
    expect(warpperInstance.children[1]).toBe('test en locale');
  });
});
