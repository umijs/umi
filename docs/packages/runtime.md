# @umijs/runtime

## Change

- 所有使用从 umi 中 import，比如 `import { Link, Switch, dynamic, ... } from 'umi';`，提供 cjs 和 esm 两种格式

## Usage

```js
import { render } from '@umijs/renderer-react';
render({
  routes,
  documentElement,
});
```
