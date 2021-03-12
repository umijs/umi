# @umijs/plugin-locale

国际化插件，用于解决 i18n 问题。

## 启用方式

配置 `locale` 开启。

## 介绍

包含以下功能，

### 约定式多语言支持

比如以下目录，项目就拥有了 `zh-CN` 与 `en-US` 国际化语言切换：

```bash
+ src
  + locales
    - zh-CN.ts
    - en-US.ts
  + pages
```

多语言文件的命名规范：`<lang><分割符（通过 baseSeparator 配置）><COUNTRY>.js`

多语言文件的内容规范：键-值组成的字面量，如下：

```javascript
// src/locales/zh-CN.js
export default {
  WELCOME_TO_UMI_WORLD: '{name}，欢迎光临umi的世界',
};
```

```javascript
// src/locales/en-US.js
export default {
  WELCOME_TO_UMI_WORLD: "{name}, welcome to umi's world",
};
```

> 如果项目配置了 `singular: true` ，`locales` 要改成 `locale`

### import from umi

@umijs/plugin-locale 基于 react-intl 封装，支持其所有的 api，详情可以看 [这里](https://github.com/formatjs/formatjs/blob/main/website/docs/react-intl/api.md)。为了方便使用我们也添加了一些其他的功能，这里将会列举所有的 api，并且展示它的功能。

### addLocale

动态的增加语言，增加语言之后可以通过 [getAllLocales](#getAllLocales) 获得列表。addLocale 三个参数。

- `name` 语言的 key。例如 zh-TW
- `message` 语言的 id 列表。 例如：{ // id 列表 name: '妳好，{name}', }
- 相应的 `momentLocale` 和 `antd` 配置

```tsx
import zhTW from 'antd/es/locale/zh_TW';

// 动态增加新语言
addLocale(
  'zh-TW',
  {
    // id 列表
    name: '妳好，{name}',
  },
  {
    momentLocale: 'zh-tw',
    antd: zhTW,
  },
);
```

### getAllLocales

获取当前获得所有国际化文件的列表，默认会在 `locales` 文件夹下寻找类似 `en-US.(js|json|ts)` 文件。

```tsx
import { getAllLocales } from 'umi';

console.log(getAllLocales()); // [en-US,zh-CN,...]
```

### getLocale

`getLocale` 将获得当前选择的语言。

```tsx
import { getLocale } from 'umi';

console.log(getLocale()); // en-US | zh-CN
```

### useIntl

`useIntl` 是最常用的 api,它可以获得 `formatMessage` 等 api 来进行具体的值绑定。

```ts
// en-US.json
export default {
  name: 'Hi, {name}',
};
```

```tsx
//page/index.tsx

import React, { useState } from 'react';
import { useIntl } from 'umi';

export default function () {
  const intl = useIntl();
  return (
    <button type="primary">
      {intl.formatMessage(
        {
          id: 'name',
          defaultMessage: '你好，旅行者',
        },
        {
          name: '旅行者',
        },
      )}
    </button>
  );
}
```

### setLocale

设置切换语言，默认会刷新页面，可以通过设置第二个参数为 `false` ，来实现无刷新动态切换。

```tsx
import { setLocale } from 'umi';

// 刷新页面
setLocale('zh-TW', true);

// 不刷新页面
setLocale('zh-TW', false);
```

![](https://user-images.githubusercontent.com/13595509/75084981-4e2c4680-555f-11ea-9ae2-4e6f953adcdc.gif)

## 配置

- Type: `object`

目录约定：

### 构建时配置

开启 `locale: {}` 后，默认是如下配置：

```js
export default {
  locale: {
    default: 'zh-CN',
    antd: false,
    title: false,
    baseNavigator: true,
    baseSeparator: '-',
  },
};
```

#### baseSeparator

- Type: `string`
- Default: `-`

国家（lang） 与 语言（language） 之间的分割符。

默认情况下为 `-`，返回的语言及目录文件为 `zh-CN`、`en-US`、`sk` 等。

#### default

- Type: `string`
- Default: `zh-CN`

默认语言，当检测不到具体语言时，展示 `default` 中指定的语言。

> 若 `baseNavigator` 指定为 `_`，`default` 默认为 `zh_CN`。

#### antd

- Type: `boolean`
- Default: false

开启后，支持 [antd 国际化](https://ant.design/docs/react/i18n-cn)。

#### title

- Type: `boolean`
- Default: false

标题国际化。

在项目中配置的 `title` 及路由中的 `title` 可直接使用国际化 key，自动被转成对应语言的文案，例如：

`locales` 目录下有：

```js
// src/locales/zh-CN.js
export default {
  'site.title': '站点 - 标题',
  'about.title': '关于 - 标题',
};

// src/locales/en-US.js
export default {
  'site.title': 'English Title',
  'about.title': 'About - Title',
};
```

项目配置如下：

```js
// .umirc.js
export default {
  title: 'site.title',
  routes: [
    {
      path: '/',
      component: 'Index',
    },
    {
      path: '/about',
      component: 'About',
      title: 'about.title',
    },
  ],
};
```

访问页面时：

- `/` 路由，标题在中文时为 `站点 - 标题`，英文时为 `English Title`
- `/about` 路由，标题在中文时为 `关于 - 标题`，英文时为 `About Title`

#### baseNavigator

- Type: `boolean`
- Default: true

开启浏览器语言检测。

默认情况下，当前语言环境的识别按照：`localStorage` 中 `umi_locale` 值 > 浏览器检测 > [default](#default) 设置的默认语言 > 中文

### 运行时配置

支持运行时对国际化做一些扩展与定制，例如自定义语言识别等。

#### getLocale

自定义语言获取逻辑，比如识别链接 `?locale=${lang}` 当做当前页面的语言。

```js
// src/app.js
import qs from 'qs';

export const locale = {
  getLocale() {
    const { search } = window.location;
    const { locale = 'zh-CN' } = qs.parse(search, { ignoreQueryPrefix: true });
    return locale;
  },
};
```

#### setLocale

自定义语言切换逻辑。其中有三个参数：

- lang: 需要切换的语言
- realReload: 是否需要刷新页面，这个是由页面调用 `setLocale(lang, true)` 透传。
- updater：是否需要强制更新当前组件国际化状态。

比如根据要切换的语言，跳转到相应 url：

```js
// src/app.js
export const locale = {
  setLocale({ lang, realReload, updater }) {
    history.push(`/?locale=${lang}`);
    updater();
  },
};
```

## FAQ

### 为什么不要直接使用 formatMessage 这个语法糖？

虽然 formatMessage 使用起来会非常方便，但是它脱离了 react 的生命周期，最严重的问题就是切换语言时无法触发 dom 重新渲染。为了解决这个问题，我们切换语言时会刷新一下浏览器，用户体验很差，所以推荐大家使用 [`useIntl`](#useIntl) 或者 [`injectIntl`](https://github.com/formatjs/formatjs/blob/main/website/docs/react-intl/api.md#injectintl-hoc)，可以实现同样的功能。
