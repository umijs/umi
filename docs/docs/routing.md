---
translateHelp: true
---

# Routing


In Umi, the applications are all [single-page applications] (https://en.wikipedia.org/wiki/Single-page_application), and the jump of the page address is done on the browser side, and will not request the server side again Get html, which is only loaded once when the application is initialized. All pages are composed of different components. The switching of pages is actually the switching of different components. You only need to associate different routing paths with corresponding components in the configuration.

## Configure routing

It is configured in the configuration file through `routes`, the format is an array of routing information.

such as:

```js
export default {
  routes: [
    {exact: true, path:'/', component:'index' },
    {exact: true, path:'/user', component:'user' },
  ],
}
```

### path

* Type: `string`

Configure path wildcards that can be understood by [path-to-regexp@^1.7.0](https://github.com/pillarjs/path-to-regexp/tree/v1.7.0).

### component

* Type: `string`

Configure the React component path used for rendering after location and path match. It can be an absolute path or a relative path. If it is a relative path, it will start from `src/pages`.

If you point to a file in the `src` directory, you can use `@` or `../`. For example, `component:'@/layouts/basic'`, or `component:'../layouts/basic'`, the former is recommended.

### exact

* Type: `boolean`
* Default: `false`

Indicates whether it is a strict match, that is, whether location and path exactly correspond.

such as:

```js
export default {
  routes: [
    // match fails when url is /one/two
    {path:'/one', exact: true },
    
    // The match is successful when the url is /one/two
    {path:'/one' },
    {path:'/one', exact: false },
  ],
}
```

### routes

Configure sub-routes, usually used when you need to add layout components to multiple paths.

such as:

```js
export default {
  routes: [
    {path:'/login', component:'login' },
    {
      path:'/',
      component:'@/layouts/index',
      routes: [
        {path:'/list', component:'list' },
        {path:'/admin', component:'admin' },
      ],
    },
  ],
}
```

Then render the child route through `props.children` in `src/layouts/index`,

```jsx
export default (props) => {
  return <div style={{ padding: 20 }}>{ props.children }</div>;
}
```

In this way, visiting `/list` and `/admin` will bring the layout component `src/layouts/index`.

### redirect

* Type: `string`

Configure route hopping.

such as:

```js
export default {
  routes: [
    {exact: true, path:'/', redirect:'/list' },
    {exact: true, path:'/list', component:'list' },
  ],
}
```

Accessing `/` will jump to `/list` and render from the `src/pages/list` file.

### wrappers

* Type: `string[]`

High-level component encapsulation for configuring routing

For example, it can be used for routing level permission verification:

```js
export default {
  routes: [
    {path:'/user', component:'user',
      wrappers: [
        '@/wrappers/auth',
      ],
    },
    {path:'/login', component:'login' },
  ]
}
```

Then in `src/wrappers/auth`,

```jsx
export default (props) => {
  const {isLogin} = useAuth();
  if (isLogin) {
    return <div>{ props.children }</div>;
  } else {
    redirectTo('/login');
  }
}
```

In this way, accessing `/user` will verify the permission through `useAuth`. If it passes, render `src/pages/user`, otherwise it will jump to `/login`, which will be rendered by `src/pages/login`.

### title

* Type: `string`

Configure the title of the route.

## Page Jump

```js
import {history} from'umi';

// Jump to the specified route
history.push('/list');

// Jump to the specified route with parameters
history.push('/list?a=b');
history.push({
  pathname:'/list',
  query: {
    a:'b',
  },
});

// Jump to the previous route
history.goBack();
```

## hash routing

See [Configuration#history](../config#history) for details.

## Link component

such as:

```jsx
import {Link} from'umi';

export default () => (
  <div>
    <Link to="/users">Users Page</Link>
  </div>
);
```

Then click on `Users Page` to jump to the `/users` address.

note:

* `Link` is only used for internal jumps in single page applications, if it is an external address jump please use the `a` tag

## Routing component parameters

The routing component can get the following properties through `props`,

* match, the object after the current route and url match, including `params`, `path`, `url` and `isExact` attributes
* location, which indicates the current location of the application, including attributes such as `pathname`, `search`, `query`, etc.
* history, same as [api#history](../api#history) interface
* route, the current routing configuration, including `path`, `exact`, `component`, `routes`, etc.
* routes, all routing information

such as:

```js
export default function(props) {
  console.log(props.route);
  return <div>Home Page</div>;
}
```

## Passing parameters to subroutines

With cloneElement, it's fine once (Umi 2 requires twice).

```js
import React from 'react';

export default function Layout(props) {
  return React.Children.map(props.children, child => {
    return React.cloneElement(child, {foo:'bar' });
  });
}
```
