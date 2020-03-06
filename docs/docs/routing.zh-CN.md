# 路由

在 Umi 中，应用都是[单页应用](https://en.wikipedia.org/wiki/Single-page_application)，页面地址的跳转都是在浏览器端完成的，不会重新请求服务端获取 html，html 只在应用初始化时加载一次。所有页面由不同的组件构成，页面的切换其实就是不同组件的切换，你只需要在配置中把不同的路由路径和对应的组件关联上。

## 配置路由

在配置文件中通过 `routes` 进行配置，格式为路由信息的数组。

比如：

```js
export default {
  routes: [
    { exact: true, path: '/', component: 'index' },
    { exact: true, path: '/user', component: 'user' },
  ],
}
```

### path

* Type: `string | string[]`

配置可以被 [path-to-regexp@^1.7.0](https://github.com/pillarjs/path-to-regexp/tree/v1.7.0) 理解的路径或路由数组。

### component

* Type: `string`

配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 `src/pages` 开始找起。

如果指向 `src` 目录的文件，可以用 `@`，也可以用 `../`。比如 `component: '@/layouts/basic'`，或者 `component: '../layouts/basic'`，推荐用前者。

### exact

* Type: `boolean`
* Default: `false`

表示是否严格匹配，即 location 是否和 path 完全对应上。

比如：

```js
export default {
  routes: [
    // url 为 /one/two 时匹配失败
    { path: '/one', exact: true },
    
    // url 为 /one/two 时匹配成功
    { path: '/one' },
    { path: '/one', exact: false },
  ],
}
```

### routes

配置子路由，通常在需要为多个路径增加 layout 组件时使用。

比如：

```js
export default {
  routes: [
    { path: '/login', component: 'login' },
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/list', component: 'list' },
        { path: '/admin', component: 'admin' },
      ],
    }, 
  ],
}
```

然后在 `src/layouts/index` 中通过 `props.children` 渲染子路由，

```jsx
export default (props) => {
  return <div style={{ padding: 20 }}>{ props.children }</div>;
}
```

这样，访问 `/list` 和 `/admin` 就会带上 `src/layouts/index` 这个 layout 组件。

### redirect

* Type: `string`

配置路由跳转。

比如：

```js
export default {
  routes: [
    { exact: true, path: '/', redirect: '/list' },
    { exact: true, path: '/list', component: 'list' },
  ],
}
```

访问 `/` 会跳转到 `/list`，并由 `src/pages/list` 文件进行渲染。

### wrappers

* Type: `string[]`

配置路由的高阶组件封装。

比如，可以用于路由级别的权限校验：

```js
export default {
  routes: [
    { path: '/user', component: 'user',
      wrappers: [
        '@/wrappers/auth',
      ],
    },
    { path: '/login', component: 'login' },
  ]
}
```

然后在 `src/wrappers/auth` 中，

```jsx
export default (props) => {
  const { isLogin } = useAuth();
  if (isLogin) {
    return <div>{ props.children }</div>;
  } else {
    redirectTo('/login');
  }
}
```

这样，访问 `/user`，就通过 `useAuth` 做权限校验，如果通过，渲染 `src/pages/users`，否则跳转到 `/login`，由 `src/pages/login` 进行渲染。

### title

* Type: `string`

配置路由的标题。

## 页面跳转

```js
import { history } from 'umi';

// 跳转到指定路由
history.push('/list');

// 带参数跳转到指定路由
history.push('/list?a=b');
history.push({
  pathname: '/list',
  query: {
    a: 'b',
  },
});

// 跳转到上一个路由
history.goBack();
```

## hash 路由

详见 [配置#history](../config#history)。

## Link 组件

比如：

```jsx
import { Link } from 'umi';

export default () => (
  <div>
    <Link to="/users">Users Page</Link>
  </div>
);
```

然后点击 `Users Page` 就会跳转到 `/users` 地址。

注意：

* `Link` 只用于单页应用的内部跳转，如果是外部地址跳转请使用 `a` 标签

## 路由组件参数

路由组件可通过 `props` 获取到以下属性，

* match，当前路由和 url match 后的对象，包含 `params`、`path`、`url` 和 `isExact` 属性
* location，表示应用当前出于哪个位置，包含 `pathname`、`search`、`query` 等属性
* history，同 [api#history](../api#history) 接口
* route，当前路由配置，包含 `path`、`exact`、`component`、`routes` 等

比如：

```js
export default function(props) {
  console.log(props.route);
  return <div>Home Page</div>;
}
```

## 传递参数给子路由

通过 cloneElement，一次就好（Umi 2 时需要两次）。

```js
import React from 'react';

export default function Layout(props) {
  return React.Children.map(props.children, child => {
    return React.cloneElement(child, { foo: 'bar' });
  });
}
```
