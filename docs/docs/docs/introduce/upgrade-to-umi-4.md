---
order: 4
toc: content
---
# 升级到 Umi 4

## 升级步骤

升级到 Umi 4 只需要简单的几步操作就能完成，简单的描述整个过程就是 - “重装依赖，修改配置”：

1. **依赖处理**
2. **启动命令**
3. **非官方插件升级**
4. **配置层迁移**
5. **代码层修改**

### 依赖处理

项目的 `package.json` 需要升级 Umi，并替换掉对应的 Umi 插件。

如果 `umi@3` 中是使用 `umi` + `@umijs/preset-react` 的组合进行开发的，那可以直接使用新版的 `max` 直接升级。

```diff
{
  "devDependencies": {
+   "@umijs/max": "^4.0.0",
-   "umi": "^3.0.0",
-   "@umijs/preset-react": "^1.2.2"
  }
}
```

删除 `node_module`，执行下 `npm install` 重装依赖。

### 启动命令

如果使用了 `@umijs/max` 可以使用 `max` 命令来替换 `umi`，`max dev`，`max build` 等。

`umi@4` 将一些项目前置操作放到了 `setup` 命令中，如 umi@3 中的 `umi g tmp` 等命令，需要使用 `umi setup` 替换

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

### 非官方插件升级

在项目中用到的一些非 Umi 官方提供的 Umi 插件，请联系相关作者及时根据[插件 api 变动](../api/plugin-api)。

项目迁移时可先关闭对相应插件包的引用，如临时注释配置中的 `plugins`，移除 package.json 中以 `umi-plugin-`，`@umijs/plugin-` 和 `@umijs/preset-` 开头的所有依赖。

### 配置层迁移

**max 提供的的配置项**如下 `config/config.ts` ：

> 需要注意的是，之前的一些插件约定开启的规则，在 `umi@4` 中几乎都要通过显式的配置开启，因为希望在 `umi@4` 中有更少的“黑盒”。

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
    // https://umijs.org/docs/max/layout-menu#构建时配置
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

**存在差异的配置项**如下 `config/config.ts` ：

```typescript
import { defineConfig, utils } from 'umi';

export default defineConfig({
-  fastRefresh: {},
+  fastRefresh: true,
  dva: {
   // 不再支持 hmr 这个参数
-    hmr: true,
   },
// 默认 webpack5
-   webpack5: {},
})
```

### 代码层修改

Umi 4 中将 `react-router@5` 升级到 `react-router@6`，所以路由相关的一些 api 存在着使用上的差异。

props 默认为空对象，以下属性都不能直接从 props 中取出 ![image](https://img.alicdn.com/imgextra/i4/O1CN01H9ScQv21ymaLkwZ8p_!!6000000007054-2-tps-1210-374.png)

#### children

```typescript
import { Outlet } from 'umi';
<Outlet />;
```

主要在全局 layout 中需要修改

如 `layouts/index.tsx`：

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

使用了 `React.cloneElement` 方式渲染的路由组件改造，示例

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

组件改成从 `useOutletContext` 取值

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

> 建议组件或 hooks 里用 useLocation 取，其他地方就用 window.location 获取。

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

或者

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

在 class component 组件中的使用方式:

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
更多 `Umi` 相关 [api](https://umijs.org/docs/api/api)

需要注意 match 数据的差异：

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

更多改动和 api 变更，请查阅 [react-router@6](https://reactrouter.com/docs/en/v6/api#uselocation)

完成以上操作后，执行下 `max dev`，访问 [http://localhost:8000](http://localhost:8000)，请验证所有功能都符合预期。

如果你的项目无法正常启动，你可能还需要做如下操作：

## 配置变更

TODO

## FAQ

### location 中的 query 找不到？

location 中的 query 不再支持了，后续推荐用 [search](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

```diff
- const { query } = history.location;
+ import { parse } from 'query-string';
+ const query = parse(history.location.search);
```

### \*.d 文件找不到，或者它的引用找不到

在 `umi@3` 中通过 `import` 会自动找到同名的 `.d.ts` 文件，如：

`import { ButtonType } from './button';`

如果存在 `.button.d.ts` 文件，在 `umi@3` 中会正确执行，但是在 umi@4 中会发生报错，你可能需要更加规范的引用类型。

```diff
- import { ButtonType } from './button';
+ import type { ButtonType } from './button.d';
```
