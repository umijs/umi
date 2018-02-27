---
id: app-structure
title: 目录结构
---

一个包含所有约定的目录结构是这样的。

```bash
.
├── dist/                          // 构建产物目录
└── src/                           // 源码目录，可选，把里面的内容直接移到外面即可
    ├── layouts/
    │   └── index.js               // 全局布局
    ├── pages/                     // 页面目录，里面的文件即路由
        ├── .umi/                  // dev 临时目录，需添加到 .gitignore
        ├── .umi-production/       // build 临时目录，会自动删除
        ├── document.ejs           // HTML 模板
        ├── 404.js                 // 404 页面
        ├── page1.js               // 页面 1，任意命名
        └── page2.js               // 页面 2，任意命名
    ├── global.css                 // 约定的全局样式文件，自动引入，也可以用 global.less
    ├── _routes.json               // 路由配置，和文件路由二选一
├── test/                          // 测试用例放这里
├── .umirc.js                      // umi 配置
├── .webpackrc                     // webpack 配置
└── package.json
```

> 注意：src 目录是可选的，可以有，也可以没有。

这里大部分的约定和配置文件都是可选的，唯一强约定只有 pages 目录。

比如一个简单的应用，目录结构只要这样就好。

```bash
.
├── pages/
    ├── list.js
    └── index.js
└── package.json
```
