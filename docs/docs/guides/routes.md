import { Message } from 'umi';

# 路由

在 Umi 应用是[单页应用](https://en.wikipedia.org/wiki/Single-page_application)，页面地址的跳转都是在浏览器端完成的，不会重新请求服务端获取 html，html 只在应用初始化时加载一次。所有页面由不同的组件构成，页面的切换其实就是不同组件的切换，你只需要在配置中把不同的路由路径和对应的组件关联上。

## 路由类型配置

请参考[配置文档](../api/config#history)

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

Umi 4 默认根据路由来进行 JavaScript 模块按需加载。如果需要在路由组件加载的过程中配置自定义加载组件，在项目 `src` 目录下创建 `loading.tsx` 或者 `loading.jsx` 或者 `loading.js` 文件，默认导出的组件会在组件加载的时候渲染。

<Message emoji="💡">
你可以在 Chrome 的调试工具的网络 tab 中将网络设置成低速，然后切换路由查看动态加载中组件的展示。
</Message>

### path

* Type: `string`

`path` 只支持两种占位符配置，第一种是动态参数 `:id` 的形式，第二种是 `*` 通配符，通配符只能出现路由字符串的最后。

✅ 以下是目前***支持***的路由路径配置形式：

```txt
/groups
/groups/admin
/users/:id
/users/:id/messages
/files/*
/files/:id/*
```

❌ 以下是目前***不支持***的路由路径配置形式：
```txt
/users/:id?
/tweets/:id(\d+)
/files/*/cat.jpg
/files-*
```

### component

* Type: `string`

配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 `src/pages` 开始找起。

如果指向 `src` 目录的文件，可以用 `@`，也可以用 `../`。比如 `component: '@/layouts/basic'`，或者 `component: '../layouts/basic'`，推荐用前者。

### exact

* Type: `boolean`
* Default: `true`

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

然后在 `src/layouts/index` 中通过 `<Outlet/>` 渲染子路由，

```jsx
import {Outlet} from 'umi'

export default (props) => {
  return <div style={{ padding: 20 }}> 
    <Outlet/> 
  </div>;
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
import { Navigate } from 'umi'

export default (props) => {
  const { isLogin } = useAuth();
  if (isLogin) {
    return <div>{ props.children }</div>;
  } else {
    return <Navigate to="/login" />;
  }
}
```

这样，访问 `/user`，就通过 `useAuth` 做权限校验，如果通过，渲染 `src/pages/user`，否则跳转到 `/login`，由 `src/pages/login` 进行渲染。

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

组件内还可以使用 `useNavigate` hook

```tsx
import { useNavigate } from 'umi';

export default ()=>{
  const navigate = useNavigate()

  return <button onClick={
    () => {
    //跳转到指定路由
    navigate('/list');

    // 带参数跳转到指定路由
    navigate('/list?a=b')

    // 替换为指定路由
    navigate('/list', {replace: true})

    // 跳转到上一个路由
    navigate(-1);
    // 跳转到上 n 个路由
    navigate(-n);
  }> navigate </button>
}
```

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

Umi4 使用 [react-router@6](https://reactrouter.com/docs/en/v6/api) 作为路由组件，路由参数的获取使其 hooks。

### match 信息

[useMatch](https://reactrouter.com/docs/en/v6/api#usematch)

```jsx
const match = useMatch('/comp/:id')
// match 
{
  "params": {
    "id": "paramId"
  },
  "pathname": "/comp/paramId/",
  "pathnameBase": "/comp/paramId",
  "pattern": {
    "path": "/comp/:id",
    "caseSensitive": false,
    "end": true
  }
}
```

### location 信息

[useLocation](https://reactrouter.com/docs/en/v6/api#uselocation)

```jsx
const location  = useLocation();
// location
{
  "pathname": "/path/",
  "search": "",
  "hash": "",
  "state": null,
  "key": "default"
}
```

### 路由动态参数

[useParams](https://reactrouter.com/docs/en/v6/api#useparams)

```jsx
// 路由配置 /comp/:id
// 当前 location /comp/paramId

const params  = useParams();
// params
{
  "id": "paramId"
}
```

### query 信息

[useSearchParams](https://reactrouter.com/docs/en/v6/api#usesearchparams)

```jsx
// 当前 location /comp?a=b;
const [searchParams, setSearchParams] = useSearchParams();
searchParams.get('a')  // b
searchParams.toString()  // a=b

setSearchParams({a:'c',d:'e'}) // location 变成 /comp?a=c&d=e
```

`searchParams`的 api [参考](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/searchParams)

