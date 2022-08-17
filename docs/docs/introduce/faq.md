# FAQ

## 可以关闭 dynamicImport 吗？

可以，但不建议关闭。

1、安装依赖

```bash
  pnpm i babel-plugin-dynamic-import-node -D
```

2、配置里加上 `extraBabelPlugins` ，但只针对 production 开启

```ts
// .umirc.ts
export default {
  extraBabelPlugins: process.env.NODE_ENV === 'production' 
    ? ['babel-plugin-dynamic-import-node'] 
    : []
}
```
## 没有 dynamicImport 怎么配置它的 loading ？

定义 `src/loading.tsx` :

参考 [目录结构 > loading.tsx](../guides/directory-structure#loadingtsxjsx)

## 可以用 react 17 吗？

由于 umi v4 升级了默认的 react 版本到 v18，使用 umi4 时注意下依赖库和 react 18 的兼容情况，如果还需要使用 react 17，请执行以下命令并重启。

```bash
  pnpm add react@^17 react-dom@^17
```

## 代理静态资源到本地后，一直 restart 刷新页面

<img src={require('./img/rstart.png')} />

解法：配置 `SOCKET_SERVER=127.0.0.1:${port}` 启动项目

```bash
  SOCKET_SERVER=http://127.0.0.1:8000 pnpm dev
```

## Error evaluating function `round`: argument must be a number

<img src={require('./img/less-error.png')} />

解法：新版 less 中 `/` 默认被识别为属性简写，通过配置 `lessLoader: { math: 'always' }` 恢复旧版行为（默认将 `/` 用作计算符号）。

## routes 里的 layout 配置选项不生效

layout 配置被移动到了 `app.ts` ，详见 [runtime-config > layout](https://umijs.org/docs/api/runtime-config#layout)


## document.ejs 去哪了，如何自定义 HTML 模板

除了可以通过 配置项 注入外部 [script](https://umijs.org/docs/api/config#scripts) 、[css](https://umijs.org/docs/api/config#styles) 外，还可以使用项目级插件更灵活的修改 HTML 产物，参见：[issuecomment-1151088426](https://github.com/umijs/umi-next/issues/868#issuecomment-1151088426)

## scripts 里配置的外部 js 文件为什么默认插入到 umi.js 的后面

react 只有在页面加载完毕后才会开始运行，所以插到 `umi.js` 后面不会影响项目。

若需要插到 `umi.js` 前面，可参见 [issuecomment-1176960539](https://github.com/umijs/umi/issues/8442#issuecomment-1176960539)

## umi4 我怎么分包

umi4 默认按页拆包，默认情况无需手动分包，如果你觉得还需要优化，可以手动拆的更细，详见：[discussions/8513](https://github.com/umijs/umi/discussions/8513)

如果你有将所有 js 产物打包成单 `umi.js` 文件的需求，请使用 `cacheGroups` 。

## _layout.tsx 去哪了，我怎么嵌套路由

umi4 使用 react-router v6 ，通过 `<Outlet />` 展示嵌套路由内容，可参见：[issuecomment-1206194329](https://github.com/umijs/umi/issues/8850#issuecomment-1206194329)

## 怎么用 GraphQL

配置 `graph-ql` loader 的方式可参见： [discussions/8218](https://github.com/umijs/umi/discussions/8218)

## 怎么用 WebAssembly

借助 webpack5 的原生 wasm 加载特性，需要针对 wasm 配置，一个实例可参见：[discussions/8541](https://github.com/umijs/umi/discussions/8541)

## 怎么自定义 loader

根据场景不同，你可能要先从 静态资源规则 中排除你需要加载的文件类型，再添加你自己的 loader / 或修改，可参考：

 - [discussions/8218](https://github.com/umijs/umi/discussions/8218)

 - [discussions/8452](https://github.com/umijs/umi/discussions/8452)

## 第三方包里如何使用 css modules

1. 直接将第三方包的 `jsx` / `ts` / `tsx` 源码发布到 npm ，无需转译为 `js` ，umi4 支持直接使用。

2. 若第三方包产物是 `js` 的情况，需要将其纳入 babel 额外处理，才可以支持 css modules：

```ts
// .umirc.ts
export default {
  extraBabelIncludes: ['your-pkg-name']
}
```

## 我的环境很多，多环境 config 文件的优先级是怎样的

加载优先级详见 [discussions/8341](https://github.com/umijs/umi/discussions/8341)

## IE 兼容性问题

IE 被淘汰，现代浏览器主流背景下，umi4 默认不兼容 IE ，在 [issues/8658](https://github.com/umijs/umi/issues/8658) 可以参与相关讨论。

若你需要兼容 es5 ，目前的缓解方法是： 调整 js 与 css 的压缩器

```ts
// .umirc.ts
export default {
  jsMinifier: 'terser',
  cssMinifier: 'cssnano'
}
```

## SSR 问题

SSR 目前还处于实验性特性，不建议在生产环境使用，若发现问题可即时在 issue 反馈。

## Vue / Vite 问题

umi4 新增了 vite 模式和 vue 支持，可能存在 edge case ，若发现问题可即时在 issue 反馈。
