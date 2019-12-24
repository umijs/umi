# @umijs/runtime

## Changes

- 所有使用从 umi 中 import，比如 `import { Link, Switch, dynamic, ... } from 'umi';`，提供 cjs 和 esm 两种格式
- history, plugin, routes 等内部方法获取也从 `umi` 从拿，比如 `import { getHistory, getPlugin, getRoutes } from 'umi';`
- no global variables

## Usage

umi.js

```js
import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import { render } from '@umijs/renderer-react';

const plugins = {};

async function clientRender() {
  render({
    routesElement: require('./router').default,
    rootElement: 'root',
    // do ssr if initial data
    initialProps: window.g_useSSR
      ? window.g_initialData
      : getInitialProps({
          routes: [],
          plugins,
        }),
    plugins,
  });
  const rootContainer = React.createElement(require('./router').default, props);
  ReactDOM.render(rootContainer, document.getElementById('root'));
}

clientRender();

if (module.hot) {
  module.hot.accept('./router', () => {
    clientRender();
  });
}
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
      // TODO: plugin
    });
  }, []);
  return <Router history={history}>{renderRoutes(routes, props)}</Router>;
};
```
