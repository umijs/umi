-------
translateHelp: true
-------

# Routing


In Umi, the applications are all [one-page applications](https://en.wikipedia.org /wiki/Single-page_application), the page address jumps are all in the It's done on the browser side, there is no re-request to the server to get the html, the html is only loaded once when the application is initialized. All pages are made up of different components, the page switch is actually a switch between different components, you just need to configure the different The route path is associated with the corresponding component.

## Configuring Routes

Configured in the configuration file via `routes` in the format of an array of routing information.

For example.

```js
export default {
  routes: [
    { exact: true, path: '/', component: 'index' },
    { exact: true, path: '/user', component: 'user' },
  ],
}
```

### path

* Type: `string`

The configuration can be [path-to-regexp@^1.7.0](https:// github.com/pillarjs/path-to-regexp/tree/ v1.7.0) Understood path wildcards.

### component

* Type: `string`

Configure the React component paths for rendering when location and path are matched. It can be absolute or relative, starting with `src/pages`. up.

If pointing to a file in the `src` directory, you can use `@`, or `. /`. For example, `component: '@/layouts/basic'`, or `.../`. component: '.../layouts/basic'', the former is recommended. /layouts/basic'`, the former is recommended.

### exact

* Type: `boolean`
* Default: `false`

Indicates if the location and path match exactly.

For example.

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

Configure subroutes. usually used when you need to add layout components to multiple paths.

For example.

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

Then in `src/layouts/index` pass the `props.children' ` rendering subroutes.

```jsx
export default (props) => {
  return <div style={{ padding: 20 }}>{ props.children }</div>;
}
```

This way, accessing `/list` and `/admin` will take `src/layouts/ index` This layout component.

### redirect

* Type: `string`

Configure route hopping.

For example.

```js
export default {
  routes: [
    { exact: true, path: '/', redirect: '/list' },
    { exact: true, path: '/list', component: 'list' },
  ],
}
```

Accessing `/` redirects you to `/list`, which is replaced by the `src/pages/list` file. to render.

### wrappers

* Type: `string[] `

Encapsulation of higher-level components for configuring routes.

For example. which can be used for route-level permission checks.

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

Then in `src/wrappers/auth`.

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

This way, when you access `/user`, you do a permission check with `useAuth`, and if it passes, you render ` src/pages/user`, otherwise it goes to `/login`, from `src/pages /login` for rendering.

### title

* Type: `string`

Configuring Routes Header.

## Page Jump

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

## hash routing

For details, see [Configuring #history] (... /config#history).

## Link components

For example.

```jsx
import { Link } from 'umi';

export default () => (
  <div>
    <Link to="/users">Users Page</Link>
  </div>
);
```


Then click on `Users Page` and you will be redirected to the `/users` address.

Attention.

* `Link` is only used for internal jumps for single page applications, use `a` tag for external address jumps

## Routing component parameters

The following properties are available to the routing component via `props`.

* match, the object after the current route and url match, containing `params`, ` path`, `url` and `isExact` attributes
* location, which indicates the current location of the application, including `pathname`, ` search`, `query` and other attributes
* history, interface to [api#history](. /api#history)
* route, current route configuration, including `path`, `exact`, `component' `, `routes` etc.
* :: routes, all routing information

For example.

```js
export default function(props) {
  console.log(props.route);
  return <div>Home Page</div>;
}
```

## Passing parameters to subroutes

With cloneElement, once is fine (twice is needed for Umi 2).

```js
import React from 'react';

export default function Layout(props) {
  return React.Children.map(props.children, child => {
    return React.cloneElement(child, { foo: 'bar' });
  });
}
```
