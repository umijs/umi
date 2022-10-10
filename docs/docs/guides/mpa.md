# MPA 模式

Umi 支持传统 MPA 模式，此模式下，会将 `src/pages` 目录下 `*/index.[jt]sx?` 文件作为 webpack entry 进行打包，无路由，无 history，无 umi.js，满足比如 h5 研发、kitchen 插件研发等场景需要。

注意：此 MPA 模式和 Umi 3 的 MPA 模式的实现不同，Umi 4 是真 MPA，Umi 3 是 Mock 了路由渲染机制。各有利弊，Umi 4 的 MPA 将不能使用大量插件能力，仅适合当构建工具使用。

## 使用

mpa 为内置功能，通过配置即可开启。

```js
export default {
  mpa: {
    template: string,
    configFromEntryFile: Boolean,
    layout: string,
    entry: {},
  },
}
```

配置项中。`template` 表示默认模板；`configFromEntryFile` 表示从入口文件中读取页面配置，详见下方介绍；`layout` 表示全局 layout，允许在每个入口文件的配置中对此进行覆盖；`entry` 可以全局配置入口文件的属性。

## 约定的入口文件

默认的入口文件是 `src/pages` 目录下 `*/index.[jt]sx?` 文件。

比如：

```
+ src/pages
  - foo/index.tsx
  - bar/index.tsx
  - hoo.tsx
```

那么，入口 entry 为 `["foo/index.tsx", "bar/index.tsx"]`。

构建之后，会同时为每个入口文件生成相应的 HTML 文件。

## 入口文件配置

约定通过入口文件同层级的 `config.json` 声明配置。

比如 `foo/config.json` 中，

```json
{
  "layout": "@/layouts/bar.ts",
	"title": "foooooo"
}
```

目前支持的配置项包括，

* **template**，模板路径，可参考 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) 的相关配置
* **layout**，页面布局，建议以 `@/` 开头引用 src 目录下的文件
* **title**，页面标题，默认是 entry 所在的目录名
* **mountElementId**，页面渲染 id，默认是 `root`

### configFromEntryFile

Umi 还试验性地支持另一种配置读取方式，通过配置 `mpa: { configFromEntryFile: true }` 开启。

此时，会约定入口文件中通过 `export const config` 进行配置。

比如 `foo/index.tsx` 中，

```ts
export const config = {
  layout: '@/layouts/bar.ts',
	title: 'foooooo',
}
```

## 渲染

默认渲染方式为 react，入口文件只需导出 react 组件，即可进行渲染，无需自行写 ReactDOM.render 逻辑。

```js
export default () => <div>Hello</div>;
```

默认启用 React 18，如果需要 React 17 的渲染方式，请在项目中安装 react 17 的依赖，框架会自动适配 react 版本。

```bash
$ pnpm i react@17 react-dom@17
```

## 模板

默认模板如下，

```html
<!DOCTYPE html>
<html>
<head><title><%= title %></title></head>
<body>
<div id="<%= mountElementId %>"></div>
</body>
</html>
```

如果自定义模板，请确保包含 `<%= title %>` 和 `<%= mountElementId %>`。