---
sidebarDepth: 3
---

# UI plugin development

<Badge text="2.9.0+"/>

## Initialization the plugin

You can quickly create a UI plugin via [create-umi](https://github.com/umijs/create-umi):

```bash
# npx create-umi --type=plugin
$ yarn create umi --type=plugin
```

In the final step, whether or not you have `Y` in the Umi UI` option, you have created a umi plugin with UI interaction.

After initializing the UI plugin, the directory structure is as follows:

```
- root
  - src              // server-side code
    - index.js       // plugin entry
  - ui
    - index.js       // client UI entry
  - package.json     // plugin dependencies and other information
  - example          // UI test directory
```

In the plugin directory, install dependencies.

```bash
# npm install
$ yarn install
```

## Development plugin

As with the normal plugin, after installing the dependencies, execute the following command:

```bash
# npm run build && npm run start
$ yarn build && yarn start
```

At this point, you can see that UmiUI is up.

![](https://gw.alipayobjects.com/zos/antfincdn/O5Hjz1o4n8/c8cd6adb-9678-433c-b809-8be8b6f5ea6e.png)

The `example` project is the test project. Click on the entry and you will see the UI plugin on the left menu.

![](https://gw.alipayobjects.com/zos/antfincdn/JAgV0HTUZn/702548da-6a1b-404c-bac6-3dd321dfc2b0.png)

`ui/index.js` is responsible for the display of the UI plugin. You can use the [Umi UI Client API](https://umijs.org/plugin/umi-ui.html#%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%8E%A5%E5%8F%A3), development plugin.

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

![](https://gw.alipayobjects.com/zos/antfincdn/tos3ooP0Dy/e985c7e0-09b7-49e1-965c-d2032a4783c5.png)


### Manage the plugin dependencies
The npm package module used in the UI is placed in `devDependencies` in `package.json` to prevent users from installing unnecessary dependencies.

> Because of the umd compilation performed by the UI plugin package, the dependent modules are compiled into the umd file.

E.g:

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

> Because Umi UI does [external](https://webpack.js.org/configuration/externals/) for `react`, `react-dom`, `antd` libraries, when developing plugin packages, in `peerDependencies` Packages are not built into `umd`, reducing the extra repetitive dependencies of the plugin.

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



### Use Umi UI theme

Umi UI provides a set of antd theme variables that third-party component libraries can use to develop plug-ins in non-Umi UI runtime environments.

#### Usage

Install the `umi-ui-theme` theme pack, now only the `dark` dark theme is available.

```js
// .umirc.js
import { dark, light } from 'umi-ui-theme';

{
  theme: dark
}
```

Introduced in the less file, you can use the less variable inside.

```less
// dark
@import "~@umi-ui-theme/dark.less";

// light
@import "~@umi-ui-theme/light.less";
```

![](https://gw.alipayobjects.com/zos/antfincdn/z6VWQcplHx/9c78b96e-5ca9-407c-83d7-2caf5801c7ea.png)
