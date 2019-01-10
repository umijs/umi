---
sidebarDepth: 3
---

# Router

::: tip
The routing usage described below can be found in [umi-examples/routes](https://github.com/umijs/umi-examples/tree/master/routes) and find the sample code in [umi-examples/routes-via-config](https://github.com/umijs/umi-examples/tree/master/routes-via-config).
:::

Umi automatically generates routing configurations based on the `pages` directory.

## Conventional Routing

### Basic Routing

Assume that the `pages` directory structure is as follows:

```
+ pages/
  + users/
    - index.js
    - list.js
  - index.js
```

Then, umi will automatically generate the routing configuration as follows:

```js
[
  { path: '/', component: './pages/index.js' },
  { path: '/users/', component: './pages/users/index.js' },
  { path: '/users/list', component: './pages/users/list.js' },
]
```

### Dynamic Routing

As agreed in umi, directories or files with the `$` prefix are dynamic routes.

For example, the following directory structure:

```
+ pages/
  + $post/
    - index.js
    - comments.js
  + users/
    $id.js
  - index.js
```

The routing configuration will be generated as follows:

```js
[
  { path: '/', component: './pages/index.js' },
  { path: '/users/:id', component: './pages/users/$id.js' },
  { path: '/:post/', component: './pages/$post/index.js' },
  { path: '/:post/comments', component: './pages/$post/comments.js' },
]
```

### Optional Dynamic Routing

In umi, dynamic routing is an optional dynamic route if it has a `$` suffix.

For example, the following structure:

```
+ pages/
  + users/
    - $id$.js
  - index.js
```

The routing configuration will be generated as follows:

```js
[
  { path: '/': component: './pages/index.js' },
  { path: '/users/:id?': component: './pages/users/$id$.js' },
]
```

### Nested Routing

When there is `_layout.js` in the umi directory, a nested route will be generated, with `_layout.js` as the layout of the directory.

For example, the following directory structure:

```
+ pages/
  + users/
    - _layout.js
    - $id.js
    - index.js
```

The routing configuration will be generated as follows:

```js
[
  { path: '/users', component: './pages/users/_layout.js',
    routes: [
     { path: '/users/', component: './pages/users/index.js' },
     { path: '/users/:id', component: './pages/users/$id.js' },
   ],
  },
]
```

### Global Layout

The convention `src/layouts/index.js` is a global route, returning a React component, and rendering the child components via `props.children`.

Example:

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

### Different Global Layout

You may need to output a different global layout for different routes. umi does not support such a configuration, but you can still distinguish between location.path and render different layouts in `layouts/index.js`.

For example, if you want to output a simple layout for /login,

```js
export default function(props) {
  if (props.location.pathname === '/login') {
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

### 404 Routing

The convention `pages/404.js` is a 404 page and needs to return a React component.

Example:

```js
export default () => {
  return (
    <div>I am a customized 404 page</div>
  );
};
```

> Note: In development mode, umi will add a default 404 page to aid development, but you can still verify the 404 page by precisely accessing `/404`.

### Extending Routing by Annotation

The first comment of the contracted routing file is used to extend the route if it contains a configuration in the **yaml** format.

Example:

```
+ pages/
  - index.js
```

If `pages/index.js` contains:

```js
/**
 * title: Index Page
 * Routes:
 *   - ./src/routes/a.js
 *   - ./src/routes/b.js
 */
```

A route configuration is generated:

```js
[
  { path: '/', component: './index.js',
    title: 'Index Page',
    Routes: [ './src/routes/a.js', './src/routes/b.js' ],
  },
]
```

## Configuration Routing

If you prefer to use a configured route, you can configure `routes`, **this configuration item will not be parsed for the `src/pages` directory**.

Example:

```js
export default {
  routes: [
    { path: '/', component: './a' },
    { path: '/list', component: './b', Routes: ['./routes/PrivateRoute.js'] },
    { path: '/users', component: './users/_layout',
      routes: [
        { path: '/users/detail', component: './users/detail' },
        { path: '/users/:id', component: './users/id' }
      ]
    },
  ],
};
```

note:

1. component is relative to the `src/pages` directory

## Permission Routing

The permission routing of umi is implemented by configuring the `Routes` attribute of the route. The convention is added by the yaml annotation, and the configuration formula can be directly matched.

For example, the following configuration:

```js
[
  { path: '/', component: './pages/index.js' },
  { path: '/list', component: './pages/list.js', Routes: ['./routes/PrivateRoute.js'] },
]
```

Then umi will render `/list` with `./routes/PrivateRoute.js`.

Example of `./routes/PrivateRoute.js` file:

```js
export default (props) => {
  return (
    <div>
      <div>PrivateRoute (routes/PrivateRoute.js)</div>
      { props.children }
    </div>
  );
}
```

## Route Transition Effects

There are several ways to implement route transition effects. Here is an example of [react-transition-group](https://github.com/reactjs/react-transition-group).

Install dependencies first,

```bash
$ yarn add react-transition-group
```

In the layout component (`layouts/index.js` or `_layout.js` in the pages subdirectory), wrap a subassembly with `TransitionGroup` and `CSSTransition` and use `location.pathname` as the key.

```js
import withRouter from 'umi/withRouter';
import { TransitionGroup, CSSTransition } from "react-transition-group";

export default withRouter(
  ({ location }) =>
    <TransitionGroup>
      <CSSTransition key={location.pathname} classNames="fade" timeout={300}>
        { children }
      </CSSTransition>
    </TransitionGroup>
)
```

The `fade` style used above can be defined in `global.css` under `src`:

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

## Bread Crumbs

There are many ways to implement breadcrumbs. Here is an example of [react-router-breadcrumbs-hoc](https://github.com/icd2k3/react-router-breadcrumbs-hoc).

Install dependencies first,

```bash
$ yarn add react-router-breadcrumbs-hoc
```

Then implement a `Breakcrumbs.js`, such as:

```js
import NavLink from 'umi/navlink';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

// More configuration please go to https://github.com/icd2k3/react-router-breadcrumbs-hoc
const routes = [
  { path: '/', breadcrumb: 'home' },
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

Then introduce this React component where you need it.

## Enable Hash Routing

Umi defaults to the Browser History. If you want to use Hash History, you need to configure:

```js
export default {
  history: 'hash',
}
```

## Scroll to Top

Decide whether to scroll to top in the `componentDidUpdate` of the layout component (`layouts/index.js` or the `_layout.js` in the pages subdirectory), for example:

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

## Reference

* [https://reacttraining.com/react-router/](https://reacttraining.com/react-router/)
