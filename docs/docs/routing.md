# Routing

In Umi, applications are [single-page](https://en.wikipedia.org/wiki/Single-page_application)) applications, and the page address jumps are done on the browser side, and the server will not be re-requested for html, and html is only loaded once when the application is initialized. All pages are composed of different components. The switching of pages is actually the switching of different components. You only need to associate different routing paths with corresponding components in the configuration.

## Configuring Routing

Configure through `routes` in the configuration file, the format is an array of routing information.

Example：

```js
export default {
  routes: [
    { exact: true, path: '/', component: 'index' },
    { exact: true, path: '/user', component: 'user' },
  ],
};
```

### path

- Type: `string`

Configure path wildcards that can be understood by [path-to-regexp@^1.7.0](https://github.com/pillarjs/path-to-regexp/tree/v1.7.0).

### component

- Type: `string`

Configure the React component path for rendering after matching location and path. It can be an absolute path or a relative path. If it is a relative path, it will be found from `src/pages`.

If you point to a file in the `src` directory, you can use either `@` or `../`. For example, `component:'@/layouts/basic'`, or `component:'../layouts/basic'`, the former is recommended.

### exact

- Type: `boolean`
- Default: `true`

Indicates whether it is a strict match, that is, whether location and path exactly correspond.

Example:

```js
export default {
  routes: [
    // Matching fails when url is /one/two
    { path: '/one', exact: true },

    // Matching is successful when url is /one/two
    { path: '/one' },
    { path: '/one', exact: false },
  ],
};
```

### routes

Configure sub-routes, usually used when you need to add layout components to multiple paths.

Example:

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
};
```

Then in `src/layouts/index`, pass `props.children` to render child routes,

```jsx
export default (props) => {
  return <div style={{ padding: 20 }}>{props.children}</div>;
};
```

In this way, accessing `/list` and `/admin` will bring the layout component `src/layouts/index`.

### redirect

- Type: `string`

Configure routing jump.

Example:

```js
export default {
  routes: [
    { exact: true, path: '/', redirect: '/list' },
    { exact: true, path: '/list', component: 'list' },
  ],
};
```

Visiting `/` will jump to `/list`, which will be rendered by the `src/pages/list` file.

### wrappers

- Type: `string[]`

wrappers is HOC.

For example, you can run authorization check for a specific route:

```js
export default {
  routes: [
    { path: '/user', component: 'user', wrappers: ['@/wrappers/auth'] },
    { path: '/login', component: 'login' },
  ],
};
```

See below example as content of `src/wrappers/auth`,

```jsx
import { Redirect } from 'umi';

export default (props) => {
  const { isLogin } = useAuth();
  if (isLogin) {
    return <div>{props.children}</div>;
  } else {
    return <Redirect to="/login" />;
  }
};
```

With above configuration, user request of `/user` will be validated via `useAuth`. `src/pages/user` gets rendered or page redirected to `/login`.

### title

- Type: `string`

Configure the route title.

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

// Jump to the previous route
history.goBack();
```

## hash routing

See [Configuration#history](../config#history) for details.

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

Then click on the `Users Page` to jump to the `/users` address.

Note:

- `Link` is only used for internal jumps of single page applications, if it is an external address jump, please use the `a` tag

## Routing component parameters

The routing component can get the following properties through `props`,

- match, the object after the current route and url match, including the attributes of `params`, `path`, `url` and `isExact`
- location, which indicates where the application is currently located, including attributes such as `pathname`, `search`, and `query`
- history, same as [api#history](../api#history) interface
- route, current routing configuration, including `path`, `exact`, `component`, `routes`, etc.
- routes, all routing information

Example:

```js
export default function (props) {
  console.log(props.route);
  return <div>Home Page</div>;
}
```

## Passing parameters to sub-routes

With cloneElement, one time is fine (it is necessary twice for Umi 2).

```js
import React from 'react';

export default function Layout(props) {
  return React.Children.map(props.children, (child) => {
    return React.cloneElement(child, { foo: 'bar' });
  });
}
```
