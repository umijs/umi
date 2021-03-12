# @umijs/plugin-locale

Internationalization plug-in, used to solve i18n problem.

## How to enable

Configure `locale` to enable.

## Introduction

Contains the following functions,

### Conventional multi-language support

For example, in the following directory, the project has the internationalized language switch between `zh-CN` and `en-US`:

```bash
+ src
  + locales
    -zh-CN.ts
    -en-US.ts
  + pages
```

Naming convention for multi-language files: `<lang><separator (configured by baseSeparator)><COUNTRY>.js`

The content specification of multilingual files: key-value literal, as follows:

```javascript
// src/locales/zh-CN.js
export default {
  WELCOME_TO_UMI_WORLD: '{name}, welcome to the world of umi',
};
```

```javascript
// src/locales/en-US.js
export default {
  WELCOME_TO_UMI_WORLD: "{name}, welcome to umi's world",
};
```

> If the project is configured with `singular: true`, `locales` should be changed to `locale`

### import from umi

@umijs/plugin-locale is based on the react-intl package and supports all its apis. For details, please see [here](https://github.com/formatjs/formatjs/blob/main/website/docs/react-intl/api.md). In order to facilitate the use, we also added some other functions, here will list all the api, and show its functions.

### addLocale

Add languages ​​dynamically. After adding languages, you can get the list through [getAllLocales](#getAllLocales). Three parameters of addLocale.

- The key of the `name` language. E.g. zh-TW
- The id list of `message` language. For example:`{ name:'Hello, {name}',}`
- Corresponding `momentLocale` and `antd` configuration

```tsx
import zhTW from 'antd/es/locale/zh_TW';

// Dynamically add new languages
addLocale(
  'zh-TW',
  {
    // id list
    name: 'Hello, {name}',
  },
  {
    momentLocale: 'zh-tw',
    antd: zhTW,
  },
);
```

### getAllLocales

Get a list of all internationalized files currently obtained. By default, it will look for files similar to `en-US.(js|json|ts)` in the `locales` folder.

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

`UseIntl` is the most commonly used api, and it can obtain apis such as `formatMessage` for specific value binding.

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
          defaultMessage: 'Hello, traveler',
        },
        {
          name: 'Traveler',
        },
      )}
    </button>
  );
}
```

### setLocale

Set the switching language, the page will be refreshed by default. You can achieve dynamic switching without refresh by setting the second parameter to `false`.

```tsx
import { setLocale } from 'umi';

// refresh page
setLocale('zh-TW', true);

// Do not refresh the page
setLocale('zh-TW', false);
```

![png](https://user-images.githubusercontent.com/13595509/75084981-4e2c4680-555f-11ea-9ae2-4e6f953adcdc.gif)

## Configuration

- Type: `object`

Directory convention:

### Build-time configuration

After enabling `locale: {}`, the default configuration is as follows:

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

The separator between country (lang) and language (language).

By default, it is `-`, and the returned language and catalog files are `zh-CN`, `en-US`,`sk`, etc.

#### default

- Type: `string` -Default: `zh-CN`

Default language, when no specific language is detected, the language specified in `default` is displayed.

> If `baseNavigator` is specified as `_`, `default` defaults to `zh_CN`.

#### antd

- Type: `boolean`
- Default: false

After opening, support [antd internationalization](https://ant.design/docs/react/i18n-cn).

#### title

- Type: `boolean`
- Default: false

Title internationalization.

The `title` configured in the project and the `title` in the route can directly use the internationalization key and automatically be converted into the corresponding language copy, for example:

Under the `locales` directory:

```js
// src/locales/zh-CN.js
export default {
  'site.title': 'Site-Title',
  'about.title': 'About-Title',
};

// src/locales/en-US.js
export default {
  'site.title': 'English Title',
  'about.title': 'About-Title',
};
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
    },
  ],
};
```

When visiting the page:

- `/` route, title is `site-title` in Chinese, `English Title` in English
- `/about` route, the title is `About-Title` in Chinese, and `About Title` in English

#### baseNavigator

- Type: `boolean`
- Default: true

Turn on browser language detection.

By default, the current locale is recognized as follows: `umi_locale`value in`localStorage`> browser detection> default language set by [default](#default)> Chinese

### Runtime configuration

Support some extensions and customizations to internationalization at runtime, such as custom language recognition.

#### getLocale

Customize language acquisition logic, such as identifying the link `?locale=${lang}` as the language of the current page.

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

Custom language switching logic. There are three parameters:

- lang: The language to be switched
- realReload: Whether the page needs to be refreshed, this is transparently transmitted by the page calling `setLocale(lang, true)`.
- updater: Whether it is necessary to forcibly update the internationalization status of the current component.

For example, according to the language to be switched, jump to the corresponding url:

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

### Why not just use formatMessage as a syntactic sugar?

Although formatMessage is very convenient to use, it is out of the life cycle of react. The most serious problem is that it cannot trigger dom to re-render when switching languages. In order to solve this problem, we refresh the browser when switching languages. The user experience is very poor, so we recommend you to use [`useIntl`](#useIntl) or [`injectIntl`](https://github.com/formatjs/formatjs/blob/main/website/docs/react-intl/api.md#injectintl-hoc), can achieve the same function.
