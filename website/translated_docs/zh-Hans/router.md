---
id: router
title: 路由配置
---

umi 是 next.js 风格的框架，所以沿用了 pages 下的文件即路由的方式，这种方式简单直观，而且省去了额外的一份配置，是默认的推荐方式。

另外，我们考虑到有些复杂的场景下约定式路由无法满足，或者就是有人偏爱配置的方式，所以依然提供了配置式的路由。

> 注意：约定式路由和配置式路由是二选一的，并不是 merge 的关系，目录下有 `_routes.json` 时会优先用配置式。

## 约定式路由

即 pages 下的文件即路由。

比如有以下文件：

```bash
└── pages/
    ├── index.css
    ├── index.js
    └── list.js
```

那么会生成路由：

```
<Route exact path="/" component={require('../index.js').default} />
<Route exact path="/list" component={require('../list.js').default}} />
```

### 嵌套路由

> 注意：umi@1.1 开始支持。

规则是：

* 约定 `_layout.js` 目录下路由的父级组件，可通过 `props.children` 渲染子路由，或通过 `route.routes` 定制子路由的渲染
* 有 `_layout.js` 时才会有嵌套，无 `_layout.js` 则平级渲染
* 目录下有 `page.js` 时 `_layout.js` 无效，因为目录路由没有子路由，无嵌套需求

看下具体的例子，目录结构如下：


```
+ pages
  - a.js
  + list
    - index.js
    - b.js
```

会生成路由：

```
[
  { path: '/a', exact: true component: './pages/a' },
  { path: '/list', exact: true, component: './pages/list/index' },
  { path: '/list/b', exact: true, component: './pages/list/b' },
]
```

在 `list` 目录下加上 `_layout.js` 后，

```
+ pages
  - a.js
  + list
    - index.js
    - b.js
    - _layout.js
```

会生成路由：

```
[
  { path: '/a', exact: true component: './pages/a' },
  { path: '/list', exact: false, component: './pages/list/_layout',
    routes: [
      { path: '/list', exact: true, component: './pages/list/index' },
      { path: '/list/b', exact: true, component: './pages/list/b' },
    ],
  },
]
```

### 目录路由

有些场景下文件路由无法满足需求，比如我们需要组织 dva 的 models、services 等等，所以 umi 支持一个目录作为路由的方式。约定是：**目录下如果有 page.js，则作为路由解析。**

比如有以下文件：

```bash
└── pages/
    ├── index.css
    ├── index.js
    ├── users/
        ├── detail.js
    ├── list/
        └── page.js
```

会生成路由：

```
<Route exact path="/" component={require('../index.js').default} />
<Route exact path="/users/detail" component={require('../users/detail.js').default}} />
<Route exact path="/list" component={require('../list/page.js').default}} />
```

> 注意 `/users/detail.js` 和 `/list/page.js` 的区别。

### 变量路由

umi 里约定，文件名或目录名里的 `$` 会被替换为 `:`。

比如有以下文件：

```bash
└── pages/
    ├── index.css
    ├── index.js
    ├── users
        └── $userId.js
```

会生成路由：

```
<Route exact path="/" component={require('../index.js').default} />
<Route exact path="/users/:userId" component={require('../users/$userId.js').default}} />
```

## 配置式路由

umi 里约定可通过 _routes.json 配置路由，如果有 _routes.json，则会忽略 pages 下文件即路由的规则。

比如：

```json
[
  {
    "path": "/",
    "exact": true,
    "component": "./components/a"
  },
  {
    "path": "/list",
    "component": "./pages/b"
  }
]
```

会生成路由：

```
<Route exact path="/" component={require('../../components/a.js').default} />
<Route path="/list" component={require('../b.js').default}} />
```

> 注意：配置式路由暂不支持路由嵌套。
