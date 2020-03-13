---
translateHelp: true
---

# Routing


In Umi, apps are[Single page application](https://en.wikipedia.org/wiki/Single-page_application)，The redirection of the page address is done on the browser side. It does not re-request the server to get the html. The html is only loaded once when the application initializes. All pages are composed of different components. The switching of pages is actually the switching of different components. You only need to associate different routing paths with the corresponding components in the configuration.

## Configure routing

Configure in the configuration file by `routes`, the format is an array of routing information.

such as:

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

Configuration can be [path-to-regexp@^1.7.0](https://github.com/pillarjs/path-to-regexp/tree/v1.7.0) Understand the path or route array.

### component

* Type: `string`

Configure the path of the React component used for rendering after location and path match. It can be an absolute path or a relative path. If it is a relative path, it will start from `src/pages`.

If you point to a file in the `src` directory, you can use`@` or `../`. For example, `component: '@/layouts/basic'`, or `component: '../layouts/basic'`, the former is recommended.

### exact

* Type: `boolean`
* Default: `false`

Indicates whether there is an exact match, that is, whether the location exactly matches the path.

such as:

```js
export default {
  routes: [
    // match fails when url is /one/two
    { path: '/one', exact: true },
    
    // match when url is /one/two
    { path: '/one' },
    { path: '/one', exact: false },
  ],
}
```

### routes

Configure sub-routes, usually used when you need to add layout components to multiple paths.

such as:

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

Then in `src/layouts/index` render child routes via `props.children`,

```jsx
export default (props) => {
  return <div style={{ padding: 20 }}>{ props.children }</div>;
}
```

In this way, accessing `/list` and `/admin` will bring the `src/layouts/index` layout component.

### redirect

* Type: `string`

Configure route redirection.

such as:

```js
export default {
  routes: [
    { exact: true, path: '/', redirect: '/list' },
    { exact: true, path: '/list', component: 'list' },
  ],
}
```

Visiting `/` will jump to `/ list` and be rendered by the` src / pages / list` file.

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

Then in `src/wrappers/auth`,

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

In this way, if you visit `/ user`, you will use` useAuth` to verify permissions. If it passes, render `src / pages / user`, otherwise jump to` / login` and render by `src / pages / login`.

### title

* Type: `string`

Configure the title of the route.

## Page jump

```js
import { history } from 'umi';

// Jump to the specified route
history.push('/list');

// Jump to the specified route with parameters
history.push('/list?a=b');
history.push({
  pathname: '/list',
  query: {
    a: 'b',
  },
});

// Jump to previous route
history.goBack();
```

## hash routing

See details [Configuration#history](../config#history)。

## Link Component

such as:

```jsx
import { Link } from 'umi';

export default () => (
  <div>
    <Link to="/users">Users Page</Link>
  </div>
);
```

Then clicking on `Users Page` will jump to the `/users` address.

note:

* `Link` is only used for internal jump of single-page application, if it is external address jump, please use `a` tag

## Routing component parameters

The routing component can get the following properties through `props`,

* match, the object after the current route and url match, including the `params`,` path`, `url` and` isExact` attributes
* location, which indicates the current location of the application, including `pathname`,` search`, `query` and other attributes
* history, interface with [api#history](../api#history)
* route, current route configuration, including `path`,` exact`, `component`,` routes`, etc.

such as:

```js
export default function(props) {
  console.log(props.route);
  return <div>Home Page</div>;
}
```

## Passing parameters to child routes

With cloneElement, once is fine (twice for Umi 2).

```js
import React from 'react';

export default function Layout(props) {
  return React.Children.map(props.children, child => {
    return React.cloneElement(child, { foo: 'bar' });
  });
}
```
