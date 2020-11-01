---
translateHelp: true
---

# @umijs/plugin-initial-state


Arrange for a place to produce and consume initialization data.

## How to enable

It is enabled when there is `src/app.ts` and the `getInitialState` method is exported.

## Introduction

This plugin cannot be used directly, it must be used with `@umijs/plugin-model`.

## Configuration

The current plugin has only one runtime configuration.

### Runtime configuration

#### getInitialState

* Type: `() => Prommise<any>`

The configuration is an async function. It will be executed at the very beginning of the entire application, and the return value will be used as global shared data. Layout plug-in, Access plug-in and users can directly obtain this data through ʻuseModel('@@initialState')`.

```typescript
// src/app.ts
export async function getInitialState() {
  const data = await fetchXXX();
  return data;
}
```

## API

### useModel

Use [ʻuseModel`](./plugin-model) to get the initial value:

```js
import { useModel } from 'umi';

export default () => {
  const { initialState, loading, error, refresh, setInitialState } = useModel('@@initialState');
  return <>{initialState}</>
};
```

#### initialState

* Type: `any`
* Default: `undefined`

The return value of getInitialState in the runtime configuration.

#### loading

* Type: `boolean`
* Default: `true`

Whether getInitialState is in the loading state, the rendering of other parts of the page will be blocked before the initial state is obtained for the first time. loading can be used to determine whether refresh is in progress.

#### error

* Type: `Error`
* Default: `undefined`

When getInitialState throw Error in runtime configuration, the error will be stored in error.

#### refresh

* Type: `() => void`

Re-execute the getInitialState method and get new data.

#### setInitialState

* Type: `(state: any) => void`

Manually set the value of initialState, after manual setting, loading will be set to false.

ʻInitialState` is obtained from the `@umijs/plugin-initial-state` plugin and needs to be used together.

Usually the plug-in will be configured to use `@umijs/plugin-layout` and `@umijs/plugin-access` together with the plug-in. When used with the Layout plug-in, the returned data must meet the Layout requirements.
