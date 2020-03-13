---
translateHelp: true
---

# @umijs/plugin-dva


Integrate dva data streams.

## How to enable

Configuration is on.

## Introduction

Contains the following features,

* **Built-in dva**, The default version is `^ 2.6.0-beta.20`, if there are dependencies in the project, the dependent version in the project will be used first.
* **The convention is to organize the model**, Without having to register the model manually
* **File name is namespace**, If the namespace is not declared in the model, the filename will be used as the namespace
* **Built-in dva-loading**, Directly connect `loading` field can be used
* **Support immer**, Enabled by configuring `immer`

### Conventional model organization

A file that meets the following rules will be considered a model file,

* Files under `src/models`
* Files in a `models` subdirectory under `src/pages`
* All `*.model.ts` files under `src/pages`

such as:

```bash
+ src
  + models/a.ts
  + pages
    + foo/models/b.ts
    + bar/model.ts
```

Among them, `a.ts`,` b.ts` and `model.ts` will be considered as model files if their contents are valid dva model notation.

### dva model validation

By default, the files found in the previous section will be validated once. After the validation is passed, they will be added to the dva model list.

Some examples,

```typescript
// by
export default { namespace: 'foo' };
export default { reducers: 'foo' };

// by
const model = { namespace: 'foo' };
export default model;

// Supported by dva-model-extend
import dvaModelExtend from 'dva-model-extend';
export default dvaModelExtend(baseModel, {
  namespace: 'foo',
});

// by
export default <Model>{ namespace: 'foo' };

// Fail
export default { foo: 'bar' };
```

## Configuration

such as:

```js
export default {
  dva: {
    immer: true,
    hmr: false,
  },
}
```

### skipModelValidate

* Type: `boolean`
* Default: `false`

Whether to skip model validation.

### extraModels

* Type: `string[]`
* Default: `[]`

Configure extra to dva model.

### immer

* Type: `boolean`
* Default: `false`

Indicates whether immer is enabled for easy modification of the reducer.

### hmr

* Type: `boolean`
* Default: `false`

Indicates whether hot update of the dva model is enabled.

## umi entrance

Common methods can be imported directly from umi.

such as:

```js
import { connect } from 'umi';
```

The interface contains,

### connect

Binding data to components.

### getDvaApp

Get the dva instance, which is the previous `window.g_app`.

### useDispatch

Hooks get dispatch, which works when dva is 2.6.x.

### useSelector

Hooks to get some data, effective when dva is 2.6.x.

### useStore

Hooks are used to get the store. It is effective when dva is 2.6.x.

## command

### umi dva list model

See which models are included in the project.

```bash
$ umi dva list model
```

## FAQ

### import { connect and other APIs } from umi is undefined?

an examination:

1. Whether dva configuration is enabled, the plugin is enabled by configuration
2. Is there a valid dva model? You can check the registration of the model by executing `umi dva list model`, or checking` src/.umi/plugin-dva/dva.ts` after executing `umi g tmp`. 

And definition issues such as tsconfig.json, refer to [FAQ # import from umi is not defined?](../docs/faq#import-from-umi-No-definition-what-to-do?)

### What if my model is written dynamically and cannot be identified?

Configure `dva: {skipModelValidate: true}` to turn off dva's model validation.
