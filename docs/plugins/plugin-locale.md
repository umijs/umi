---
translateHelp: true
---

# @umijs/plugin-locale


Internationalization plugin for i18n issues.

## How to enable

Configure `locale` to be enabled.

## Introduction

Contains the following features,

### Conventional multilingual support

For example, the following directory, the project has `zh-CN` and `en-US` international language switching:

```bash
+ src
  + locales
    - zh-CN.ts
    - en-US.ts
  + pages
```

Multilingual file naming convention: `<lang><separator (configured via baseSeparator)><COUNTRY>.js`

Content specification for multilingual files: key-value literals, as follows:

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

> If the project is configured with `singular: true`, `locales` must be changed to `locale`

### import from umi

`@umijs/plugin-locale` is based on `react-intl` package and supports all its APIs. For details, see [here](https://github.com/formatjs/react-intl/blob/master/docs/API.md). For the convenience of use, we have also added some other functions. Here we will list all the APIs and show their functions.

### addLocale

Add languages ​​dynamically. After adding languages, you can get the list by [getAllLocales](#getAllLocales). `addLocale` takes three parameters.

- `name` Language key. E.g. zh-TW
- `message` A list of ids for the language. For example:
```ts
{
  // id list
  name: 'hello, {name}',
}
```
- Corresponding `momentLocale` and `antd` configuration

```tsx
import zhTW from 'antd/es/locale/zh_TW';

// Adding new languages ​​dynamically
addLocale(
  'zh-TW',
  {
    // id list
    name: '妳好，{name}',
  },
  {
    momentLocale: 'zh-tw',
    antd: zhTW,
  },
);
```

### getAllLocales

Get the current list of all internationalization files. By default, it will look for `en-US.(js|json|ts)` files in the `locales` folder.

```tsx
import { getAllLocales } from 'umi';

console.log(getAllLocales()); // [en-US,zh-CN,...]
```

### getLocale

`getLocale` will get the currently selected language.

```tsx
import { getLocale } from 'umi';

console.log(getLocale()); // en-US | zh-CN
```

### useIntl

`useIntl` is the most commonly used API. It can get APIs such as `formatMessage` for specific value binding.

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

export default function() {
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

Set the switching language. The page will be refreshed by default. You can set the second parameter to `false` to achieve dynamic switching without refreshing.

```tsx
import { setLocale } from 'umi';

// refresh page
setLocale('zh-TW', true);

// Do not refresh the page
setLocale('zh-TW', false);
```

![](https://user-images.githubusercontent.com/13595509/75084981-4e2c4680-555f-11ea-9ae2-4e6f953adcdc.gif)

## Configuration

* Type: `object`

Directory conventions:

### Build-time configuration

When `locale: {}` is enabled, the default configuration is as follows:

```js
export default {
  locale: {
    default: 'zh-CN',
    antd: false,
    title: false,
    baseNavigator: true,
    baseSeparator: '-',
  }
}
```

#### baseSeparator

* Type: `string`
* Default: `-`

The delimiter between lang and language.

By default, it is `-`, and the returned languages ​​and directory files are `zh-CN`, `en-US`, `sk`, etc.

#### default

* Type: `string`
* Default: `zh-CN`

The default language. When no specific language is detected, the language specified in `default` is displayed.

> If `baseNavigator` is specified as` _`, `default` defaults to `zh_CN`.

#### antd

* Type: `boolean`
* Default: false

When enabled, it supports [antd internationalization](https://ant.design/docs/react/i18n).

#### title

* Type: `boolean`
* Default: false

Internationalization of titles.

The `title` configured in the project and the `title` in the route can directly use the internationalization key and be automatically converted into the corresponding language copy, for example:

The `locales` directory has:

```js
// src/locales/zh-CN.js
export default {
  'site.title': '站点 - 标题',
  'about.title': '关于 - 标题',
}

// src/locales/en-US.js
export default {
  'site.title': 'English Title',
  'about.title': 'About - Title',
}
```

The project configuration is as follows:

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
    }
  ]
}
```

When visiting the page:

- `/` Route, title is `Site-Title` in Chinese and `English Title` in English
- `/about` Route, title is `About-Title` in Chinese and `About Title` in English

#### baseNavigator

* Type: `boolean`
* Default: true

Enable browser language detection.

By default, the current locale is identified according to: `umi_locale` value in` localStorage` > browser detection > [default](#default) set default language > Chinese

### Runtime configuration

Support for extension and customization of internationalization at runtime, such as custom language recognition.

#### getLocale

Custom language acquisition logic, such as identifying the link `?locale=${lang}` as the language of the current page.

```js
// src/app.js
import qs from 'qs';

export const locale = {
  getLocale() {
    const { search } = window.location;
    const { locale = 'zh-CN' } = qs.parse(search, { ignoreQueryPrefix: true });
    return locale;
  },
}
```

#### setLocale

Custom language switching logic. There are three parameters:

- lang: Language to switch
- realReload: Whether the page needs to be refreshed. This is transparently called by the page by calling `setLocale(lang, true)`.
- updater: Whether to force update the current internationalization status of the component.

For example, depending on the language you want to switch to, jump to the corresponding URL:

```js
// src/app.js
export const locale = {
  setLocale({ lang, realReload, updater }) {
    history.push(`/?locale=${lang}`);
    updater();
  }
}
```

## FAQ

### Why not use the syntactic sugar of formatMessage directly?

Although formatMessage is very convenient to use, it is out of the react life cycle. The most serious problem is that it cannot trigger dom re-rendering when switching languages. To solve this problem, we will refresh the browser when switching languages. The user experience is very poor, so it is recommended that you use [`useIntl`](#useIntl) or [`injectIntl`](https://github.com/formatjs/react-intl/blob/master/docs/API.md#injectintl-hoc), can achieve the same function.
