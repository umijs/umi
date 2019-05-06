# umi-plugin-locale

English | [简体中文](https://github.com/umijs/umi/blob/master/packages/umi-plugin-locale/README_zh-CN.md)

i18n plugin for umi.

---

Suggest to use together with umi-plugin-react, see our website [umi-plugin-react](https://umijs.org/plugin/umi-plugin-react.html) for more.

---

## Config

**.umirc.js**

```js
export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        locale: {
          default: 'zh-CN', // default locale
          baseNavigator: true, // enable use `navigator.language` overwrite default
          antd: true, // enable `<LocaleProvider />` of antd
        },
      },
    ],
  ],
};
```

**src/app.js**

```js
export const locale = {
  default: 'en-US', // default locale
  baseNavigator: false, // enable use `navigator.language` overwrite default
  antd: true, // enable `<LocaleProvider />` of antd
};
```

## Directory convention

```
.
├── dist/
├── mock/
└── src/
    ├── layouts/index.js
    ├── locales               // The directory where the i18n text files are stored
        ├── zh-CN.js
        └── en-US.js
    └── pages/
        └── MyPage/
            └── locales       // Local i18n text files
                ├── zh-CN.js
                └── en-US.js
├── .umirc.js
├── .env
└── package.json
```

> If `singular: true` is configured in `.umirc.js`, the `locales` folder should be changed to `locale`.

## I18n files convention

Naming: `<lang>-<COUNTRY>.js`

Content: key-valued literal, for exmaple:

zh-CN.js

```javascript
export default {
  WELCOME_TO_UMI_WORLD: '{name}，欢迎光临 umi 的世界',
};
```

en-US.js

```javascript
export default {
  WELCOME_TO_UMI_WORLD: "{name}, welcome to umi's world",
};
```

## Extended API

After using this plugin, you can import i18n-related APIs from umi-plugin-locale (or umi-plugin-react/locale).

```javascript
import { formatMessage, setLocale, getLocale, FormattedMessage } from 'umi-plugin-locale';

// format message
const formatedText = formatMessage({ id: 'WELCOME_TO_UMI_WORLD' }, { name: '小伙子' });

console.log(formatedText === '小伙子，欢迎光临 umi 的世界');

// set to `'en-US'`
setLocale('en-US');

// get the current language
console.log(getLocale() === 'en-US');

// render i18n text as react node
function Example() {
  return <FormattedMessage id="WELCOME_TO_UMI_WORLD" values={{ name: '小伙子' }} />;
}
```

## Test

In the unit test, if the component being tested does not wrapped a context provider, the API exported from umi-plugin-locale will not work properly, and the following warning may appear:
![image](https://user-images.githubusercontent.com/19199408/54806772-039eac00-4cb6-11e9-919a-1606a1a599f5.png)
You can choose to mock umi-plugin-locale or use the `createMockWrapper` method provided by umi-plugin-locale to make internationalization work properly in unit tests.

### mock umi-plugin-locale

Take [jest](https://github.com/facebook/jest) as an example, create the `__mocks__` folder in the same level as the test code, and create a new file `umi-plugin-locale.js` (or `.ts` ) in it, add the following code to the file

```js
export const formatMessage = ({ defaultMessage, id }) => defaultMessage || id;
export const FormattedMessage = ({ defaultMessage, id }) => <span>{defaultMessage || id}</span>;
```

Add a line of code before the test code, you can replace the `formatMessage` and `FormattedMessage` methods with the corresponding contents of `__mocks__/umi-plugin-locale.js` during the unit tests, you can mock other APIs in the similar way

```diff
// ./src/pages/index.js
import { FormattedMessage } from 'umi-plugin-locale';
export default () => <FormattedMessage id="test" defaultMessage="Hello" />

// ./src/pages/__tests__/index.test.js
import MyComponent from '../index';
import renderer from 'react-test-renderer';
+ jest.mock('umi-plugin-locale');
test('name', () => {
  const instance = renderer.create(<MyComponent />);
  const json = instance.toJSON();
  expect(json.type).toBe('span');
  expect(json.children[0]).toBe('Hello');
  instance.unmount();
});
```

### Use `createMockWrapper`

You can also use `createMockWrapper` to provide internationalization capabilities for unit tests. Refer to [this file](https://github.com/umijs/umi/blob/master/packages/umi-plugin-locale/test/mock.test.js) and [configuration item definitions](https://github.com/umijs/umi/blob/dc051635c0855024d46a03fadf4e051d63959784/packages/umi-plugin-locale/index.d.ts#L151-L176) to write test files.

> **Tip**: If you need to test if the internationalization feature is working properly, we recommend using the e2e test.

```js
import { winPath } from 'umi-utils';
import renderer from 'react-test-renderer';
import { getLocaleFileList, setLocale } from 'umi-plugin-locale'; // or 'umi-plugin-react/locale'
// this is a sample test file located in `./src/pages/__tests__/`
const absSrcPath = winPath(path.join(__dirname, '../../'));
const absPagesPath = winPath(path.join(__dirname, '../'));
const Wrapper = createMockWrapper(getLocaleFileList(absSrcPath, absPagesPath));
test('example', () => {
  const instance = renderer.create(
    <Wrapper>
      <MyComponent />
    </Wrapper>,
  );
  /**
   * Wrapper will default to mock `localStorage` to support `setLocale` after the first rendering,
   * you can turn this feature off in the configuration
   */
  setLocale('en-US');
  expect(instance.toJSON().children[1]).toBe('test en locale');

  setLocale('zh-CN');
  instance.update(
    <Wrapper>
      <MyComponent />
    </Wrapper>,
  );
  expect(instance.toJSON().children[1]).toBe('测试中文 locale');
  // Unmount the component to remove the side effects of mocking `localStorage`
  instance.unmount();
});
```
