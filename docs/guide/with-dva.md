# Use umi with dva

As of `>= umi@2`, we recommend using [umi-plugin-react](https://github.com/umijs/umi/tree/master/packages/umi-plugin-react) for `dva` integration.

## Features

* **Model loading by directory**, getting rid of `app.model`
* **File name as namespace**, `namespace` as model key will be exported by `umi`
* **No manually defined router.js**, `umi` will take over the router stuff, and both `model`s and `component`s can be loaded on demand
* **Built-in query-string handler**, manually encoding and decoding URL are not required any more
* **Built-in dva-loading and dva-immer support**, of which `dva-immer` can be enabled via configuration
* **Out of box**, dependencies such as: `dva`, `dva-loading`, `dva-immer`, `path-to-regexp`, `object-assign`, `react`, `react-dom` are built in, so that you don't have to worry about them

## Usage

Install via `yarn`,

```bash
$ yarn add umi-plugin-react
```

Install via `npm`, using the command `npm install --save umi-plugin-react`.

Add configuration in `.umirc.js`:

```js
export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        dva: true,
      },.
    ]
  ],
};
```

Enable `dva-immer` for elegant reducer writing experience

```js
export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        dva: {
          immer: true
        }
      }
    ],
  ],
};
```

## Registering models

There are two types of models: the globally registered (global) model, and the page-level model.

The global model should be defined in `/src/models/`, and can be referenced in all other pages.

The page-level model should not be used in any other page.


Model loading rules:

* `src/models/**/*.js` are defined as global models
* `src/pages/**/models/**/*.js` are defined as page-level models
* global models will be loaded along with the application; page-level models are loaded on demand while in `production` build (both will always be loaded in `development` build)
* page-level models can be `.js` files in `models/**/*.js` pattern
* page-level models can be scanned upward to app structure, For example: if you have page `.js` like `pages/a/b.js`, its page-level model shall be `pages/a/b/models/**/*.js` + `pages/a/models/**/*.js`...
* if `model.js` is defined, the page should be a single-file-model, which means you don't have to create `models` directory if you have only one model. So if you have `model.js` defined, all `.js` files defined in `models/**/*.js` will be ignored

Example:

```
+ src
  + models
    - g.js
  + pages
    + a
      + models
        - a.js
        - b.js
        + ss
          - s.js
      - page.js
    + c
      - model.js
      + d
        + models
          - d.js
        - page.js
      - page.js
```

With the above file structure:

* the global model is `src/models/g.js`
* the page-level models for `/a` is `src/pages/a/models/{a,b,ss/s}.js`
* the page-level model for `/c` is `src/pages/c/model.js`
* the page-level models for `/c/d` are `src/pages/c/model.js, src/pages/c/d/models/d.js`

## Configuration and plugins

> The previous configuration in `src/dva.js` has been deprecated, and will remove support in next major release.

Create a new `app.js` in the `src` directory with the following contents:

```js
export const dva = {
  config: {
    onError(e) {
      e.preventDefault();
      console.error(e.message);
    },
  },
  plugins: [
    require('dva-logger')(),
  ],
};
```

## FAQ

### Page component is not re-rendered whenever url changed?

If you have `connect` data in `layouts/index.js`, `umi/withRouter` is required

```js
import withRouter from 'umi/withRouter';

export default withRouter(connect(mapStateToProps)(LayoutComponent));
```

### How to access `store` or `dispatch`?

```js
window.g_app._store
window.g_app._store.dispatch
```

### How to disable load on demand for `component` and `models`?

Add config to `.umirc.js`:

```js
export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        dva: {
          dynamicImport: undefined // config in dva
        },
        dynamicImport: undefined   // root config will be inherited as well
      }
    ],
  ],
};
```

### Page component is not re-rendered whenever url is changed while `connect` data in `layout`

Check the order of `connect`, `withRouter` usage

```js
import withRouter from 'umi/withRouter';
export default withRouter(connect()(Layout));
```

## References

* [Improve dva project with umi](https://github.com/sorrycc/blog/issues/66)
* [umi + dva, write your own user-management CURD app](https://github.com/sorrycc/blog/issues/62)
