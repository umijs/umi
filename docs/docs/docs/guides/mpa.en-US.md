---
order: 18
toc: content
translated_at: '2024-03-17T10:26:22.951Z'
---

# MPA Mode

Umi supports the traditional MPA mode, under which the `src/pages` directory `*/index.[jt]sx?` files are taken as webpack entries for packing, without routing, history, or umi.js, meeting needs such as H5 development, kitchen plugin development, and so on.

Note: This MPA mode is different from the MPA mode implementation in Umi 3, Umi 4 is true MPA, while Umi 3 mocks the routing rendering mechanism. Each has its pros and cons; Umi 4's MPA will not be able to use a large number of plugin capabilities and is only suitable for use as a build tool.

## Usage

mpa is an built-in feature, which can be enabled through configuration.

```js
export default {
  mpa: {
    template: string,
    getConfigFromEntryFile: boolean,
    layout: string,
    entry: object,
  },
}
```

The directory structure of MPA is `src/pages/${dir}/index.tsx`, each folder `${dir}` will generate a page, with the folder's `index.tsx` as the entry file of the page, see the example at [examples/mpa](https://github.com/umijs/umi/tree/master/examples/mpa).

Configuration items:

- `template`: Product HTML template, for example, `template/index.html` will start searching from the project root directory, using the corresponding path's `index.html` as the product HTML template.
- `getConfigFromEntryFile`: Read independent configuration from the entry file (`src/*/index.tsx`) of each page.
- `layout`: Global default layout.
- `entry`: Configuration for each entry file, for example, `{ foo: { title: '...' } }` can configure the `title` attribute of the `src/foo/index.tsx` page.

## Conventional Entry Files

The default entry files are `src/pages` directory's `*/index.[jt]sx?` files.

For example:

```
+ src/pages
  - foo/index.tsx
  - bar/index.tsx
  - hoo.tsx
```

Then, the `entry` structure will be:

```ts
{
  foo: 'src/pages/foo/index.tsx',
  bar: 'src/pages/bar/index.tsx'
}
```

After building, HTML files corresponding to each entry file will be generated, with the products being `foo.html` and `bar.html`.

### Page-level Configuration

### config.json

Conventionally declares configuration through `config.json` at the same layer as the entry file, as the following directory structure:

```
+ src/pages
  + foo
    - index.tsx
    - config.json
```

`foo/config.json` configures the independent `layout` and `title` of the page:

```json
{
  "layout": "@/layouts/bar.ts",
  "title": "foooooo"
}
```

Currently, the default supported configuration items include:

* **template**: Template path, can refer to the template writing method of [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin), using variables through lodash template syntax.
* **layout**: Page layout, advised to reference files in the src directory starting with `@/`.
* **title**: Page title, default is the directory name where the entry file is located.
* **mountElementId**: When rendering the page, the id of the node to be mounted to, default is `root`.

### getConfigFromEntryFile

Umi also experimentally supports another way of reading configurations by enabling `mpa: { getConfigFromEntryFile: true }`.

In this case, you can avoid using `config.json`, and instead, export the page's configuration through `export const config` in the entry file.

For example:

```ts
// src/pages/foo/index.tsx
export const config = {
  layout: '@/layouts/bar.ts',
  title: 'foooooo',
}
```

### entry

You can also configure each page in `.umirc.ts`:

```ts
  mpa: {
    entry: {
      foo: { title: 'foo title' }
    }
  }
```

### On-demand Startup

Supports using `env.MPA_FILTER` to specify pages to start, in order to improve build speed:

```text
# file .env
# Will only start bar, foo these two pages
MPA_FILTER=bar,foo
```

## Rendering

The default rendering method is React; the entry file just needs to export React components to be rendered, without needing to write the `ReactDOM.render` logic by yourself.

```tsx
export default function Page() {
  return <div>Hello</div>
}
```

React 18 is enabled by default, if you need React 17 rendering methods, please install React 17 dependencies in your project, the framework will automatically adapt to the React version.

```bash
$ pnpm i react@17 react-dom@17
```

## Template

The default template is as follows:

```html
<!DOCTYPE html>
<html>
  <head>
    <title><%= title %></title>
  </head>
  <body>
    <div id="<%= mountElementId %>"></div>
  </body>
</html>
```

Through the `template` configuration, you can customize a global HTML template or configure different templates for different pages at the page level. Please ensure that variables at least include `<%= title %>` and `<%= mountElementId %>`.
