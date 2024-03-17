---
order: 4
toc: content
translated_at: '2024-03-17T09:50:41.558Z'
---

# Upgrade to Umi 4

## Upgrade Steps

Upgrading to Umi 4 can be completed in just a few easy steps, which can simply be described as - "Reinstall dependencies, modify configuration":

1. **Dependency Handling**
2. **Start Command**
3. **Upgrading Non-Official Plugins**
4. **Configuration Layer Migration**
5. **Code Layer Modifications**

### Dependency Handling

Your project's `package.json` needs to upgrade Umi and replace the corresponding Umi plugins.

If `umi@3` was developed using a combination of `umi` + `@umijs/preset-react`, then you can directly upgrade using the new `max`.

```diff
{
  "devDependencies": {
+   "@umijs/max": "^4.0.0",
-   "umi": "^3.0.0",
-   "@umijs/preset-react": "^1.2.2"
  }
}
```

Delete `node_module`, then execute `npm install` to reinstall dependencies.

### Start Command

If using `@umijs/max`, you can replace `umi` with the `max` command, such as `max dev`, `max build`, etc.

`umi@4` moved some pre-project operations to the `setup` command, such as `umi g tmp` commands in umi@3, which need to be replaced with `umi setup`

`package.json`

```diff
{
  "scripts": {
-    "build": "umi build",
+    "build": "max build",
-    "postinstall": "umi g tmp",
+    "postinstall": "max setup",
-    "start": "umi dev",
+    "start": "max dev",
  }
}
```

### Upgrading Non-Official Plugins

For some non-Umi official Umi plugins used in the project, please contact the relevant authors to update them in a timely manner according to [plugin api changes](../api/plugin-api).

When migrating the project, you can first turn off references to the corresponding plugin packages, such as temporarily commenting out the `plugins` in the configuration, and removing all dependencies starting with `umi-plugin-`, `@umijs/plugin-`, and `@umijs/preset-` in package.json.

### Configuration Layer Migration

**Configurations provided by max** are as follows in `config/config.ts`:

> It’s worth noting that some rules that were conventionally enabled by plugins need to be explicitly configured in `umi@4`, as we want less 'black box' behavior in `umi@4`.

```typescript
import { defineConfig, utils } from 'umi';

export default defineConfig({
  model: {},
  antd: {},
  request: {},
  initialState: {},
  mock: {
    include: ['src/pages/**/_mock.ts'],
  },
  dva: {},
  layout: {
    // https://umijs.org/docs/max/layout-menu#configuration-at-build-time
    title: 'UmiJS',
    locale: true,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
});
```

**Configurations with differences** are as follows in `config/config.ts`:

```typescript
import { defineConfig, utils } from 'umi';

export default defineConfig({
-  fastRefresh: {},
+  fastRefresh: true,
  dva: {
   // The parameter hmr is no longer supported
-    hmr: true,
   },
// Default webpack5
-   webpack5: {},
})
```

### Code Layer Modifications

Umi 4 upgrades `react-router@5` to `react-router@6`, so there are some differences in the use of related api.

Props are empty objects by default, the following properties cannot be taken directly from props ![image](https://img.alicdn.com/imgextra/i4/O1CN01H9ScQv21ymaLkwZ8p_!!6000000007054-2-tps-1210-374.png)

#### children

```typescript
import { Outlet } from 'umi';
<Outlet />;
```

Mainly needs modifications in the global layout

Such as `layouts/index.tsx`:

```diff
import React from 'react';
+ import { Outlet } from 'umi';

export default function Layout(props) {
  return (
    <div>
-      { props.children }
+      <Outlet />
    </div>
  );
}
```

Change the way that route components rendered with `React.cloneElement`, for example:

```diff
import React from 'react';
+ import { Outlet } from 'umi';

export default function RouteComponent(props) {
  return (
    <div>
-      { React.cloneElement(props.children, { someProp: 'p1' }) }
+      <Outlet context={{ someProp: 'p1' }} />
    </div>
  );
}
```

Change components to get values from `useOutletContext`

```diff
import React from 'react';
+ import { useOutletContext } from 'umi';

- export function Comp(props){
+ export function Comp() {
+   const props = useOutletContext();

  return props.someProp;
}
```

#### history

```diff
+ import { history } from 'umi';
export default function Page(props) {
  return (
    <div onClick={()=>{
-          props.history.push('list');
+          history.push('list');
    }}>
    </div>
  );
}
```

#### location

> It’s recommended to use useLocation in components or hooks, and window.location elsewhere.

```diff
export default function Page(props) {
+  const { location } = window;
  return (
    <div>
-     { props.location }
+     { location }
    </div>
  );
}
```

Or

```diff
+ import { useLocation } from 'umi';
export default function Page(props) {
+    let location = useLocation();
  return (
    <div>
-     { props.location }
+     { location }
    </div>
  );
}
```

#### match

```diff
+ import { useMatch } from 'umi';
export default function Page(props) {
+ const match = useMatch({ path: 'list/search/:type' });
  return (
    <div>
-     { props.match }
+     { match }
    </div>
  );
}
```

In the use of class component components:

```diff
import { matchPath } from 'umi';
class Page extends Component {
+  match = matchPath({ path: 'list/search/:type' }, window.location.pathname);
  state = {}
  render() {
    return (
      <div>
-        {this.props.match.type}
+        {this.match.type} 
      </div>
    )
  }
}
```
For more `Umi` related [api](https://umijs.org/docs/api/api)

Pay attention to the difference in match data:

```
// match v5
isExact: true
params: {}
path: "/users/abc"
url: "/users/abc"

// match v6
params:{  }
pathname: "/list/search/articles"
pathnameBase: "/list/search/articles"
pattern: {path: 'list/search/:type'}
```

For more changes and API updates, please refer to [react-router@6](https://reactrouter.com/docs/en/v6/api#uselocation)

After completing the above operations, execute `max dev`, and visit [http://localhost:8000](http://localhost:8000), please verify all functions meet expectations.

If your project cannot start normally, you may need to do the following:

## Configuration Changes

TODO

## FAQ

### Can't find query in location?

Query in location is no longer supported, later it’s recommended to use [search](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

```diff
- const { query } = history.location;
+ import { parse } from 'query-string';
+ const query = parse(history.location.search);
```

### Can't find *.d file, or its reference

In `umi@3`, importing would automatically find the corresponding `.d.ts` file, such as:

`import { ButtonType } from './button';`

If there is a `.button.d.ts` file, it will correctly execute in `umi@3`, but it will cause an error in umi@4, you may need more standardized type references.

```diff
- import { ButtonType } from './button';
+ import type { ButtonType } from './button.d';
```
