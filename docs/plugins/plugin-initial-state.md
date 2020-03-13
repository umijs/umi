---
translateHelp: true
---

# @umijs/plugin-initial-state


Contract a local production and consumption initialization data.

## How to enable

There is `src/app.ts` and enabled when exporting the` getInitialState` method.

## Introduction

This plugin cannot be used directly. It must be used with `@umijs/plugin-model`.

## Configuration

The current plugin has only one runtime configuration.

### Runtime configuration

#### getInitialState

* Type: `() => Prommise<any>`

The configuration is a function of async. It will be executed at the beginning of the entire application, and the returned value will be used as globally shared data. Layout plug-in, Access plug-in and users can get this data directly through `useModel ('@@ initialState')`.

```typescript
// src/app.ts
export async function getInitialState() {
  const data = await fetchXXX();
  return data;
}
```

Usually the plugin will configure `@umijs/plugin-layout` and `@umijs/plugin-access` plugin to be used together, and the data returned when used with the Layout plugin should meet the requirements of Layout.
