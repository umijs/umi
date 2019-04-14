# umi-plugin-locale

[English](https://github.com/umijs/umi/blob/master/packages/umi-plugin-locale/README.md) | 简体中文

i18n plugin for umi.

---

Suggest to use together with umi-plugin-react, see our website [umi-plugin-react](https://umijs.org/plugin/umi-plugin-react.html) for more.

---

## 配置

**.umirc.js**

```js
export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        locale: {
          default: 'zh-CN', // 默认语言 zh-CN
          baseNavigator: true, // 为 `true` 时，用 `navigator.language` 的值作为默认语言
          antd: true, // 是否启用 antd 的 <LocaleProvider />
        },
      },
    ],
  ],
};
```

## 目录及约定

```
.
├── dist/
├── mock/
└── src/
    ├── layouts/index.js
    ├── pages/
    └── locales               // 多语言文件存放目录，里面的文件会被umi自动读取
        ├── zh-CN.js
        └── en-US.js
├── .umirc.js
├── .env
└── package.json
```

> 如果 `.umirc.js` 里配置了 `singular: true`，`locales` 要改成 `locale`

## 多语言文件约定

多语言文件的命名规范：`<lang>-<COUNTRY>.js`

多语言文件的内容规范：键-值组成的字面量，如下：

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

## 扩展 API

使用本插件后，你可以从 umi-plugin-locale （或 umi-plugin-react/locale） 引入国际化相关的 API，获得关于多语言功能在编程上的便利。

```javascript
import { formatMessage, setLocale, getLocale, FormattedMessage } from 'umi-plugin-locale';

// 获取指定文字的多语言版本
const formatedText = formatMessage({ id: 'WELCOME_TO_UMI_WORLD' }, { name: '小伙子' });

console.log(formatedText === '小伙子，欢迎光临 umi 的世界');

// 设置为 en-US
setLocale('en-US');

// 获取当前语言
console.log(getLocale() === 'en-US');

// 渲染一个文字标签
function Example() {
  return <FormattedMessage id="WELCOME_TO_UMI_WORLD" values={{ name: '小伙子' }} />;
}
```

## 测试

单元测试中，如果被测试的组件没有 context provider 包裹，umi-plugin-locale 中的 API 将无法正常工作，并可能出现如下警告：
![image](https://user-images.githubusercontent.com/19199408/54806772-039eac00-4cb6-11e9-919a-1606a1a599f5.png)
你可以选择 mock 掉 umi-plugin-locale ，或者使用 umi-plugin-locale 提供的 `createMockWrapper` 方法，以在单元测试中正常使用国际化功能。

### mock umi-plugin-locale

以 [jest](https://github.com/facebook/jest) 为例，在测试代码同级目录下创建 `__mocks__` 文件夹，并在其中新建文件 `umi-plugin-locale.js` （或 `.ts` ），在文件中添加代码

```js
export const formatMessage = ({ defaultMessage, id }) => defaultMessage || id;
export const FormattedMessage = ({ defaultMessage, id }) => <span>{defaultMessage || id}</span>;
```

在测试代码之前添加一行代码，即可在单元测试运行过程中将 `formatMessage` 与 `FormattedMessage` 方法替换成 `__mocks__/umi-plugin-locale.js` 中对应的内容，其他 API 的 mock 方法类似

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

### 使用 `createMockWrapper`

你也可以使用 `createMockWrapper` 为单元测试提供国际化能力，参考 [此文件](https://github.com/umijs/umi/blob/master/packages/umi-plugin-locale/test/mock.test.js) 与 [配置项定义](https://github.com/umijs/umi/blob/dc051635c0855024d46a03fadf4e051d63959784/packages/umi-plugin-locale/index.d.ts#L151-L176) 来编写测试文件。

> **提示**：如果你需要测试国际化功能是否正常运行，建议使用 e2e 测试。

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
   * Wrapper 第一次渲染之后会默认 mock 掉 `localStorage` 来支持 `setLocale`，
   * 你可以在配置中关闭此功能
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
  // 卸载组件以移除 mock `localStorage` 带来的副作用
  instance.unmount();
});
```
