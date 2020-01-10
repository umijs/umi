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
import { PlusOutlined } from '@ant-design/icons';
import classnames from 'classnames';

import styles from './index.module.less'

export default (api) => {
  function PluginPanel() {
    const wrapperCls = classnames(styles.bar, styles.foo);
    return (
      <div className={wrapperCls}>
        <PlusOutlined />
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
-   "@ant-design/icons": "^4.0.0-alpha.11"
  },
  "devDependencies": {
+   "classnames": "^2.2.6",
+   "@ant-design/icons": "^4.0.0-alpha.11"
  }
}
```

### Internationalization

Umi UI supports plug-in internationalization, and provides Chinese(zh-CN) and English(en-US) languages. The language is switched through the bottom right corner menu.

Make the plugin using [api.addLocales()](/plugin/umi-ui.html#api-addlocales) and [api.intl.*](/plugin/umi-ui.html#api-intl) Have internationalization capabilities.

Register the internationalization fields:

```jsx
// ui/index.js
import React from 'react';

export default (api) => {
  // or
  // import zh from './your-locale/zh.js'
  // import en from './your-locale/en.js'
  // { 'zh-CN': zh, 'en-US': en }
  api.addLocales({
    'zh-CN': {
      'org.sorrycc.react.name': '陈成',
    },
    'en-US': {
      'org.sorrycc.react.name': 'chencheng',
    },
  });
};
```

Using internationalization fields, [api.intl.*](/plugin/umi-ui.html#api-intl) provides a range of tool methods to choose from:

```jsx
import React from 'react';

export default (api) => {
  api.addLocales({
    'zh-CN': {
      'org.sorrycc.react.name': '陈成',
    },
    'en-US': {
      'org.sorrycc.react.name': 'chencheng',
    },
  });
  // Usage api reference https://github.com/formatjs/react-intl/blob/1c7b6f87d5cc49e6ef3f5133cacf8b066df53bde/docs/API.md
  const {
    FormattedMessage,
    formatMessage,
  } = api.intl;
  const Component = (
    <div>
      <p>{formatMessage({ id: 'org.sorrycc.react.name' })}</p>
      <FormattedMessage id="org.sorrycc.react.name" />
      {/* api.intl alias `api.intl.formatMessage`:  */ }
      <p>{intl({ id: 'org.sorrycc.react.name' })}</p>
    </div>
  )
  api.addPanel({
    title: '插件模板',
    path: '/plugin-bar',
    icon: 'environment',
    component: Component,
  });
};
```

The result is as follows:

![](https://user-images.githubusercontent.com/13595509/67362409-8154ce00-f59d-11e9-94b0-384fbaa2fb67.gif)

### Extended assets

Add assets using `api.modifyBlockUIResources`:

```js
// src/index.(js|ts)

api.modifyBlockUIResources((memo) => {
  return [{
    id: 'bigfish-techui-block',
    name: 'TechUI',
    blockType: 'block',
    resourceType: 'custom',
    icon: 'https://img.alicdn.com/tfs/TB1CpakmGL7gK0jSZFBXXXZZpXa-64-64.png',
    description: '蚂蚁金融科技 UI 精选区块。',
    getData: () => ({
      success: true,
      data: [
        {
          // git 地址
          url: 'https://github.com/ant-design/ant-design-blocks/tree/master/form-register',
          name: 'form-注册新用户',
          description: '用户填写必须的信息以注册新用户。',
          img: 'https://raw.githubusercontent.com/ant-design/ant-design-blocks/master/form-register/snapshot.png',
          tags: [
            '表单',
          ],
          previewUrl: 'https://ant.design/components/form-cn/#components-form-demo-register',
        }
      ]
    }),
  }, {
    id: 'bigfish-techui-template',
    name: 'TechUI',
    blockType: 'template',
    resourceType: 'custom',
    icon: 'https://img.alicdn.com/tfs/TB1CpakmGL7gK0jSZFBXXXZZpXa-64-64.png',
    description: '蚂蚁金融科技 UI 精选模板。',
    getData: () => {
      // same as block
      return getBigfishBlock({
        market: 'techui',
        type: 'TEMPLATE',
      }, true);
    },
  }, ...memo];
});

// socket api
api.onUISocket(async () => {

});

// add ui umd file
api.addUIPlugin(require.resolve('../ui/dist/index.umd.js'));
```

### Custom Block Slots

The `UmiUIFlag` component exported from `umi` can be used as a placeholder when the block is inserted. After the block is added, `UmiUIFlag` will be automatically deleted.

```jsx
import React from 'react';
import { UmiUIFlag } from 'umi';

import { Button } from 'antd';

export default () => (
  <div>Hello
    <div>
      <p>World</p>
      <UmiUIFlag />
      <p>
        aaaaa
        <div>
          <UmiUIFlag inline />Hello Inline<UmiUIFlag inline />
        </div>
      </p>
    </div>
    <Button type="primary">World</Button>
  </div>
);
```

![](https://gw.alipayobjects.com/zos/antfincdn/9EfCMj46tx/f8a08273-4d19-46c0-91fc-fac2a5e9b4f0.png)

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
