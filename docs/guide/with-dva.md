# Use umi with dva

As of `>= umi@2`, we recommend using [umi-plugin-react](https://github.com/umijs/umi/tree/master/packages/umi-plugin-react) for `dva` integration.

## Features

* **Load model by directory**, get rid of `app.model`
* **File name as namespace**, `namespace` as model key will be exported by `umi`
* **No manually defined router.js**, `umi` take over the router stuff, both `model` and `component` can be load on demand
* **Buildin query-string handler**, manually encode and decode URL is not required any more
* **Buildin dva-loading and dva-immer**, `dva-immer` can be enabled via configuration
* **Out of box**, dependencies such as: `dva`, `dva-loading`, `dva-immer`, `path-to-regexp`, `object-assign`, `react`, `react-dom` are buildin, you don't have to worry about them

## Usage

Install via `yarn`,

```bash
$ yarn add umi-plugin-react
```

Install via `npm`, use `npm install --save umi-plugin-react`.

Add configuration in `.umirc.js`:

```js
export default {
  plugins: [
    [
      'umi-plugin-react',
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

## register model

There are two types of model: global registered model, and page-level model.

Global registered model shall be defined in `/src/models/`, can be referenced in all other pages.

Page-level model should be used in any other page.


Model load rules:

* `src/models/**/*.js` are defined as global model
* `src/pages/**/models/**/*.js` are defined as page-level model
* global model will be load along with the application; page-level models are load on demand while in `production` build(will always be loaded in `development` build)
* page-level model can be `.js` files in `models/**/*.js` pattern
* page-level model can be scanned upword to app structure, For example: if you have page `.js` like `pages/a/b.js`, her page-level model shall be `pages/a/b/models/**/*.js` + `pages/a/models/**/*.js`...
* if `model.js` is defined, the page should be a single-file-model, which means you don't have to create `modles` directory if you have only one model. So if you have `model.js` defined, all `.js` files defined in `models/**/*.js` will be ignored

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

With above file structure:

* global model is `src/models/g.js`
* page-level model for `/a` is `src/pages/a/models/{a,b,ss/s}.js`
* page-level model for `/c` is `src/pages/c/model.js`
* page-level model for `/c/d` is `src/pages/c/model.js, src/pages/c/d/models/d.js`

## FAQ

### How to config dva hooks such as: onError, initialState?

create `src/dva.js`, export `config` method for hook usage, for example:

```js
import { message } from 'antd';

export function config() {
  return {
    onError(err) {
      err.preventDefault();
      message.error(err.message);
    },
    initialState: {
      global: {
        text: 'hi umi + dva',
      },
    },
  };
}
```

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
