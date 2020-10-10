---
translateHelp: true
---

# @umijs/plugin-initial-state


约定一个地方生产和消费初始化数据。

## 启用方式

有 `src/app.ts` 并且导出 `getInitialState` 方法时启用。

## 介绍

本插件不可直接使用，必须搭配 `@umijs/plugin-model` 一起使用。

## 配置

当前插件只有一个运行时配置。

### 运行时配置

#### getInitialState

* Type: `() => Prommise<any>`

该配置是一个 async 的 function。会在整个应用最开始执行，返回值会作为全局共享的数据。Layout 插件、Access 插件以及用户都可以通过 `useModel('@@initialState')` 直接获取到这份数据。

```typescript
// src/app.ts
export async function getInitialState() {
  const data = await fetchXXX();
  return data;
}
```

## API

### useModel

配合 [`useModel`](./plugin-model) 获取初始值：

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

运行时配置中，getInitialState 的返回值。

#### loading

* Type: `boolean`
* Default: `true`

getInitialState 是否处于 loading 状态，在首次获取到初始状态前，页面其他部分的渲染都会被阻止。loading 可用于判断 refresh 是否在进行中。

#### error

* Type: `Error`
* Default: `undefined`

当运行时配置中，getInitialState throw Error 时，会将错误储存在 error 中。

#### refresh

* Type: `() => void`

重新执行 getInitialState 方法，并获取新数据。

#### setInitialState

* Type: `(state: any) => void`

手动设置 initialState 的值，手动设置完毕会将 loading 置为 false.

`initialState` 从 `@umijs/plugin-initial-state` 插件中获取，需要搭配一起使用。

通常该插件会配置 `@umijs/plugin-layout` 和 `@umijs/plugin-access` 插件一起使用，和 Layout 插件一起使用的时候返回的数据要符合 Layout 的要求。
