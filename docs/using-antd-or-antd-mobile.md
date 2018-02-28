---
id: using-antd-or-antd-mobile
title: 使用 antd 或 antd-mobile
---

umi 内置了 [antd](https://ant.design/) 和 [antd-mobile](https://mobile.ant.design/)，并且配置了 babel-plugin-import 插件做按需引用，所以你无需关心依赖和配置，直接用即可。

先引用，

```js
import { Button } from 'antd';
```

或者

```js
import { Button } from 'antd-mobile';
```

然后直接使用，

```js
<Button type="primary">Hi umi</Button>
```

## 使用 antd 组件

继续我们之前的例子，修改 pages/index.js，替换为：

```js
import Link from 'umi/link';
import { Button } from 'antd';
import styles from './index.css';
import '../global.less';

export default () => <div className={styles.normal}>
  Index Page
  <br />
  <Link to="/list"><Button type="primary">go to /list</Button></Link>
</div>
```

效果：

<img src="https://gw.alipayobjects.com/zos/rmsportal/RmXJNQcKLGTgHGLmZrVs.png" width="450" height="414" style="margin-left:0;" />

## 自定义 antd 或 antd-mobile 版本

如果在 `package.json` 存在 antd 或 antd-mobile 的依赖，则会优先使用其指定的版本。

## 参考

* https://ant.design/
* https://mobile.ant.design/
