---
sidebarDepth: 3
---

# @umijs/plugin-prerender

This is a Pre-Rendering plugin.

## Install

```bash
$ yarn add @umijs/plugin-prerender --dev
```

## Usage

Configured in `.umirc.js`:

```js
export default {
  ssr: true,
  plugins: [['@umijs/plugin-prerender']],
};
```

## Configuration items

All features are turned off by default and will be enabled if there is a true value.

### exclude

- Type: `string[]`

exclude routes that aren't prerendered. e.g. `[ '/user', '/about', '/news/:id' ]`

### runInMockContext (TODO)

- Type: `Boolean`

mock `window` browser variable environment in Node Server.

::: warning Project code is best compatible with Server-Side rendering, add `typeof bar !== 'undefined'` judgment when using in the Server-side render lifecycle where `bar` is a browser variable or method. :::

### visible（TODO）

- Type: `Boolean`

Whether the pre-rendered html is visible or not, avoiding page flicker under dynamic data. just use for page seo.
