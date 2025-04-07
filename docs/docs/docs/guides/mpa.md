---
order: 18
toc: content
---
# MPA 模式

Umi 支持传统 MPA 模式，此模式下，会将 `src/pages` 目录下 `*/index.[jt]sx?` 文件作为 webpack entry 进行打包，无路由，无 history，无 umi.js，满足比如 h5 研发、kitchen 插件研发等场景需要。

注意：此 MPA 模式和 Umi 3 的 MPA 模式的实现不同，Umi 4 是真 MPA，Umi 3 是 Mock 了路由渲染机制。各有利弊，Umi 4 的 MPA 将不能使用大量插件能力，仅适合当构建工具使用。

## 使用

mpa 为内置功能，通过配置即可开启。

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

MPA 的目录结构是 `src/pages/${dir}/index.tsx` ，每个文件夹 `${dir}` 会生成一个页面，文件夹内的 `index.tsx` 为页面的入口文件，示例见 [examples/mpa](https://github.com/umijs/umi/tree/master/examples/mpa) 。

配置项：

 - `template` : 产物 HTML 模板，如 `template/index.html` 将使用项目根目录开始寻找，对应路径的 `index.html` 作为产物 HTML 模板。 
 - `getConfigFromEntryFile` : 从每个页面的入口文件（`src/*/index.tsx`）中读取页面独立配置。
 - `layout` : 全局默认 layout 。
 - `entry` : 每个入口文件的配置，如 `{ foo: { title: '...' } }` 可以配置 `src/foo/index.tsx` 页面的 `title` 属性。

## 约定的入口文件

默认的入口文件是 `src/pages` 目录下的 `*/index.[jt]sx?` 文件。

比如：

```
+ src/pages
  - foo/index.tsx
  - bar/index.tsx
  - hoo.tsx
```

那么，`entry` 结构为：

```ts
{
  foo: 'src/pages/foo/index.tsx',
  bar: 'src/pages/bar/index.tsx'
}
```

构建之后，会同时为每个入口文件生成相应的 HTML 文件，此时产物为 `foo.html` 和 `bar.html` 。

### 页面级配置

### config.json

约定通过入口文件同层级的 `config.json` 声明配置，比如如下目录结构：

```
+ src/pages
  + foo
    - index.tsx
    - config.json
```

`foo/config.json` 配置了该页面的独立 `layout` 布局和 `title` 标题：

```json
{
  "layout": "@/layouts/bar.ts",
  "title": "foooooo"
}
```

目前默认支持的配置项包括：

* **template**：模板路径，可参考 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) 的模板写法，通过 lodash template 语法使用变量。
* **layout**：页面布局，建议以 `@/` 开头引用 src 目录下的文件。
* **title**：页面标题，默认是入口文件所在的目录名。
* **mountElementId**：页面渲染时，挂载到节点的 id，默认是 `root` 。

### getConfigFromEntryFile

Umi 还试验性地支持另一种配置读取方式，通过配置 `mpa: { getConfigFromEntryFile: true }` 开启。

此时，你可以不使用 `config.json` ，而是在入口文件中通过 `export const config` 导出该页面的配置。

比如：

```ts
// src/pages/foo/index.tsx
export const config = {
  layout: '@/layouts/bar.ts',
  title: 'foooooo',
}
```

### entry

在 `.umirc.ts` 中也可以配置每个页面：

```ts
  mpa: {
    entry: {
      foo: { title: 'foo title' }
    }
  }
```

### 按需启动

支持通过设置 `env.MPA_FILTER` 来指定需要启动的页面，以提高构建速度：

```text
# file .env
# 只会启动 bar、foo 这两个页面
MPA_FILTER=bar,foo
```

## 渲染

默认渲染方式为 react，入口文件只需导出 react 组件，即可进行渲染，无需自行写 `ReactDOM.render` 逻辑。

```tsx
export default function Page() {
  return <div>Hello</div>
}
```

默认启用 React 18，如果需要 React 17 的渲染方式，请在项目中安装 React 17 的依赖，框架会自动适配 React 版本。

```bash
$ pnpm i react@17 react-dom@17
```

## 模板

默认模板如下：

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

通过 `template` 配置自定义全局 HTML 模板 ，也可以进行页面级配置定义不同页面使用不同的模板，请确保变量至少包含 `<%= title %>` 和 `<%= mountElementId %>`。
