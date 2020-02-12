# @umijs/routes

## CHANGE

- [BREAK CHANGE] 不再支持 disableRedirectHoist 配置，默认就不 hoist redirect 配置

## CONVENTIONAL ROUTES CHANGES

- [BREAK CHANGE] 动态路由通过 `[]` 表示，比如 `[userId]` 为 `:userId`
- [BREAK CHANGE] 暂不支持可选动态路由，如果后续有需求可以通过路由组件层的配置加上
- [BREAK CHANGE] 不再支持 yaml 配置扩展，改为通过路由文件静态属性扩展
- [BREAK CHANGE] Routes 改名为 wrappers，从 pages 目录开始找

## 约定式路由文档

### 动态路由

约定 `[]` 包裹的文件或文件夹为动态路由。

比如：

```bash
+ pages
  + [post]
    - index.js
    - comments.js
  + users
    - [id].js
  - index.js
```

会生成路由配置，

```js
[
  { path: '/', exact: true, component: '@/pages/index' },
  { path: '/users/:id', exact: true, component: '@/pages/users/[id]' },
  { path: '/:post/', exact: true, component: '@/pages/[post]/index' },
  {
    path: '/:post/comments',
    exact: true,
    component: '@/pages/[post]/comments',
  },
];
```

### 可选动态路由

暂不支持。

### 嵌套路由

约定目录下有 `_layout.js` 时会生成嵌套路由。

比如：

```bash
+ pages
  + users
    - _layout.js
    - detail.js
    - index.js
```

会生成路由配置，

```js
[
  {
    path: '/users',
    component: '@/pages/users/_layout',
    routes: [
      { path: '/users/detail', exact: true, component: '@/pages/users/detail' },
      { path: '/users', exact: true, component: '@/pages/users/index' },
    ],
  },
];
```

### 全局 layout

约定 `src/layouts/index.js` 为全局 layout。

### 额外的路由配置（TODO）

比如：

```js
function HomePage() {
  return <h1>Home Page</h1>;
}

HomePage.title = 'Home Page';

export default HomePage;
```

其中的 `title` 会附加到路由配置中。
