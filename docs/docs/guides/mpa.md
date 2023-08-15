# MPA Mode

Umi supports the traditional MPA (Multi-Page Application) mode. In this mode, Umi treats the `*/index.[jt]sx?` files under the `src/pages` directory as individual webpack entries for building. There are no routes, no history, and no umi.js in this mode, making it suitable for scenarios like developing H5 projects or creating kitchen plugins.

Note: This MPA mode in Umi 4 is different from the MPA mode in Umi 3. Umi 4's MPA is a true MPA, whereas Umi 3's MPA mock-routes rendering mechanism. Each has its own advantages and disadvantages. Umi 4's MPA sacrifices some plugin capabilities and is mainly suitable for build tool usage.

## Usage

MPA is an built-in feature that can be enabled through configuration.

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

The MPA directory structure is `src/pages/${dir}/index.tsx`, where each `${dir}` directory will generate a separate page. The `index.tsx` file inside each directory is the entry file for that page. See [examples/mpa](https://github.com/umijs/umi/tree/master/examples/mpa) for an example.

Configuration options:

- `template`: The HTML template for the output. For example, `template/index.html` will start searching from the root directory and use the corresponding `index.html` as the output HTML template.
- `getConfigFromEntryFile`: Read page-specific configuration from each page's entry file (`src/*/index.tsx`).
- `layout`: The default global layout.
- `entry`: Configuration for each entry file. For example, `{ foo: { title: '...' } }` configures the `title` property for the `src/foo/index.tsx` page.

## Conventional Entry Files

The default entry files are the `*/index.[jt]sx?` files under the `src/pages` directory.

For example:

```
+ src/pages
  - foo/index.tsx
  - bar/index.tsx
  - hoo.tsx
```

The `entry` structure would be:

```ts
{
  foo: 'src/pages/foo/index.tsx',
  bar: 'src/pages/bar/index.tsx'
}
```

After building, an HTML file will be generated for each entry file, resulting in `foo.html` and `bar.html`.

### Page-Level Configuration

### config.json

You can declare configurations by placing a `config.json` file at the same level as the entry file. For example:

```
+ src/pages
  + foo
    - index.tsx
    - config.json
```

In this case, `foo/config.json` configures the page's individual `layout` and `title`:

```json
{
  "layout": "@/layouts/bar.ts",
  "title": "foooooo"
}
```

The currently supported configuration options include:

- **template**: The template path, following the [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) syntax and using lodash template syntax to include variables.
- **layout**: The page layout, recommended to use `@/` to reference files under the `src` directory.
- **title**: The page title, defaults to the directory name where the entry file is located.
- **mountElementId**: The ID of the element where the page will be mounted when rendering, defaults to `root`.

### getConfigFromEntryFile

Umi also experimentally supports an alternative configuration method. You can use `export const config` in the entry file to export the page's configuration. For example:

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

### On-Demand Startup

You can speed up the build process by specifying the pages to be started using the `env.MPA_FILTER` environment variable.

```text
# file .env
# Only start the bar and foo pages
MPA_FILTER=bar,foo
```

## Rendering

The default rendering method is React. You only need to export a React component from the entry file for rendering. There's no need to write the `ReactDOM.render` logic manually.

```tsx
export default function Page() {
  return <div>Hello</div>
}
```

React 18 is enabled by default. If you need the rendering method of React 17, you can install the dependencies for React 17 in your project. The framework will automatically adapt to the React version.

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

You can use the `template` configuration to customize the global HTML template. You can also define different templates for different pages using page-level configuration. Make sure the template variables include at least `<%= title %>` and `<%= mountElementId %>`.
