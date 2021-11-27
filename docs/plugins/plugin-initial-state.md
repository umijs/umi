---
translateHelp: true
---

# @umijs/plugin-initial-state


Arrange for a place to produce and consume initialization data.

## Enabling method

Have `src/app.ts` And export `getInitialState` Method to enable.

## introduce

This plug-in cannot be used directly，Must match `@umijs/plugin-model` use together.

## Configuration

The current plugin has only one runtime configuration.

### Runtime configuration

#### getInitialState

* Type: `() => Prommise<any>`

The configuration is a async of function。Will be executed at the very beginning of the entire application, and the return value will be used as global shared data. Layout Plug-in 、Access Plugins and users can pass `useModel('@@initialState')` Get this data directly。

```typescript
// src/app.ts
export async function getInitialState() {
  const data = await fetchXXX();
  return data;
}
```

## API

### useModel

Cooperate [`useModel`](./plugin-model) Get initial value：

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

Running configuration，getInitialState The return value.

#### loading

* Type: `boolean`
* Default: `true`

getInitialState Are you in loading state，Before getting the initial state for the first time

，Rendering of other parts of the page will be blocked。loading Can be used to judge refresh Is in progress。

#### error

* Type: `Error`
* Default: `undefined`

When running configuration，getInitialState throw Error Time，Will store errors in error middle。

#### refresh

* Type: `() => void`

Re-run getInitialState method，And get new data。

#### setInitialState

* Type: `(state: any) => void`

manual setting initialState Value of，After manual setting, loading Set to false.

`initialState` From `@umijs/plugin-initial-state` Get in the plugin，Need to be used together。

Usually the plugin will configure `@umijs/plugin-layout` with `@umijs/plugin-access`Use with plugins, and Layout The data returned when the plug-in is used together must conform to Layout Requirements。
