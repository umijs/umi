# @umijs/runtime

## Changes

- 所有使用从 umi 中 import，比如 `import { Link, Switch, dynamic, ... } from 'umi';`，提供 cjs 和 esm 两种格式
- history, plugin, routes 等内部方法获取也从 `umi` 拿，比如 `import { history, plugin, routes } from 'umi';`
- no global variables, 比如 `window.g_history`、`window.g_plugins` 和 `window.g_routes` 等
- 基于 hooks（TODO：考虑切换到 preact 等 react-like 库的可能性）
- [BREAK CHANGE] 删除 `api.addRendererWrapperWithModule()`，通过 runtime plugin 实现

## Usage

万物从 umi 中 import。

```js
import {
  // Router
  Link, Switch, Router, Route, useLocation, useHistory, useParams, ...,

  // Helpers
  dynamic,
  Plugin,
  createBrowserHistory, createHashHistory,

  // Internal refs
  history, plugin, routes,

  // Plugin extensions
  antd,
  useModel, useAccess, useAPI,
  ...,
} from 'umi';
```

## Runtime Flow

umi.js

```js
import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import { renderClient, renderServer } from '@umijs/renderer-react';

// init plugins
const plugins = {};

async function clientRender() {
  await renderClient({
    children: require('./router').default,
    rootElement: 'root',
    initialProps: window.g_useSSR && window.g_initialData,
    routes,
    plugins,
  });
}

clientRender();
if (module.hot) {
  module.hot.accept('./router', () => {
    clientRender();
  });
}

let serverRender;
if (!__IS_BROWSER) {
  serverRender = async (ctx = {}) => {
    return await renderServer({
      req,
      res,
      initialProps:
      routes,
      plugins,
    });
  };
}

export default { __IS_BROWSER ? null : serverRender };
```

router.js

```js
import { Router } from '@umijs/runtime';
import { renderRouters } from '@umijs/renderer-react';
import history from '@@/history';

const routes = [];

export default props => {
  useEffect(() => {
    return history.listen((location, action) => {
      // apply onRouteChange with plugin
    });
  }, []);
  return <Router history={history}>{renderRoutes(routes, props)}</Router>;
};
```

Notes:

1. 从 umi.js 中分离出 router.js，是为了 Hot Module Replacement

## 临时目录结构

```bash
+ .umi
    - umi.ts
    - umiExports.ts
    - routes.ts
    - router.ts
    - history.ts
    - polyfill.ts
```

Notes:

1. 单独拆一个 routes 出来，为了方便被通过 `import { routes } from 'umi';` 使用，并且比较独立，不用管生命周期
