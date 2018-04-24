---
id: router
title: 路由配置
---

umi 会根据 `pages` 目录自动生成路由配置。

## 基础路由

假设 `pages` 目录结构如下：

```
+ pages/
  + users/
    - index.js
    - list.js
  - index.js
```

那么，umi 会自动生成路由配置如下：

```js
[
  { path: '/': exact: true, component: './pages/index.js' },
  { path: '/users/': exact: true, component: './pages/users/index.js' },
  { path: '/users/list': exact: true, component: './pages/users/list.js' },
]
```

## 动态路由

umi 里约定，带 $ 前缀的目录或文件为动态路由。

比如以下目录结构：

```
+ pages/
  + $post/
    - index.js
    - comments.js
  + users/
    $id.js
  - index.js
```

会生成路由配置如下：

```js
[
  { path: '/': exact: true, component: './pages/index.js' },
  { path: '/users/:id': exact: true, component: './pages/users/$id.js' },
  { path: '/:post/': exact: true, component: './pages/$post/index.js' },
  { path: '/:post/comments': exact: true, component: './pages/$post/comments.js' },
]
```

## 可选的动态路由

umi 里约定动态路由如果带 $ 后缀，则为可选动态路由。

比如以下结构：

```
+ pages/
  + users/
    $id$.js
  - index.js
```

会生成路由配置如下：

```js
[
  { path: '/': exact: true, component: './pages/index.js' },
  { path: '/users/:id?': exact: true, component: './pages/users/$id$.js' },
]
```

## 嵌套路由

umi 里约定目录下有 `_layout.js` 时会以生成嵌套路由，以 `_layout.js` 为该目录的 layout 。

比如以下目录结构：

```
+ pages/
  + users/
    - _layout.js
    - $id.js
    - index.js
```

会生成路由配置如下：

```js
[
  { path: '/users': exact: false, component: './pages/users/_layout.js'
    routes: [
     { path: '/users/', exact: true, component: './pages/users/index.js' },
     { path: '/users/:id', exact: true, component: './pages/users/$id.js' },
   ],
  },
]
```

## 全局 layout

umi 里约定 `src` 目录下的 `layouts/index.js` 为全局路由，返回一个 React 组件，通过 `props.children` 渲染子组件。

比如：

```js
export default function(props) {
  return (
    <>
      <Header />
      { props.children }
      <Footer />
    </>
  );
}
```

## 不同的全局 layout

你可能需要针对不同路由输出不同的全局 layout，umi 不支持这样的配置，但你仍可以在 `layouts/index.js` 对 location.path 做区分，渲染不同的 layout 。

比如不想要针对 /login 输出简单布局，

```js
export default function(props) {
  if (props.location.path === '/login') {
    return <SimpleLayout>{ props.children }</SimpleLayout>
  }
  
  return (
    <>
      <Header />
      { props.children }
      <Footer />
    </>
  );
}
```

## 404 路由

umi 中约定 `pages` 目录下的 `404.js` 为 404 页面，需要返回 React 组件。

比如：

```js
export default () => {
  return (
    <div>I am a customized 404 page</div>
  );
};
```

注：开发模式下，umi 会添加一个默认的 404 页面来辅助开发，但你仍然可通过精确地访问 /404 来验证 404 页面。

## 路由过滤

如果你需要在 `pages` 下组织文件，那么有可能某些文件是不需要添加到路由的，那么你可以通过 [umi-plugin-routes](https://github.com/umijs/umi/tree/master/packages/umi-plugin-routes) 插件进行排除。

比如以下目录结构：

```
+ pages
  + users
    + models
      - a.js
    + services
      - a.js
    - index.js
```

你应该只会想要 users/index.js 作为路由，所以需要排除掉 models 和 services 目录。

先安装依赖，

```bash
$ npm install umi-plugin-routes --save-dev
```

然后配置 `.umirc.js` 如下：

```js
export default {
  plugins: [
    ['umi-plugin-routes', {
      exclude: [
        /models/,
        /services/,
      ],
    }],
  ]
}
```

## 权限路由

umi 是通过配置定制化的 Route 组件来实现权限路由的，如果你熟悉 react-router@4，应该会比较熟悉。

比如以下目录结构：

```
+ pages/
  - index.js
  - list.js
```

然后在 `.umirc.js` 里做如下配置：

```js
export default {
  pages: {
    '/list': { Route: './routes/PrivateRoute.js' },
  },
}
```

则会自动生成以下路由配置：

```js
[
  { path: '/': exact: true, component: './pages/index.js' },
  { path: '/list': exact: true, component: './pages/list.js', meta: { Route: './routes/PrivateRoute.js' } },
]
```

然后 umi 会用 `./routes/PrivateRoute.js` 来渲染 `/list`。

`./routes/PrivateRoute.js` 文件示例：

```js
import { Route } from 'react-router-dom';

export default (args) => {
  const { render, ...rest } = args;
  return <Route
    {...rest}
    render={props =>
      <div>
        <div>PrivateRoute (routes/PrivateRoute.js)</div>
        {
          render(props)
        }
      </div>
    }
  />;
}
```

注：`PrivateRoute` 里渲染子组件是通过 `render` 方法，**而非 Component 组件属性**。

## 配置式路由

umi 推荐的路由方式是基于目录和文件的约定的，但如果你倾向于使用配置式的路由，可以在 `src` 下新建 `_routes.json` 文件，此文件存在时则不会对 pages 目录做解析。

比如：

```json
[
  { "path": "/", "exact": true, "component": "./components/a" },
  { "path": "/list", "component": "./pages/b", "meta": { "Route": "./routes/PrivateRoute.js" } },
  { "path": "/users", "component": "./pages/users/_layout",
    "routes": [
      { "path": "/users/detail", "exact": true, "component": "./pages/users/detail" },
      { "path": "/users/:id", "exact": true, "component": "./pages/users/id" }
    ]
  }
]
```

注意：

1. component 为指向文件的相对路径，**而非 React 组件**
1. 支持通过 routes 实现嵌套路由
1. 支持通过 meta.Route 实现权限路由

## 路由动效

路由动效应该是有多种实现方式，这里举 [react-transition-group](https://github.com/reactjs/react-transition-group) 的例子。

先安装依赖，

```bash
$ npm install react-transition-group --save
```

在 layout 组件（`layouts/index.js` 或者 pages 子目录下的 `_layout.js`）里在渲染子组件时用 TransitionGroup 和 CSSTransition 包裹一层，并以 `location.key` 为 key，

```js
import withRouter from 'umi/withRouter';
import { TransitionGroup, CSSTransition } from "react-transition-group";

export default withRouter(
  ({ location }) =>
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="fade" timeout={300}>
        { children }
      </CSSTransition>
    </TransitionGroup>
)
```

上面用到的 `fade` 样式，可以在 `src` 下的 `global.css` 里定义：

```css
.fade-enter {
  opacity: 0;
  z-index: 1;
}

.fade-enter.fade-enter-active {
  opacity: 1;
  transition: opacity 250ms ease-in;
}
```

## 面包屑

面包屑也是有多种实现方式，这里举 [react-router-breadcrumbs-hoc](https://github.com/icd2k3/react-router-breadcrumbs-hoc) 的例子。

先安装依赖，

```bash
$ npm install react-router-breadcrumbs-hoc --save
```

然后实现一个 `Breakcrumbs.js`，比如：

```js
import NavLink from 'umi/navlink';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

// 更多配置请移步 https://github.com/icd2k3/react-router-breadcrumbs-hoc
const routes = [
  { path: '/', breadcrumb: '首页' },
  { path: '/list', breadcrumb: 'List Page' },
];

export default withBreadcrumbs(routes)(({ breadcrumbs }) => (
  <div>
    {breadcrumbs.map((breadcrumb, index) => (
      <span key={breadcrumb.key}>
        <NavLink to={breadcrumb.props.match.url}>
          {breadcrumb}
        </NavLink>
        {(index < breadcrumbs.length - 1) && <i> / </i>}
      </span>
    ))}
  </div>
));
```

然后在需要的地方引入此 React 组件即可。

## 启用 Hash 路由

umi 默认是用的 Browser History，如果要用 Hash History，需在 `.umirc.js` 里配置：

```js
export default {
  hashHistory: true,
}
```

## Scroll to top

在 layout 组件（`layouts/index.js` 或者 pages 子目录下的 `_layout.js`）的 componentDidUpdate 里决定是否 scroll to top，比如：

```js
import { Component } from 'react';
import withRouter from 'umi/withRouter';

class Layout extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }
  render() {
    return this.props.children;
  }
}

export default withRouter(Layout);
```

## 参考

* https://reacttraining.com/react-router/
