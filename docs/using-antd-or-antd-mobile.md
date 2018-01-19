---
id: using-antd-or-antd-mobile
title: Using antd and antd-mobile
---

umi 内置了 antd 和 antd-mobile，以及 babel-plugin-import 插件，可无需安装依赖而直接使用。

## 引入组件

```js
import { Button } from 'antd';

export default function() {
  return (
    <div>
      <Button type="primary">Hello umi</Button>
    </div>
  );
}
```
