---
sidebarDepth: 3
---

# @umijs/plugin-prerender

预渲染插件

## 安装

```bash
$ yarn add @umijs/plugin-prerender --dev
```

## 使用

在 `.umirc.js` 里配置：

```js
export default {
  ssr: true,
  plugins: [['@umijs/plugin-prerender']],
};
```

## 配置项

所有功能默认关闭，有真值配置才会开启。

### exclude

- 类型：`string[]`

排除不需要预渲染的页面. 例如：`[ '/user', '/about', '/news/:id' ]`

### runInMockContext (TODO)

- 类型：`Boolean`

在服务端环境模拟 `window` 变量

::: warning 项目代码最好兼容下服务端渲染，在服务端渲染的生命周期中，需要加上 `typeof bar !== undefined` 判断，其中 `bar` 是浏览器端变量或方法。 :::

### visible（TODO）

- 类型：`Boolean`

预渲染出来的 html 片段是否可见，主要用于避免动态数据下的页面闪烁。
