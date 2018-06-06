# 目录约定

在文件和目录的组织上，UmiJS 尽量选择约定的方式。

## 复杂应用

一个复杂应用的目录结构如下：

```bash
.
├── dist/                          // 默认的 build 输出目录
├── mock/                          // mock 文件所在目录，基于 express
└── src/                           // 源码目录，可选
    ├── layouts/index.js           // 全局布局
    ├── pages/                     // 页面目录，里面的文件即路由
        ├── .umi/                  // dev 临时目录，需添加到 .gitignore
        ├── .umi-production/       // build 临时目录，会自动删除
        ├── document.ejs           // HTML 模板
        ├── 404.js                 // 404 页面
        ├── page1.js               // 页面 1，任意命名，导出 react 组件
        ├── page1.test.js          // 用例文件，umi test 会匹配所有 .test.js 和 .e2e.js 结尾的文件
        └── page2.js               // 页面 2，任意命名
    ├── global.css                 // 约定的全局样式文件，自动引入，也可以用 global.less
    ├── global.js                  // 可以在这里加入 polyfill
├── .umirc.js                      // umi 配置
└── package.json
```

::: warning
注意：src 目录是可选的，可以有，也可以没有。
:::

以上大部分的约定和配置文件都是可选的，唯一强约定只有 `pages` 目录。

## 简单应用

而如果你的应用很简单，目录结构只要这样就好。

```bash
.
├── pages/
    ├── list.js
    └── index.js
└── package.json
```
