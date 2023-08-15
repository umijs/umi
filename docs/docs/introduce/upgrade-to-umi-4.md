# Upgrading to Umi 4

## Upgrade Steps

Upgrading to Umi 4 can be completed with just a few simple steps, which can be summarized as "reinstall dependencies, modify configurations":

1. **Dependency Management**
2. **Update Commands**
3. **Unofficial Plugin Upgrades**
4. **Configuration Migration**
5. **Code-Level Changes**

### Dependency Management

In your project's `package.json`, you need to upgrade Umi and replace corresponding Umi plugins.

If your project was developed using the combination of `umi` + `@umijs/preset-react` in `umi@3`, you can directly upgrade to the new version using `@umijs/max`.

```diff
{
  "devDependencies": {
+   "@umijs/max": "^4.0.0",
-   "umi": "^3.0.0",
-   "@umijs/preset-react": "^1.2.2"
  }
}
```

Delete your `node_modules` folder and then run `npm install` to reinstall the dependencies.

### Update Commands

If you are using `@umijs/max`, you can replace the `umi` commands with `max` commands, such as `max dev`, `max build`, etc.

`umi@4` has moved some project initialization operations to the `setup` command, similar to the `umi g tmp` command in `umi@3`, which should be replaced with `umi setup`.

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

### Unofficial Plugin Upgrades

For some unofficial Umi plugins used in your project, please contact the respective authors to update them based on the [plugin API changes](../api/plugin-api).

During project migration, you can temporarily comment out the references to the corresponding plugin packages in your configurations. Remove dependencies starting with `umi-plugin-`, `@umijs/plugin-`, and `@umijs/preset-` from your `package.json`.

### Configuration Migration

**max's provided configuration items** in `config/config.ts`:

> Note that some previously implicitly enabled rules in certain plugins must now be explicitly configured in `umi@4`, as there is a desire for fewer "black boxes" in `umi@4`.

```typescript
import { defineConfig } from 'umi';

export default defineConfig({
  fastRefresh: true,
  dva: {},
  mock: {
    include: ['src/pages/**/_mock.ts'],
  },
  layout: {
    title: 'UmiJS',
    locale: true,
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
});
```

**Configuration items with differences** in `config/config.ts`:

```typescript
import { defineConfig } from 'umi';

export default defineConfig({
  fastRefresh: true, // Previously: fastRefresh: {}
  dva: {}, // Previous hmr parameter is no longer supported
});
```

### Code-Level Changes

Umi 4 upgrades `react-router@5` to `react-router@6`, so there are some usage differences in the routing-related APIs.

Props are now empty objects, and the following properties cannot be directly accessed from props: ![image](https://img.alicdn.com/imgextra/i4/O1CN01H9ScQv21ymaLkwZ8p_!!6000000007054-2-tps-1210-374.png)

#### children

```typescript
import { Outlet } from 'umi';
<Outlet />;
```

For global layouts, you need to modify them as follows:

For `layouts/index.tsx`:

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

For components that render route components using `React.cloneElement`, the transformation is as follows:

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

To access context data in components, use `useOutletContext`:

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

> It's recommended to use `useLocation` within components or hooks, and `window.location` for other parts of your code.

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

Or using `useLocation`:

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

For class component usage:

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

For more `Umi` related APIs, check the [API documentation](https://umijs.org/docs/api/api).

Note the differences in match data:

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

For more changes and API modifications, refer to [react-router@6](https://reactrouter.com/docs/en/v6/api#uselocation).

After completing the above steps, run `max dev` and access [http://localhost:8000](http://localhost:8000) to verify that all functionalities are as expected.



If your project cannot start properly, you might need to perform the following additional steps:

## Configuration Changes

TODO

## FAQ

### Unable to find query in the location?

The query in the location is no longer supported. Instead, you can use [search](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) in `window.location.search`.

```diff
- const { query } = history.location;
+ import { parse } from 'query-string';
+ const query = parse(history.location.search);
```

### Cannot find \*.d files or their references?

In `umi@3`, when using `import`, it would automatically find the corresponding `.d.ts` file with the same name. For example:

`import { ButtonType } from './button';`

While in `umi@4`, this will cause an error. To fix this, you need to explicitly reference the type:

```diff
- import { ButtonType } from './button';
+ import type { ButtonType } from './button.d';
```