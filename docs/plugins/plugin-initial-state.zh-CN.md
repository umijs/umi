
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

通常该插件会配置 `@umijs/plugin-layout` 和 `@umijs/plugin-access` 插件一起使用，和 Layout 插件一起使用的时候返回的数据要符合 Layout 的要求。
