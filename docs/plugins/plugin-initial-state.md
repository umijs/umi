# @umijs/plugin-initial-state


Contract a local production and consumption initialization data.

## How to enable

There is `src/app.ts` and enabled when exporting the `getInitialState` method.

## Introduction

This plugin cannot be used directly. It must be used with `@umijs/plugin-model`.

## Configuration

The current plugin has only one runtime configuration.

### Runtime configuration

#### getInitialState

* Type: `() => Prommise<any>`

The configuration is a function of async. It will be executed at the beginning of the entire application, and the returned value will be used as globally shared data. Layout plug-in, Access plug-in and users can get this data directly through `useModel('@@initialState')`.

```typescript
// src/app.ts
export async function getInitialState() {
  const data = await fetchXXX();
  return data;
}
```

## API

### useModel

Get the initial value with [`useModel`](./plugin-model):

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

The return value of `getInitialState` in runtime configuration.

#### loading

* Type: `boolean`
* Default: `true`

Whether `getInitialState` is in the loading state, rendering of other parts of the page will be blocked until the initial state is obtained for the first time. `loading` can be used to determine if refresh is in progress.

#### error

* Type: `Error`
* Default: `undefined`

When the runtime configuration, `getInitialState` throws an Error, the error is stored in `error`.

#### refresh

* Type: `() => void`

Re-execute the getInitialState method and get new data.

#### setInitialState

* Type: `(state: any) => void`

Set the initialState value manually. Setting it manually will set loading to false.

`initialState` is obtained from the `@umijs/plugin-initial-state` plugin and needs to be used together.

Usually the plugin will configure `@umijs/plugin-layout` and `@umijs/plugin-access` plugins to be used together. The data returned when used with the Layout plugin must meet the requirements of the Layout.
