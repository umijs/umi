---
sidebarDepth: 3
---

# UI 插件开发

<Badge text="2.9.0+ 中支持"/>

## 初始化插件

你可以通过 [create-umi](https://github.com/umijs/create-umi) 快速创建一个 UI 插件：

```bash
# npx create-umi --type=plugin
$ yarn create umi --type=plugin
```

在最后一步 `是否有 Umi UI` 选项中选择 `Y`，就创建了一个有 UI 交互的 umi 插件。

> 如果是 TypeScript 用户，创建时在 TypeScript 选项输入 Y

初始化 UI 插件后，目录结构如下：

```
- root
  - src              // 服务端 / Node 端代码
    - index.js       // 插件入口
  - ui
    - index.js       // 客户端 UI 入口
  - package.json     // 插件依赖等信息
  - example          // UI 测试目录
```

在该插件目录中，安装依赖。

```bash
# npm install
$ yarn install
```

## 开发插件

与正常插件一样，安装依赖后，执行以下命令：

```bash
# npm run build && npm run start
$ yarn build && yarn start
```

此时，就能看到 UmiUI 启动了。

![](https://gw.alipayobjects.com/zos/antfincdn/O5Hjz1o4n8/c8cd6adb-9678-433c-b809-8be8b6f5ea6e.png)

其中 `example` 项目就是测试项目，点击进入，会看到 UI 插件在左侧菜单。

![](https://gw.alipayobjects.com/zos/antfincdn/JAgV0HTUZn/702548da-6a1b-404c-bac6-3dd321dfc2b0.png)

`ui/index.js` 负责 UI 插件的展示，你可以使用 [Umi UI 客户端 API](https://umijs.org/plugin/umi-ui.html#%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%8E%A5%E5%8F%A3) ，开发插件。

::: warning
Umi UI 使用 **antd 4.x** 进行开发，并对 antd 进行 `external`。

开发插件 UI 时请参阅 [antd 4.x 文档](https://4-0-prepare--ant-design.netlify.com/components/form-cn/) 进行开发。
:::

```js
import { Button } from 'antd';

export default (api) => {
  const { callRemote } = api;

  function PluginPanel() {
    return (
      <div style={{ padding: 20 }}>
        <Button
          type="primary"
          onClick={async () => {
            const { data } = await callRemote({
              type: 'org..umi-dev.test',
            });
            alert(data);
          }}
        >Test</Button>
      </div>
    );
  }

  api.addPanel({
    title: 'umi-dev',
    path: '/umi-dev',
    icon: 'home',
    component: PluginPanel,
  });
}
```

![](https://gw.alipayobjects.com/zos/antfincdn/tos3ooP0Dy/e985c7e0-09b7-49e1-965c-d2032a4783c5.png)

### 管理插件依赖
UI 中使用到的 npm 包模块，放在 `package.json` 中的 `devDependencies` 中，避免用户安装不必要的依赖。

> 因为 UI 插件包执行的 umd 编译，会将依赖的模块编译进 umd 文件中。

例如：

```js
// ui/index.js
// antd 4.x Icon
import { Plus } from '@ant-design/icons';
import classnames from 'classnames';

import styles from './index.module.less'

export default (api) => {
  function PluginPanel() {
    const wrapperCls = classnames(styles.bar, styles.foo);
    return (
      <div className={wrapperCls}>
        <Plus />
      </div>
    );
  }

  api.addPanel({
    title: 'umi-dev',
    path: '/umi-dev',
    icon: 'home',
    component: PluginPanel,
  });
}
```

`package.json`

> 因为 Umi UI 对 `react`、`react-dom`、`antd` 库做了 [external](https://webpack.js.org/configuration/externals/)，开发插件包时，`peerDependencies` 里的包不会构建到 `umd` 中，减少插件额外的重复依赖。

```diff
{
  "peerDependencies": {
    "antd": "4.x",
    "react": "16.8.6",
    "react-dom": "16.8.6",
    "umi": "2.x || ^2.9.0-0"
  },
  "dependencies": {
-   "classnames": "^2.2.6",
-   "@ant-design/compatible": "^0.0.1-alpha.1"
  },
  "devDependencies": {
+   "classnames": "^2.2.6",
+   "@ant-design/compatible": "^0.0.1-alpha.1"
  }
}
```

### 使用 Umi UI 主题

Umi UI 提供了一套 antd 主题变量，可供第三方组件库在非 Umi UI 运行环境下，开发插件。

#### 使用方式

安装 `umi-ui-theme` 主题包，现只提供了 `dark` 暗色主题。

```js
// .umirc.js
import { dark, light } from 'umi-ui-theme';

{
  theme: dark
}
```

在 less 文件中引入，可使用里面的 less 变量。

```less
// dark
@import "~@umi-ui-theme/dark.less";

// light
@import "~@umi-ui-theme/light.less";
```


![](https://gw.alipayobjects.com/zos/antfincdn/z6VWQcplHx/9c78b96e-5ca9-407c-83d7-2caf5801c7ea.png)
