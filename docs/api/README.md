---
nav:
  title: API
toc: menu
---

# API


## Basic API

### dynamic

Load component dynamically on demand.

**Common use case**：To reduce first screen download cost, component with huge implementation / dependency can be split in differnet bundle. Let's say we have component `HugeA` with huge 3rd-party dependency, and this `HugeA` will not be used in first screen, that means it can be split out. We shall use `dynamic` in this case.

**Why use `dynamic`**：It includes functions like `split chunks`, `async chunks loader`, `loading state maintainance`, so developers is free from those technical details and is able to focus their business.

Usually work with [dynamic import syntax](https://github.com/tc39/proposal-dynamic-import).


**Create dynamic component**

```js
import { dynamic } from 'umi';

export default dynamic({
  loader: async function() {
    // webpackChunkName tells webpack create separate bundle for HugeA
    const { default: HugeA } = await import(/* webpackChunkName: "external_A" */ './HugeA');
    return HugeA;
  },
});
```

**Use dynamic component**

```js
import React from 'react';
import AsyncHugeA from './AsyncHugeA';

// import as normal component
// with below benefits out of box:
// 1. download bundle automatically
// 2. give a loading splash while downloading (customizable)
// 3. display HugeA whenever component downloaded
export default () => {
  return <AsyncHugeA />;
}
```

### history

Get the current route information.

```js
import { history } from 'umi';

// history - the number of the entity in the router stack
console.log(history.length);

// There are three types - PUSH, REPLACE and POP when the action of the history triggered
console.log(history.action);

// location 对象，包含 pathname、search 和 hash
console.log(history.location.pathname);
console.log(history.location.search);
console.log(history.location.hash);
```

Route redirection

```js
import { history } from 'umi';

// Redirect to the specified page
history.push('/list');

// Redirect to the specified with parameters
history.push('/list?a=b');
history.push({
  pathname: '/list',
  query: {
    a: 'b',
  },
});

// Return back to previous route
history.goBack();
```

Listen the location changing

```js
import { history } from 'umi';

const unlisten = history.listen((location, action) => {
  console.log(location.pathname);
});
unlisten();
```

### plugin

The plugin interface at run time is that a plugin system of the Umi is running in the browser.

Example as follow：

```js
import { plugin, ApplyPluginsType } from 'umi';

// Register plugin
plugin.register({
  apply: { dva: { foo: 1 } },
  path: 'foo',
});
plugin.register({
  apply: { dva: { bar: 1 } },
  path: 'bar',
});

// Execute plugin
// Result: { foo: 1, bar: 1 }
plugin.applyPlugins({
  key: 'dva',
  type: ApplyPluginsType.modify,
  initialValue: {},
  args: {},
  async: false,
});
```

The parameters contains：

* **key**，key placeholder
* **type**，the execution type. detail at [ApplyPluginsType](#ApplyPluginsType)
* **initialValue**，initial value
* **args**，parameters
* **async**，asynchronous action or not and return <Promise>

### ApplyPluginsType

The Enum of the execting plugins at the run time, it contains three attributes:

* **compose**，Merge multiple functions which decide the order of the execution
* **modify**，The modifcation value
* **event**，It a independence value to execute an event

## Router

### Link

Provides declarative, accessible navigation around your application.

```tsx
import { Link } from 'umi';

export default () => {
  return (
    <div>
      {/* A string representation of the Link location */}
      <Link to="/about">About</Link>

      {/* A string representation of the Link location,
          created by concatenating the location’s pathname,
          search, and hash properties
      */}
      <Link to="/courses?sort=name">Courses</Link>

      {/* An object representation of the Link location */}
      <Link
        to={{
          pathname: "/list",
          search: "?sort=name",
          hash: "#the-hash",
          state: { fromDashboard: true },
        }}
      >
        List
      </Link>

      {/* A function to which current location is 
          passed as an argument and which should
          return location representation as a string
          or as an object
      */}
      <Link
        to={location => {
          return { ...location, pathname: "/profile" };
        }}
      />

      {/* When true, clicking the link will replace
          the current entry in the history stack
          instead of adding a new one
      */}
      <Link to="/courses" replace />

      {/* 
          forward reference
      */}
      <Link
        to="/courses"
        innerRef={node => {
          // `node` refers to the mounted DOM element
          // or null when unmounted
        }}
      />
    </div>
  );
};
```

### NavLink

A special version of the `<Link>` that will add styling attributes to the rendered element when it matches the current URL.

```tsx
import { NavLink } from 'umi';

export default () => {
  return (
    <div>
      {/* same as Link */}
      <NavLink to="/about">About</NavLink>

      {/* The class to give the element when it is active.
          The default given class is active.
          This will be joined with the className prop
      */}
      <NavLink to="/faq" activeClassName="selected">
        FAQs
      </NavLink>

      {/* The styles to apply to the element when it is active */}
      <NavLink
        to="/faq"
        activeStyle={{
          fontWeight: "bold",
          color: "red",
        }}
      >
        FAQs
      </NavLink>

      {/* When true, the active class/style will only be applied
          if the location is matched exactly.
      */}
      <NavLink exact to="/profile" activeClassName="selected">
        Profile
      </NavLink>

      {/* When true, the trailing slash on a location’s pathname
          will be taken into consideration when determining if
          the location matches the current URL.
      */}
      <NavLink strict to="/profile/" activeClassName="selected">
        Profile
      </NavLink>

      {/* A function to add extra logic for determining whether
          the link is active. This should be used if you want to
          do more than verify that the link’s pathname matches
          the current URL’s pathname.
      */}
      <NavLink
        to="/profile"
        exact
        activeClassName="selected"
        isActive={(match, location) => {
          if (!match) {
            return false;
          }
          return location.search.includes("name");
        }}
      >
        Profile
      </NavLink>
    </div>
  );
};
```

### Prompt

Used to prompt the user before navigating away from a page. When your application enters a state that should prevent the user from navigating away (like a form is half-filled out), render a `<Prompt>`.

```tsx
import { Prompt } from 'umi';

export default () => {
  return (
    <div>
      {/* The message to prompt the user with when
          they try to navigate away.
      */}
      <Prompt message="Will you leave?" />

      {/* Will be called with the next location and action the
          user is attempting to navigate to. Return a string
          to show a prompt to the user or true to allow the 
          transition
      */}
      <Prompt
        message={location => {
          return location.pathname !== "/" ? true : `Are are sure you want to back to home page?`;
        }}
      />

      {/* Instead of conditionally rendering a <Prompt> behind a guard,
          you can always render it but pass when={true} or when={false}
          to prevent or allow navigation accordingly.
      */}
      <Prompt when={formIsHalfFilledOut} message="Are you sure?" />
    </div>
  );
};
```

### withRouter

You can get access to the `history`, `location`, `match` objects via the `withRouter` higher-order component. `withRouter` will pass updated `match`, `location`, and `history` props to the wrapped component whenever it renders

```tsx
import { withRouter } from "umi";

export default withRouter(({ history, location, match }) => {
  return (
    <div>
      <ul>
        <li>history: {history.action}</li>
        <li>location: {location.pathname}</li>
        <li>match: {`${match.isExact}`}</li>
      </ul>
    </div>
  );
});
```

### useHistory

The `useHistory` hook gives you access to the `history` instance that you may use to navigate.

```tsx
import { useHistory } from "umi";

export default () => {
  const history = useHistory()
  return (
    <div>
      <ul>
        <li>history: {history.action}</li>
      </ul>
    </div>
  );
};
```

### useLocation

The `useLocation` hook returns the `location` object that represents the current URL. You can think about it like a `useState` that returns a new location whenever the URL changes.

```tsx
import { useLocation } from "umi";

export default () => {
  const location = useLocation()
  return (
    <div>
      <ul>
        <li>location: {location.pathname}</li>
      </ul>
    </div>
  );
};
```

### useParams

`useParams` returns an object of key/value pairs of URL parameters. Use it to access `match.params` of the current route.

```tsx
import { useParams } from "umi";

export default () => {
  const params = useParams()
  return (
    <div>
      <ul>
        <li>params: {JSON.stringify(params)}</li>
      </ul>
    </div>
  );
};
```

### useRouteMatch

The `useRouteMatch` hook attempts to match the current URL in the same way that a Route would. It’s mostly useful for getting access to the match data without actually rendering a `<Route />`

```tsx
import { useRouteMatch } from "umi";

export default () => {
  const match = useRouteMatch()
  return (
    <div>
      <ul>
        <li>match: {JSON.stringify(match.params)}</li>
      </ul>
    </div>
  );
};
```

## node

> A secondary interface do not exist in the keywords - `modules` but export from the keywords - `main` of the `package.json`.

### Service

The Service function of the Umi core - it just used for testing or low level Umi command.

### utils

The `utils` function is same as the `api.utils`, they are from the same low level library and used by the plugin.

### defineConfig

The parameter used to validate and prompt user their configuration types. More detail at [配置#TypeScript 提示](TODO)。

## The definition of the plugin type
TODO

### IApi
TODO

### IConfig
TODO
