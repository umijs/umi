---
sidebarDepth: 2
---

# Umi UI 插件开发

## 示例

index.js

```js
// 普通的 umi 插件写法，新增 api.onUISocket 和 api.addUIPlugin 接口
export default api => {
  // 处理 socket 通讯数据
  api.onUISocket(({ action, send, log }) => {
    // 通过 action 处理
    // 处理完后 send 数据到客户端
    send({ type, payload });
    // 过程中的日志通过 log 打到客户端
    log(`Adding block Foo/Bar...`);
  });
  // 添加编辑态的插件
  api.addUIPlugin(require.resolve('./dist/client.umd'));
};
```

ui.js（通过 [father-build](https://github.com/umijs/father/tree/master/packages/father-build) 打包到 `dist/ui.umd.js`）

```js
// 这个文件打 umd 到 ./dist/client.umd.js，external react、react-dom 和 antd，用 father-build 很容易打出来
export default api => {
  const {
    // 调用服务端方法
    callRemote,
  } = api;

  function Blocks() {
    return <h1>Blocks</h1>;
  }
  // 添加 panel，类似 vscode 点击左边的 Icon 后切换 Panel
  api.addPanel({
    title: '区块管理',
    icon: 'home',
    path: '/blocks',
    component: Blocks,
    // 顶部右侧按钮
    actions: [
      {
        title: '打开配置文件',
        // antd Button type
        type: 'default',
        // 点击后的 action
        action: {
          type: '@@actions/openConfigFile',
          payload: {
            projectPath: api.currentProject.path,
          }
        },
        onClick: () => {},
      },
    ],
  });
  // 更多功能...
};
```

## 服务端接口

可访问 [所有插件接口和属性](../plugin/develop.md)，以下是几个与 UI 相关 API。

### api.onUISocket

处理 socket 数据相关，比如：

```bash
api.onUISocket(({ type, payload }, { log, send, success, failure }) => {
  if (type === 'config/fetch') {
    send({ type: `${type}/success`, payload: getConfig() });
  }
});
```

**注：**

1. 按约定，如果客户端用 `api.callRemote` 调用服务端接口，处理完数据需 `send` 加 `/success` 或 `/failure` 后缀的数据表示成功和失败。

#### send({ type, payload })

向客户端发送消息。

#### success(payload)

`` send({ type: `${type}/success` }) `` 的快捷方式。

#### failure(payload)

`` send({ type: `${type}/failure` }) `` 的快捷方式。

#### progress(payload)

`` send({ type: `${type}/progress` }) `` 的快捷方式。

#### log(level, message)

在控制台和客户端同时打印日志。

示例：

```js
log('info', 'abc');
log('error', 'abc');
```

### api.addUIPlugin

注册 UI 插件，指向客户端文件。

```bash
api.addUIPlugin(require.resolve('./dist/ui'));
```

**注：**

1. 文件需是 `umd` 格式（例如 `./dist/ui.umd.js`）

## 客户端接口

### api.callRemote()

调服务端接口，并等待 `type` 加上 `/success` 或 `/failure` 消息的返回。若有进度的返回，可通过 `onProgress` 处理回调。

参数如下：

```js
api.callRemote({
  // 接口名称
  type: string;
  // 传入参数
  payload: object;
  // 监听服务端推送来的数据
  onProgress: (data) => void;
  // 是否建立长久连接
  keep: boolean;
})
```

示例：

```js
import React from 'react';

const { useState } = React;

// 组件 props api 从插件传入
export default (props) => {
  const { api } = props;
  const [progress, setProgress] = useState(0);

  const handleClick = async () => {
    await api.callRemote({
      type: 'org.umi.plugin.bar.create',
      payload: {
        id: 'id',
      },
      onProgress: async (data) => {
        useState(data);
      }
    })
  }

  return (
    <div>
      <button onClick={handleClick}>Click</button>
      <p>progress: {progress}</p>
    </div>
  )
}
```

**注：**

1. `callRemote` 会自动带上 `lang` 属性，供服务端区分语言
2. 有 `keep` 属性，则不会在 success 或 failure 后清除掉

### api.listenRemote()

监听 `socket` 请求，有消息时通过 `onMessage` 处理回调。

返回一个 `unlisten` 函数，用于取消监听。

示例：

```js
const unlisten = api.listenRemote({
  // 接口名称
  type: 'org.umi.plugin.foo',
  onMessage: (data) => {
    // 函数处理
  }
});

// 组件卸载时可调用，取消监听
unlisten();
```

### api.send()

发送消息到服务端。

### api.addPanel()

添加客户端插件入口及路由，调用此方法会在 Umi UI 中增加一级菜单。

调用参数有：

```js
api.addPanel({
  // 插件路由
  path: string;
  // 组件
  component: ReactNode;;
  // 图标，同 antd icon
  icon: IconType | string;
  // 全局操作按钮，位于插件面板右上角
  actions?: ReactNode | React.FC | {
    // 标题
    title: string;
    // 按钮样式
    type?: 'default' | 'primary';
    // 与 callRemote 参数一致
    action?: IAction;
    // 额外的点击事件
    onClick?: () => void;
  }[];
  // 实验室插件，开启后插件会加入到实验室中，默认 false
  beta?: boolean;
});
```

示例：

```js
// ui.(jsx|tsx)
import React from 'react';
import Template from './ui/index';

export default (api) => {
  api.addPanel({
    title: '插件模板',
    path: '/plugin-bar',
    icon: 'environment',
    // api 透传至组件
    component: () => <Template api={api} />,
  });
};
```

添加插件全局操作区（动态修改全局操作区，参考 [api.setActionPanel](#api-setactionpanel)）：

```js
// ui.(jsx|tsx)
import React from 'react';
import Template from './ui/index';

export default (api) => {
  const ActionComp = () => (
    <Input.Search />
  )

  api.addPanel({
    title: '插件模板',
    path: '/plugin-bar',
    icon: 'environment',
    actions: [
      ActionComp,
      <button>Button</button>,
      {
        title: '打开编辑器',
        type: 'default',
        action: {
          // 通过 api.onUISocket 定义
          type: '@@actions/openConfigFile',
          payload: {
            projectPath: api.currentProject.path,
          },
        }
    }]
    // api 透传至组件
    component: () => <Template api={api} />,
  });
};
```

![image](https://user-images.githubusercontent.com/13595509/65385510-0b710300-dd62-11e9-8f92-99c3eff45833.png)

### api.addLocales()

添加全局国际化信息。

例如：

添加国际化字段

```js
// ui.(jsx|tsx)
import React from 'react';
import Template from './ui/index';

export default (api) => {
  // 你也可以在顶部
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

### api.intl.*

使用国际化，使用 [api.addLocale](#api-addlocales) 添加国际化字段后，可以在组件里使用 `api.intl.*` 处理国际化。

提供的国际化方法如下：

```ts
type PickIntl = Pick<typeof intl,
  'FormattedDate' |
  'FormattedTime' |
  'FormattedRelative' |
  'FormattedNumber' |
  'FormattedPlural' |
  'FormattedMessage' |
  'FormattedHTMLMessage' |
  'formatMessage' |
  'formatHTMLMessage' |
  'formatDate' |
  'formatTime' |
  'formatRelative' |
  'formatNumber' |
  'formatPlural'
>
```

例如：

```js
// ui.(jsx|tsx)
import React from 'react';

export default (api) => {
  // 用法 api 参考 https://github.com/formatjs/react-intl/blob/1c7b6f87d5cc49e6ef3f5133cacf8b066df53bde/docs/API.md
  const {
    FormattedMessage,
    formatMessage,
  } = api.intl;
  const Component = (
    <div>
      <p>{formatMessage({ id: 'org.sorrycc.react.home' })}</p>
      <FormattedMessage id="org.sorrycc.react.foo" />
      <p>api.intl alias `api.intl.formatMessage`: {api.intl({ id: 'org.sorrycc.react.name' })}</p>
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

> `api.intl()` 与 [formatMessage](https://github.com/formatjs/react-intl/blob/1c7b6f87d5cc49e6ef3f5133cacf8b066df53bde/docs/API.md#formatmessage) 参数一致，`api.intl()` 与 `api.intl.formatMessage()` 等价。

![image](https://user-images.githubusercontent.com/13595509/66404196-9288d100-ea1a-11e9-9ada-1204744018d2.png)


### api.getLocale()

返回当前语言，`zh-CN`、`en-US` 等。

### api.showLogPanel()

打开 Umi UI 底部日志栏。

![](https://gw.alipayobjects.com/zos/antfincdn/yhMYDm%26I3m/744a491c-4abd-4fa9-ace7-b46d69b2ef77.png)

### api.hideLogPanel()

隐藏 Umi UI 底部日志栏。

### api.TwoColumnPanel

两栏布局组件

![](https://gw.alipayobjects.com/zos/antfincdn/tQZLnZk4zX/a4d074f7-570a-4a65-9c1c-bb377a9649af.png)

比如：

```js
const { TwoColumnPanel } = api;

function Configuration() {
  return (
    <TwoColumnPanel
      sections={[
        {
          // 访问 /${插件路由}?active=${key}
          // 可定位到具体插件的具体面板
          key?: 'basic',
          title: '基本配置', description,
          icon: '',
          component: C1
        },
        {
          key?: 'config',
          title: 'umi-plugin-react 配置',
          description,
          icon: '',
          component: C2
        },
      ]}
    />
  );
}

api.addPanel({
  component: Configuration,
});
```

### api.Terminal

终端命令行组件。

参数如下：

```ts
interface ITerminalProps {
  /** Terminal title */
  title?: string;
  className?: string;
  terminalClassName?: string;
  /** defaultValue in Terminal */
  defaultValue?: string;
  /** get xterm instance */
  onInit?: (ins: XTerminal) => void;
  /** https://xtermjs.org/docs/api/terminal/interfaces/iterminaloptions/ */
  config?: ITerminalOptions;
  [key: string]: any;
}
```

示例：

使用终端实例，调用日志输出函数：

```js
import React, { useState } from 'react'

export default (api) => {
  const { Terminal } = api;

  function Component() {
    let terminal;

    const handleClick = () => {
      terminal.write('Hello World');
    }

    return (
      <div>
        <Terminal
          title="插件日志"
          onInit={ins => {
            terminal = ins;
          }}
        />
        <button onClick={handleClick}>开始</button>
      </div>
    );
  }

  api.addPanel({
    component: Component,
  });
}
```

![image](https://user-images.githubusercontent.com/13595509/65759665-09d28100-e14e-11e9-960b-3c600a5485e1.png)

终端更多用法见 [文档](https://xtermjs.org/docs/)

### api.DirectoryForm

目录选择表单控件

参数如下：

```js
interface IDirectoryForm {
  /** path, default  */
  value?: string;
  onChange?: (value: string) => void;
}
```

示例：

```js
import React from 'react';
import { Form } from 'antd';

export default () => {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      onFinish={values => {
        console.log('values', values)
      }}
      initialValues={{
        baseDir: cwd,
      }}
    >
      <Form.Item
        label={null}
        name="baseDir"
        rules={[
          {
            validator: async (rule, value) => {
              await validateDirPath(value);
            },
          },
        ]}
      >
        <DirectoryForm />
      </Form.Item>
    </Form>
  )
}
```

![image](https://user-images.githubusercontent.com/13595509/67653846-34e70500-f986-11e9-81be-16a9ac219cde.png)


### api.Field

配置表单组件，结合 [antd 4.x](https://4-0-prepare--ant-design.netlify.com/components/form-cn/) 一起使用，简化表单组件，使用配置式生成表单。

`api.Field` 参数如下：

```ts
interface IFieldProps {
  /** 表单类型 */
  /** 具体类型有："string" | "boolean" | "object" | "string[]" | "object[]" | "list" | "textarea" | "any" */
  type: IConfigTypes;
  /** 表单 字段名，通过 `.` 来确定字段之间的联动关系  */
  name: string;
  /** 可选列表，只用在 type 为 object  */
  defaultValue?: IValue;
  /** 主要用于数组表单类型，提供可选值列表 */
  options?: string[];
  /** antd 4.x form 实例 */
  form: object;
  /** antd label, 如果是 object，则使用内置的 <Label /> 组件 */
  /** object 参数有 { title: string, description: string, link?: string } */
  label: string | ReactNode | IFieldLabel;
  /** 控件大小, 默认是 default */
  size?: 'default' | 'small' | 'large';
  /** 其它类型与 Form.Item 一致 */
  [key: string]: any;
}

interface IFieldLabel {
  /** label title */
  title: string;
  /** label description */
  description: string;
  /** description detail link */
  link: string;
}
```

例如，联动示例 ：


```js
import { Form } from 'antd'
const { TwoColumnPanel } = api;

function Configuration() {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={values => {
        console.log('valuesvalues', values);
      }}
      initialValues={{
        'parent.child2': ['**/a.js', '**/b.js'],
        'parent.child3': '<script>alert("Hello")</script>',
        'parent2.child': 'Method1',
      }}
    >
      <Field form={form} name="parent" label="SpeedUp-boolean" type="boolean" />
        <Field form={form} name="parent.child" label="Speed-string" type="string" />
        <Field
          form={form}
          name="parent.child2"
          label="Speed-string[]"
          type="string[]"
        />
        <Field form={form} name="parent.child3" label="Speed-textarea" type="textarea" />
        <Field form={form} name="parent.child4" label="Speed-any" type="any" />

      <Field form={form} name="parent2" label="Config-boolean" type="boolean" />
        <Field
          form={form}
          name="parent2.child"
          label="Config-list"
          type="list"
          options={['Method1', 'Method2']}
        />
        <Field
          form={form}
          name="parent2.child2"
          label="Config-list"
          type="object"
          options={['Target1', 'Target2']}
        />

      <Form.Item shouldUpdate>
        {({ getFieldsValue }) => <pre>{JSON.stringify(getFieldsValue(), null, 2)}</pre>}
      </Form.Item>
      <Button htmlType="submit">Submit</Button>
    </Form>
  );
}

api.addPanel({
  component: Configuration,
});
```

![](https://gw.alipayobjects.com/zos/antfincdn/ynwTwNrNjv/6af464b4-742b-4ce8-9ee2-92c826f2e51b.png)

### api.ConfigForm

配置表单页面，对 [api.Field](#api-field) 的上层封装，增加查询、修改接口即可生成表单页面：


`api.ConfigForm` 参数如下：

```js
interface IConfigFormProps {
  /** config title in the top */
  title: string;
  /** list config interface */
  list: string;
  /** edit config interface */
  edit: string;
  /** enable Toc, default false */
  enableToc?: boolean;
  /** Search fuse options, detail in https://github.com/krisk/Fuse */
  fuseOpts?: FuseOptions<number>;
}
```

使用示例：

服务端

```js
// server
export default (api) => {
  // more options in `api.Field` IFieldProps
  const data = [
    {
      "name": "base",
      "group": "Group1",
      "type": "string",
      "default": "/",
      "title": "group1",
      "description": "description1",
    },
    {
      "group": "Group2",
      "name": "group2",
      "title": "title2",
      "description": "description2",
      "type": "boolean",
      "default": false,
    },
    {
      "group": "Group2",
      // if you want link parent config, use `.` dot split
      "name": "group2.bar",
      "title": "title3",
      "description": "description3",
      "type": "boolean",
      "default": false,
    },
  ]

  api.onUISocket(({ action, failure, success }) => {
    const { type, payload, lang } = action;
    switch (type) {
      case 'org.umi.plugin.bar.config.list':
        success({
          data,
        });
        break;
      case 'org.umi.plugin.bar.config.edit':
        let config = payload.key;
        if (typeof payload.key === 'string') {
          config = {
            [payload.key]: payload.value,
          };
        }
        try {
          // your validate function
          // validateConfig(config);
          // (api as any).service.runCommand('config', {
          //   _: ['set', config],
          // });
          success();
        } catch (e) {
          failure({
            message: e.message,
            errors: e.errors,
          });
        }
        break;
      default:
        break;
    }
  });
}
```

客户端

```jsx
// client
const { ConfigForm } = api;

api.addPanel({
  component: (
    <ConfigForm
      title="title Config"
      list="org.umi.plugin.bar.config.list"
      edit="org.umi.plugin.bar.config.edit"
    />
  ),
});
```

![image](https://user-images.githubusercontent.com/13595509/65481497-2fe6ef80-dec8-11e9-946f-7a8097c1e05e.png)

### api.notify()

调用 Umi UI 通知栏，若用户停留在当前浏览器窗口，通知栏样式为 antd [Notification](https://ant.design/components/notification-cn)，否则为系统原生通知栏。


![](https://gw.alipayobjects.com/zos/antfincdn/9EKp3n0eF3/7b3be692-21fc-4bd5-9925-d449f0b19b18.png)

![](https://gw.alipayobjects.com/zos/antfincdn/%24Oiriv1QIZ/3c161112-89d7-4544-938b-c9e9eb777c48.png)


传入参数：

```js
{
  title: string;
  message: string;
  /** notify type, default info */
  type?: 'error' | 'info' | 'warning' | 'success';
  subtitle?: string;
  /** URL to open on click */
  open?: string;
  /**
   * The amount of seconds before the notification closes.
   * Takes precedence over wait if both are defined.
   */
  timeout?: number;
}
```

比如：

```js
const { notify } = api;

notify({
  /** 前提已经调用过 api.addLocales 添加 key */
  title: 'org.umi.ui.blocks.notify.title',
  message: '可以不使用国际化',
  type: 'success',
});
```

### api.redirect()

项目详情内的路由跳转，在不同插件之间进行跳转。

示例：

```js
const { redirect } = api;

export default () => (
  <Button
    onClick={() => redirect('/project/select')}
  >
    跳转到项目列表
  </Button>
);
```

### api.currentProject

获取当前项目基本信息，信息包括：

```js
{
  // KEY
  key?: string;
  // 应用名
  name?: string;
  // 应用路径
  path?: string;
}
```

示例：

```js
const { currentProject } = api;

export default () => (
  <div>
    <p>当前应用名：{currentProject.name}</p>
    <p>当前路径：{currentProject.path}</p>
  </div>
);
```

### api.debug()

`debug` [API](https://github.com/visionmedia/debug#browser-support)。

调试插件的时候，`localStorage` 修改为 `debug: umiui:UIPlugin*`。就可以看到所有插件的 debug 信息。

使用（以配置管理插件为例）：

```js
export default () => {
  const { debug } = api;
  // 声明插件 namespace
  const _log = api.debug.extend('configuration');
  _log('Hello UI Configuration');
}
```

![image](https://user-images.githubusercontent.com/13595509/63997643-aa268d00-cb31-11e9-9d42-117abd7267c9.png)

如果需要调试 `mini` 版日志，再增加一个 `debugMini: umiui`。

![image](https://user-images.githubusercontent.com/13595509/66537320-928bec80-eb52-11e9-93ed-8b921b4a30a6.png)

> 不建议在插件里使用 `console.log` 调用。


### api.getCwd()

获取 Umi UI 启动时的路径。

示例：

```js
const cwd = await api.getCwd();
// "/private/tmp/xxxx"
```

### api.getSharedDataDir()

获取当前项目的临时目录。

示例：

```js
const dir = await api.getSharedDataDir();
// "/Users/xxxxx/.umi/ui/shared-data/5bc6bd"
```

### api.detectLanguage()

获取当前项目的语言类型。

示例：

```js
const language = await api.detectLanguage();
// "JavaScript" | "TypeScript"
```

### api.detectNpmClients()

获取当前项目可能在用的 npm 客户端数组。

示例：

```js
const npmClients = await api.detectNpmClients();
// ["tnpm", "ayarn", "npm", "yarn"]
```

### api.addConfigSection()

添加配置区块。

示例：

```js
api.addConfigSection({
  key: 'umi-plugin-react',
  title: 'umi-plugin-react 配置',
  description: '配置 dva、antd、按需加载、国际化等',
  icon: (
    <img
      src="https://img.alicdn.com/tfs/TB1aqdSeEY1gK0jSZFMXXaWcVXa-64-64.png"
      width={32}
      height={32}
    />
  ),
  component: () => <div>TODO</div>,
});
```

### api.isMini() / api.mini

获取当前环境是否是 Umi UI mini。

示例：

```js
const isMini = api.isMini();  // true / false
// or const isMini = api.mini
```

![image](https://user-images.githubusercontent.com/13595509/65216522-c2ac1680-dae3-11e9-868a-80ec7bd32e1d.png)

### api.showMini()

打开 Umi UI mini 窗口（mini 环境下启用）。


### api.hideMini()

关闭 Umi UI mini 窗口（mini 环境下启用）。

### api.setActionPanel()

运行时动态修改右上角全局操作区，与 React 中 `setState` 类似。

参数如下：

示例：

```js
// ui.(jsx|tsx)
import React from 'react';

export default (api) => {
  // init Action
  const ActionComp = () => (
    <Input />
  )

  api.addPanel({
    title: '插件模板',
    path: '/plugin-bar',
    icon: 'environment',
    actions: [
      ActionComp
    ]
    // api 透传至组件
    component: () => {
      const handleClick = () => {
        // 类似于 React 中 setState
        api.setActionPanel((actions) => {
            return [
              ...actions,
              () => <Button onClick={() => alert('hello')}>New Button</Button>
            ]
          })
        }}
      }
      return (
        <Button onClick={handleClick}>
          添加一个新操作按钮
        </Button>
      )
    },
  });
};
```

![](https://gw.alipayobjects.com/zos/antfincdn/1xxzJVcNZK/add.gif)
