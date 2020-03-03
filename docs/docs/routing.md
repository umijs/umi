---
translateHelp: true
---

# Routing

In Umi, applications are [single-page applications](https://en.wikipedia.org/wiki/Single-page_application) , and the jump of the page address is done on the browser side. It does not re-request the server to obtain the html. The html is only loaded once when the application is initialized. All pages are composed of different components. The switching of pages is actually the switching of different components. You only need to associate different routing paths with the corresponding components in the configuration.

## Configure routing

In the configuration file by the `routes` configuration, in the format of an array of routing information.

Example:

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

Configure an array of paths or routes that [path-to-regexp@^1.7.0](https://github.com/pillarjs/path-to-regexp/tree/v1.7.0) can understand.

### component

* Type: `string`

如果指向 `src` 目录的文件，可以用 `@`，也可以用 `../`。比如 `component: '@/layouts/basic'`，或者 `component: '../layouts/basic'`，推荐用前者。

Configure the path of the React component used for rendering after location and path match. Can be an absolute path, or a relative path, if it is a relative path, it will start looking from `src/pages`.

If you point to the `src` directory, the special prefix `@` can be used instead of `../.`.

For example component: `@/layouts/basic` for the component `../layouts/basic` is recommended.

### exact

* Type: `boolean`
* Default: `false`

Indicates whether it matches exactly, that is, whether location exactly corresponds to path.

Example：

```js
export default {
  routes: [
    // url /one/two
    { path: '/one', exact: true },
    // url /one/two
    { path: '/one' },
    { path: '/one', exact: false },
  ],
}
```

### routes

Configure sub-routes, usually used when you need to add layout components to multiple paths.

Example：

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

Rendering `src/layouts/index` with `props.children` sub-routing

```jsx
export default (props) => {
  return <div style={{ padding: 20 }}>{ props.children }</div>;
}
```

In this way, access `/list` and `/admin` will render `src/layouts/index` layout components.

### redirect

* Type: `string`

Configure route redirection.

Example：

```js
export default {
  routes: [
    { exact: true, path: '/', redirect: '/list' },
    { exact: true, path: '/list', component: 'list' },
  ],
}
```

The route `/will` will redirect to `/list` and render `src/pages/list`

### wrappers

* Type: `string[]`

Configure higher-order component encapsulation for routing.

For example, it can be used to verify permissions at the route level:

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

For `src/wrappers/auth` it redirects to login is not logged in

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

In this way, accessing `/user` will call `useAuth` to perform the permissions check.

If the auth check passes, it will render `src/pages/users` otherwise it will redirect to `/login` by rendering `src/pages/login`

### title

* Type: `string`

Set the title of the route.

## Page redirect

```js
import { history } from 'umi';

// push route on history
history.push('/list');

// push more routes on history
history.push('/list?a=b');
history.push({
  pathname: '/list',
  query: {
    a: 'b',
  },
});

// go back to latest route on history
history.goBack();
```

## hash routing

## Link component

Example：

```jsx
import { Link } from 'umi';

export default () => (
  <div>
    <Link to="/users">Users Page</Link>
  </div>
);
```

Clicking `Users Page` will go to `/users`

Note:

* `LinkInternal` use only for single page jump. For an external address use `a` (HTML anchor) instead

## NavLink components

TODO, consider putting it in the API documentation.

## Routing parameter

TODO
