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
Umi UI uses **antd 4.x** for development and external for antd.

Please refer to [antd 4.x documentation](https://4-0-prepare--ant-design.netlify.com/components/form-cn/) when developing plugin UI.
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

### 使用 TypeScript

如果是 TypeScript 用户，需将 `ui/index.js` 换成 `ui/index.tsx`。

同时修改 `.fatherrc.js` 配置文件：

```diff
- entry: 'ui/index.js',
+ entry: 'ui/index.tsx',
+ typescriptOpts: {
+   check: false,
+ },
```

在项目目录下增加 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "module": "esnext",
    "target": "esnext",
    "lib": ["esnext", "dom"],
    "sourceMap": true,
    "baseUrl": ".",
    "jsx": "react",
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "suppressImplicitAnyIndexErrors": true,
    "noUnusedLocals": true,
    "experimentalDecorators": true,
    "declaration": false
  }
}
```

在 `ui/index.tsx` 中引入 `umi-types` 类型，就可以有相关类型提示：

```diff
import { Button } from 'antd';
+ import { IUiApi } from 'umi-types';

- export default (api) => {
+ export default (api: IUiApi) => {
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
