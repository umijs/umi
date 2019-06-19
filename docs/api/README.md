---
sidebarDepth: 2
---

# API

## Route

### umi/link

Navigation via route declaration.

Example:

```markup
import Link from 'umi/link';

export default () => {
  <div>
    /* Normal use */
    <Link to="/list">Go to list page</Link>

    /* With query string */
    <Link to="/list?a=b">Go to list page</Link>

    /* Include child component */
    <Link to="/list?a=b"><button>Go to list page</button></Link>
  </div>
}
```

### umi/router

Programmatic navigation via four router methods

#### router.push(path)

Add one entry to the browser's history.

Example:

```js
import router from 'umi/router';

// Normal navigation without query string
router.push('/list');

// With query string
router.push('/list?a=b');
router.push({
  pathname: '/list',
  query: {
    a: 'b',
  },
});
# Object without property `pathname` will throw an error
router.push({
  query: {}
});
```

#### router.replace(path)

Replace current page. Accept same parameter as [router.push()](<#router.push(path)>)

#### router.go(n)

Move back or forward through history.

Example:

```js
import router from 'umi/router';

router.go(-1);
router.go(2);
```

#### router.goBack()

Move backward.

Example:

```js
import router from 'umi/router';
router.goBack();
```

### umi/navlink

See: [https://reacttraining.com/react-router/web/api/NavLink](https://reacttraining.com/react-router/web/api/NavLink)

### umi/redirect

Redirection.

Example:

```js
import Redirect from 'umi/redirect';
<Redirect to="/login" />;
```

See: [https://reacttraining.com/react-router/web/api/Redirect](https://reacttraining.com/react-router/web/api/Redirect)

### umi/prompt

Example.

```js
import Prompt from 'umi/prompt';

export default () => {
  return (
    <>
      <h1>Prompt</h1>
      <Prompt
        when={true}
        message={location => {
          return window.confirm(`confirm to leave to ${location.pathname}?`);
        }}
      />
    </>
  );
};
```

See：[https://reacttraining.com/react-router/web/api/Prompt](https://reacttraining.com/react-router/web/api/Prompt)

### umi/withRouter

See: [https://reacttraining.com/react-router/web/api/withRouter](https://reacttraining.com/react-router/web/api/withRouter)

## Locale

### umi-plugin-locale

> You don't have to import `umi-plugin-locale` individually, it is included in `umi-plugin-react`.

#### setLocale(lang, realReload = true)

Specify the application language. While `realReload = false`, locale can be set without reload the whole application.

Example:

```js
import { setLocale } from 'umi-plugin-locale';

// Set the language to English after 10 seconds
setTimeout(() => {
  setLocale('en-US');
}, 10000);
```

#### getLocale()

Get the current using language

Example:

```js
import { getLocale } from 'umi-plugin-locale';

// print the current using language
console.log(getLocale());
```

#### Components from [react-intl](https://github.com/formatjs/react-intl/blob/master/docs/Components.md#components)

Components exposed via [react-intl](https://github.com/formatjs/react-intl/blob/master/docs/Components.md#components) can be used from `umi-plugin-locale` as well.

Example:

```js
import {
  FormattedDate,
  FormattedTime,
  FormattedRelative,
  FormattedNumber,
  FormattedPlural,
  FormattedMessage,
  FormattedHTMLMessage,
} from 'umi-plugin-locale';

export default () => {
  return <FormattedMessage id="TEST_TITLE" />;
};
```

#### Methods from [react-intl](https://github.com/formatjs/react-intl/blob/master/docs/API.md#api)

Methods exposed via [react-intl](https://github.com/formatjs/react-intl/blob/master/docs/API.md#api) can be used from `umi-plugin-locale` as well.

Example:

```js
import {
  formatDate,
  formatTime,
  formatRelative,
  formatNumber,
  formatPlural,
  formatMessage,
  formatHTMLMessage
} from 'umi-plugin-locale';


export default () => {
  return <p>{formatMessage({ id="TEST_TITLE" })}</p>;
}
```

## Performance

### umi/dynamic

Dynamically loading components based on [react-loadable](https://github.com/jamiebuilds/react-loadable).

#### dynamic(options)

Example:

```js
import dynamic from 'umi/dynamic';

// Render component with 1s delay
const App = dynamic({
  loader: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(() => <div>I will render after 1s</div>);
      }, /* 1s */1000);
    }));
  },
});

// Or use `async function`
const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));
const App = dynamic({
  loader: async function() {
    await delay(/* 1s */1000);
    return () => <div>I will render after 1s</div>;
  },
});
```

## Build

### umi/babel

Make umi's babel configuration extensible.
