---
nav:
  title: API
toc: menu
---

# API

## 基本 API

### dynamic

动态加载组件。

**常见使用场景**：组件体积太大，不适合直接计入 bundle 中，以免影响首屏加载速度。例如：某组件 HugeA 包含巨大的实现 / 依赖了巨大的三方库，且该组件 HugeA 的使用不在首屏显示范围内，可被单独拆出。这时候，`dynamic` 就该上场了。

**为什么使用 `dynamic`**：封装了使用一个异步组件需要做的状态维护工作，开发者可以更专注于自己的业务组件开发，而不必关心 code spliting、async module loading 等等技术细节。

通常搭配 [动态 import 语法](https://github.com/tc39/proposal-dynamic-import) 使用。

**封装一个异步组件**

```js
import { dynamic } from 'umi';

export default dynamic({
  loader: async function () {
    // 这里的注释 webpackChunkName 可以指导 webpack 将该组件 HugeA 以这个名字单独拆出去
    const { default: HugeA } = await import(
      /* webpackChunkName: "external_A" */ './HugeA'
    );
    return HugeA;
  },
});
```

**使用异步组件**

```js
import React from 'react';
import AsyncHugeA from './AsyncHugeA';

// 像使用普通组件一样即可
// dynamic 为你做:
// 1. 异步加载该模块的 bundle
// 2. 加载期间 显示 loading（可定制）
// 3. 异步组件加载完毕后，显示异步组件
export default () => {
  return <AsyncHugeA />;
};
```

### history

可用于获取当前路由信息，

```js
import { history } from 'umi';

// history 栈里的实体个数
console.log(history.length);

// 当前 history 跳转的 action，有 PUSH、REPLACE 和 POP 三种类型
console.log(history.action);

// location 对象，包含 pathname、search 和 hash
console.log(history.location.pathname);
console.log(history.location.search);
console.log(history.location.hash);
```

可用于路由跳转，

```js
import { history } from 'umi';

// 跳转到指定路由
history.push('/list');

// 带参数跳转到指定路由
history.push('/list?a=b');
history.push({
  pathname: '/list',
  query: {
    a: 'b',
  },
});

// 跳转到上一个路由
history.goBack();
```

也可用于路由监听，

```js
import { history } from 'umi';

const unlisten = history.listen((location, action) => {
  console.log(location.pathname);
});
unlisten();
```

### plugin

> 主要在插件利用，项目代码中一般用不到。

运行时插件接口，是 Umi 内置的跑在浏览器里的一套插件体系。

比如：

```js
import { Plugin, ApplyPluginsType } from 'umi';

// 注册插件
Plugin.register({
  apply: { dva: { foo: 1 } },
  path: 'foo',
});
Plugin.register({
  apply: { dva: { bar: 1 } },
  path: 'bar',
});

// 执行插件
// 得到 { foo: 1, bar: 1 }
Plugin.applyPlugins({
  key: 'dva',
  type: ApplyPluginsType.modify,
  initialValue: {},
  args: {},
  async: false,
});
```

参数属性包含：

- **key**，坑位的 key
- **type**，执行方式类型，详见 [ApplyPluginsType](#ApplyPluginsType)
- **initialValue**，初始值
- **args**，参数
- **async**，是否异步执行且返回 Promise

### ApplyPluginsType

> 主要在插件利用，项目代码中一般用不到。

运行时插件执行类型，enum 类型，包含三个属性：

- **compose**，用于合并执行多个函数，函数可决定前序函数的执行时机
- **modify**，用于修改值
- **event**，用于执行事件，前面没有依赖关系

## 路由

### Link

链接组件，例如：

```tsx
import { Link } from 'umi';

export default () => {
  return (
    <div>
      {/* 点击跳转到指定 /about 路由 */}
      <Link to="/about">About</Link>

      {/* 点击跳转到指定 /courses 路由，
          附带 query { sort: 'name' }
      */}
      <Link to="/courses?sort=name">Courses</Link>

      {/* 点击跳转到指定 /list 路由，
          附带 query: { sort: 'name' }
          附带 hash: 'the-hash'
          附带 state: { fromDashboard: true }
      */}
      <Link
        to={{
          pathname: '/list',
          search: '?sort=name',
          hash: '#the-hash',
          state: { fromDashboard: true },
        }}
      >
        List
      </Link>

      {/* 点击跳转到指定 /profile 路由，
          附带所有当前 location 上的参数
      */}
      <Link
        to={(location) => {
          return { ...location, pathname: '/profile' };
        }}
      />

      {/* 点击跳转到指定 /courses 路由，
          但会替换当前 history stack 中的记录
      */}
      <Link to="/courses" replace />

      {/* 
          innerRef 允许你获取基础组件（这里应该就是 a 标签或者 null）
      */}
      <Link
        to="/courses"
        innerRef={(node) => {
          // `node` refers to the mounted DOM element
          // or null when unmounted
        }}
      />
    </div>
  );
};
```

### NavLink

特殊版本的 `<Link />` 。当指定路由（`to=指定路由`）命中时，可以附着特定样式。

```tsx
import { NavLink } from 'umi';

export default () => {
  return (
    <div>
      {/* 和 Link 等价 */}
      <NavLink to="/about">About</NavLink>

      {/* 当前路由为 /faq 时，附着 class selected */}
      <NavLink to="/faq" activeClassName="selected">
        FAQs
      </NavLink>

      {/* 当前路由为 /faq 时，附着 style */}
      <NavLink
        to="/faq"
        activeStyle={{
          fontWeight: 'bold',
          color: 'red',
        }}
      >
        FAQs
      </NavLink>

      {/* 当前路由完全匹配为 /profile 时，附着 class */}
      <NavLink exact to="/profile" activeClassName="selected">
        Profile
      </NavLink>

      {/* 当前路由为 /profile/ 时，附着 class */}
      <NavLink strict to="/profile/" activeClassName="selected">
        Profile
      </NavLink>

      {/* 当前路由为 /profile，并且 query 包含 name 时，附着 class */}
      <NavLink
        to="/profile"
        exact
        activeClassName="selected"
        isActive={(match, location) => {
          if (!match) {
            return false;
          }
          return location.search.includes('name');
        }}
      >
        Profile
      </NavLink>
    </div>
  );
};
```

### Prompt

提供一个用户离开页面时的提示选择。

```tsx
import { Prompt } from 'umi';

export default () => {
  return (
    <div>
      {/* 用户离开页面时提示一个选择 */}
      <Prompt message="你确定要离开么？" />

      {/* 用户要跳转到首页时，提示一个选择 */}
      <Prompt
        message={(location) => {
          return location.pathname !== '/' ? true : `您确定要跳转到首页么？`;
        }}
      />

      {/* 根据一个状态来确定用户离开页面时是否给一个提示选择 */}
      <Prompt when={formIsHalfFilledOut} message="您确定半途而废么？" />
    </div>
  );
};
```

### withRouter

高阶组件，可以通过 `withRouter` 获取到 `history`、`location`、`match` 对象

```tsx
import { withRouter } from 'umi';

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

hooks，获取 `history` 对象

```tsx
import { useHistory } from 'umi';

export default () => {
  const history = useHistory();
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

hooks，获取 `location` 对象

```tsx
import { useLocation } from 'umi';

export default () => {
  const location = useLocation();
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

hooks，获取 `params` 对象。 `params` 对象为动态路由（例如：`/users/:id`）里的参数键值对。

```tsx
import { useParams } from 'umi';

export default () => {
  const params = useParams();
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

获取当前路由的匹配信息。

```tsx
import { useRouteMatch } from 'umi';

export default () => {
  const match = useRouteMatch();
  return (
    <div>
      <ul>
        <li>match: {JSON.stringify(match.params)}</li>
      </ul>
    </div>
  );
};
```

## node 侧接口

> 通过 package.json 的 main 字段露出，且不存在于 modules 字段里。

### Service

Umi 内核的 Service 方法，用于测试，或调用 Umi 底层命令。

### utils

utils 方法，给插件使用，和插件里的 api.utils 是同一个底层库。

### defineConfig

用于校验和提示用户配置类型，详见[配置#TypeScript 提示](../config#typescript-提示)。

## 插件类型定义

### IApi

### IConfig
