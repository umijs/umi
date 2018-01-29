---
id: app-structure
title: 目录结构
---

test
├── components          ---- 通用组件目录
│   └── base.js
├── pages
│   └── a.js            ---- /a/index.html
│   └── b
│       └── a.js        ---- /a/index.html
├── .webpackrc

### pages
umi 的页面路由是根据目录约定生成的：
- 在pages目录下的js文件会生成路由，e.g: /pages/a.js -> /a/index.html
- 在pages目录下的目录会遵循：
  - /pages/a/pages.js -> /a/index.html
  - /pages/a/b/pages.js -> /a/b/index.html

[TBC]
