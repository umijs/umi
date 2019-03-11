---
sidebarDepth: 3
---

# Runtime Config

## Why runtime configuration?

We do compile-time configuration via `.umirc.js`. These does cover most of the scenarios, but some are hard to achieve at compile time.

Such as：

* Display _message_ prompts to the user if error occurs.
* Show loading states when loading and navigating between routes.
* Fire request to backend when page is loaded, then modify the routes based on response.

These are difficult or even impossible to handle at compile time.

## Configuration

umi convention is that `src/app.js` is the configuration file.

```bash
+ src
  - app.js      # runtime configuration file
- package.json
```

## Available Configurations

### patchRoutes

Used to modify routes at runtime.

Parameters：

* routes: `Array`，routing configuration

e.g. Add route to `/foo`，

```js
export function patchRoutes(routes) {
  routes[0].unshift({
    path: '/foo',
    component: require('./routes/foo').default,
  });
}
```

Usecases:

* Used with `render` to request data from the server and dynamically update the route based on the response.
* Modify all routes, by adding a prefix.
* ...

Note：

1. The same applies to agreed routing. (NOTE not really sure what that means)
2. Mutate `routes` directly，do note return new route objects

### render

Used to override the rendering of entire app to the DOM.

Parameters：

* oldRender， `Function`，the initial render function，needs to  be called at lease once.

e.g. Delay rendering of the app by 1s,

```js
export function render(oldRender) {
  setTimeout(oldRender, 1000);
}
```

Usecases：

1. Check permissions before rendering the app. Show login if not authorized.

### onRouteChange

Used on initial load and route changes.

Parameters：

* Object
  * location：`Object`, provided by `history`
  * routes: `Array`, routing configuration
  * action: `PUSH|POP|REPLACE|undefined`，`undefined` on first load.

e.g.

```js
export function onRouteChange({ location, routes, action }) {
  bacon(location.pathname);
}
```

Usecases：

1. Navigation analytics.

Note：

1. Also runs on the first load，but `action` is `undefined`

### rootContainer

Used to wrap the root container，you can take a part, or a layer outside and so on.

Parameters：

* container，`ReactComponent`，React application root component

e.g.

```javascript
export function rootContainer(container) {
  const DvaContainer = require('@tmp/DvaContainer').default;
  return React.createElement(DvaContainer, null, container);
}
```

Usecases：

1. dva、intl, etc. need to have `Provider` in the outer layer.

### modifyRouteProps

Modify the props passed to the routing component

Parameters：

* props，`Object`，original props

* Object
  * route，`Object`，current routing configuration

e.g.

```js
export function modifyRouteProps(props, { route }) {
  return { ...props, foo: 'bar' };
}
```

Note：

1. Has to return new `props`

