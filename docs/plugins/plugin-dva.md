---
translateHelp: true
---

# @umijs/plugin-dva


Integrate dva data flow.

## How to enable

The configuration is turned on.

## Introduction

Contains the following functions,

* **Built-in dva**, the default version is `^2.6.0-beta.20`, if there are dependencies in the project, the dependent version in the project will be used first.
* **The convention is to organize the model **, no need to manually register the model
* **File name is namespace**, if no namespace is declared in the model, the file name will be used as the namespace
* **Built-in dva-loading**, you can directly connect the `loading` field to use
* **Support immer**, enabled by configuring ʻimmer`

### Conventional model organization

Files that meet the following rules will be considered model files.

* Files under `src/models`
* Under `src/pages`, the files in the models directory in the subdirectory
* Under `src/pages`, all model.ts files

such as:

```bash
+ src
  + models/a.ts
  + pages
    + foo/models/b.ts
    + bar/model.ts
```

Among them, ʻa.ts`, `b.ts` and `model.ts` will be regarded as model files if their contents are valid dva model.

### dva model verification

By default, the files found in the previous section will be verified once, and will be added to the final dva model list after the verification is passed.

Some examples,

```typescript
// pass
export default {namespace:'foo' };
export default {reducers:'foo' };

// pass
const model = {namespace:'foo' };
export default model;

// Pass, support dva-model-extend
import dvaModelExtend from 'dva-model-extend';
export default dvaModelExtend(baseModel, {
  namespace: 'foo',
});

// pass
export default <Model>{ namespace:'foo' };

// Fail
export default {foo:'bar' };
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

Whether to skip model verification.

### extraModels

* Type: `string[]`
* Default: `[]`

Configure additional to dva model.

### immer

* Type: `boolean`
* Default: `false`

Indicates whether to enable immer to facilitate modification of reducer.

### hmr

* Type: `boolean`
* Default: `false`

Indicates whether to enable hot update of dva model.

## dva runtime configuration

Configure the parameters when dva is created through the `src/app.tsx` file.

such as:

```ts
import { createLogger } from 'redux-logger';
import { message } from 'antd';

export const dva = {
  config: {
    onAction: createLogger(),
    onError(e: Error) {
      message.error(e.message, 3);
    },
  },
};
```

## umi interface

Common methods can be directly imported from umi.

such as:

```js
import { connect } from 'umi';
```

The interface contains,

### connect

Bind data to the component.

### getDvaApp

Get the dva instance, which is the previous `window.g_app`.

### useDispatch

Obtain dispatch by hooks, valid when dva is 2.6.x.

### useSelector

Part of the data is obtained by hooks, valid when dva is 2.6.x.

### useStore

The store is obtained by hooks, and it is valid when dva is 2.6.x.

## Command

### umi dva list model

Check which models are included in the project.

```bash
$ umi dva list model
```

## Types of

Export types via umi: `ConnectRC`, `ConnectProps`, `Dispatch`, ʻAction`, `Reducer`, ʻImmerReducer`, ʻEffect`, `Subscription`, and all exported types in `model` files.

### model use cases

```ts
import { Effect, ImmerReducer, Reducer, Subscription } from 'umi';

export interface IndexModelState {
  name: string;
}

export interface IndexModelType {
  namespace: 'index';
  state: IndexModelState;
  effects: {
    query: Effect;
  };
  reducers: {
    save: Reducer<IndexModelState>;
    // After enabling immer
    // save: ImmerReducer<IndexModelState>;
  };
  subscriptions: { setup: Subscription };
}

const IndexModel: IndexModelType = {
  namespace: 'index',

  state: {
    name: '',
  },

  effects: {
    *query({ payload }, { call, put }) {
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    // After enabling immer
    // save(state, action) {
    //   state.name = action.payload;
    // },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/') {
          dispatch({
            type: 'query',
          })
        }
      });
    }
  }
};

export default IndexModel;
```

### page use case

```tsx
import React, { FC } from 'react';
import { IndexModelState, ConnectProps, Loading, connect } from 'umi';

interface PageProps extends ConnectProps {
  index: IndexModelState;
  loading: boolean;
}

const IndexPage: FC<PageProps> = ({ index, dispatch }) => {
  const { name } = index;
  return <div >Hello {name}</div>;
};

export default connect(({ index, loading }: { index: IndexModelState; loading: Loading }) => ({
  index,
  loading: loading.models.index,
}))(IndexPage);

```

or

```tsx
import React from 'react';
import { IndexModelState, ConnectRC, Loading, connect } from 'umi';

interface PageProps {
  index: IndexModelState;
  loading: boolean;
}

const IndexPage: ConnectRC<PageProps> = ({ index, dispatch }) => {
  const { name } = index;
  return <div >Hello {name}</div>;
};

export default connect(({ index, loading }: { index: IndexModelState; loading: Loading }) => ({
  index,
  loading: loading.models.index,
}))(IndexPage);
```

## FAQ

### import {connect etc API} from umi invalid?

an examination:

1. Is the dva configuration enabled? The plug-in is enabled by the configuration
2. If there is a valid dva model, you can check the model registration by executing ʻumi dva list model`, or after executing ʻumi g tmp`, check the model registration in `src/.umi/plugin-dva/dva.ts`

As well as the definition of tsconfig.json, please refer to [FAQ#import from umi, what if there is no definition? ](../docs/faq#import-from-umi-what if there is no definition?)

### My model is written very dynamic and cannot be recognized, what should I do?

Configure `dva: {skipModelValidate: true }` to turn off dva's model validation.
