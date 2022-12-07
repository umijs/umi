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

Umi 4 默认按页拆包，如果你觉得还需要优化，可以使用分包策略或手动拆包，详见：[代码拆分指南](../../blog/code-splitting)

如果你有将所有 js 产物打包成单 `umi.js` 文件的需求，请关闭 [dynamicImport](#可以关闭-dynamicimport-吗) 。

## _layout.tsx 去哪了，我怎么嵌套路由

Umi 4 使用 react-router v6 ，通过 `<Outlet />` 展示嵌套路由内容，可参见：[issuecomment-1206194329](https://github.com/umijs/umi/issues/8850#issuecomment-1206194329)

## 怎么用 GraphQL

配置 `graph-ql` loader 的方式可参见： [discussions/8218](https://github.com/umijs/umi/discussions/8218)

## 怎么用 WebAssembly

借助 webpack5 的原生 wasm 加载特性，需要针对 wasm 配置，一个实例可参见：[discussions/8541](https://github.com/umijs/umi/discussions/8541)

## 怎么自定义 loader

根据场景不同，你可能要先从 静态资源规则 中排除你需要加载的文件类型，再添加你自己的 loader / 或修改，可参考如下实例：

 - [discussions/8218](https://github.com/umijs/umi/discussions/8218)

 - [discussions/8452](https://github.com/umijs/umi/discussions/8452)

## 第三方包里如何使用 css modules

1. 直接将第三方包的 `jsx` / `ts` / `tsx` 源码发布到 npm ，无需转译为 `js` Umi 4 支持直接使用。

2. 若第三方包产物是 `js` 的情况，需要将其纳入 babel 额外处理，才可以支持 css modules：

```ts
// .umirc.ts
export default {
  extraBabelIncludes: ['your-pkg-name']
}
```

## 我的环境很多，多环境 config 文件的优先级是怎样的

加载优先级详见 [UMI_ENV](../../docs/guides/env-variables#umi_env) ，无论是 `config/config.ts` 还是 `.umirc.ts` 同理。

## IE 兼容性问题

现代浏览器主流背景下，Umi 4 默认不兼容 IE 。

若你有调整构建兼容目标、兼容非现代浏览器、兼容 IE 浏览器的需求，请参考 [非现代浏览器兼容](../../blog/legacy-browser) 。

## SSR 问题

SSR 目前还处于实验性特性，不建议在生产环境使用，若发现问题可即时在 [issue](https://github.com/umijs/umi/issues) 反馈。

## Vue / Vite 问题

Umi 4 新增了 Vite 模式和 Vue 支持，可能存在 edge case ，若发现问题可即时在 [issue](https://github.com/umijs/umi/issues) 反馈。

## `history` 中取的 pathname 为什么和 `useLocation` 中的不一样

这种情况是在项目配置了 `base` 。 `history.location.pathname` 取到的值是浏览器地址中的 `pathname`，它是包含 `base` 的；而路由相关 hooks 取到的值是**前端路由**定义中的 `pathname`，它是不包含 `base` 的。[参考](../guides/routes#location-信息)。
