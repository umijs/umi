---
sidebarDepth: 2
---

# API

## 路由

### umi/link

通过声明的方式做路由跳转。

例子：

```markup
import Link from 'umi/link';

export default () => {
  <div>
    /* 普通使用 */
    <Link to="/list">Go to list page</Link>

    /* 带参数 */
    <Link to="/list?a=b">Go to list page</Link>

    /* 包含子组件 */
    <Link to="/list?a=b"><button>Go to list page</button></Link>
  </div>
}
```

### umi/router

通过编程的方式做路由切换，包含以下 4 个 API 。

#### router.push(path)

推一个新的页面到 history 里。

例子：

```js
import router from 'umi/router';

// 普通跳转，不带参数
router.push('/list');

// 带参数
router.push('/list?a=b');
router.push({
  pathname: '/list',
  query: {
    a: 'b',
  },
});
# 对象且不包含 pathname 会报错
router.push({
  query: {}
});
```

#### router.replace(path)

替换当前页面，参数和 [router.push()](<#router.push(path)>) 相同。

#### router.go(n)

往前或往后跳指定页数。

例子：

```js
import router from 'umi/router';

router.go(-1);
router.go(2);
```

#### router.goBack()

后退一页。

例子：

```js
import router from 'umi/router';
router.goBack();
```

### umi/navlink

详见：[https://reacttraining.com/react-router/web/api/NavLink](https://reacttraining.com/react-router/web/api/NavLink)

### umi/redirect

重定向用。

例子：

```js
import Redirect from 'umi/redirect';
<Redirect to="/login" />;
```

详见：[https://reacttraining.com/react-router/web/api/Redirect](https://reacttraining.com/react-router/web/api/Redirect)

### umi/prompt

例子：

```js
import Prompt from 'umi/prompt';

export default () => {
  return (
    <>
      <h1>Prompt</h1>
      <Prompt
        when={true}
        message={location => {
          return window.confirm(`confirm to leave to ${location.pathname}?`);
        }}
      />
    </>
  );
};
```

详见：[https://reacttraining.com/react-router/web/api/Prompt](https://reacttraining.com/react-router/web/api/Prompt)

### umi/withRouter

详见：[https://reacttraining.com/react-router/web/api/withRouter](https://reacttraining.com/react-router/web/api/withRouter)

## Locale

### umi-plugin-locale

> 无需单独引入 `umi-plugin-locale` 依赖，当你使用 `umi-plugin-react` 时，就已经被自动引入了。

#### setLocale(lang, realReload = true)

指定当前使用语言，`realReload = false` 时，可以无刷新更新多语言设置。

举例:

```js
import { setLocale } from 'umi-plugin-locale';

// 十秒后设置当前语言为en-US
setTimeout(() => {
  setLocale('en-US');
}, 10000);
```

#### getLocale()

获取当前使用语言

举例:

```js
import { getLocale } from 'umi-plugin-locale';

// 打印当前使用语言
console.log(getLocale());
```

#### 使用 [react-intl](https://github.com/formatjs/react-intl/blob/master/docs/Components.md#components) 提供的组件

你可以直接从 `umi-plugin-locale` 引入由 [react-intl](https://github.com/formatjs/react-intl/blob/master/docs/Components.md#components) 提供的如下组件：

```js
import {
  FormattedDate,
  FormattedTime,
  FormattedRelative,
  FormattedNumber,
  FormattedPlural,
  FormattedMessage,
  FormattedHTMLMessage,
} from 'umi-plugin-locale';

export default () => {
  return <FormattedMessage id="TEST_TITLE" />;
};
```

#### 使用 [react-intl](https://github.com/formatjs/react-intl/blob/master/docs/API.md#api) 提供的方法

你可以直接从 `umi-plugin-locale` 引入由 [react-intl](https://github.com/formatjs/react-intl/blob/master/docs/API.md#api) 提供的如下方法：

```js
import {
  formatDate,
  formatTime,
  formatRelative,
  formatNumber,
  formatPlural,
  formatMessage,
  formatHTMLMessage
} from 'umi-plugin-locale';


export default () => {
  return <p>{formatMessage({ id="TEST_TITLE" })}</p>;
}
```

## 性能

### umi/dynamic

动态加载组件，基于 [react-loadable](https://github.com/jamiebuilds/react-loadable) 实现。

#### dynamic(options)

例子：

```js
import dynamic from 'umi/dynamic';

// 延时 1s 渲染的组件。
const App = dynamic({
  loader: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(() => <div>I will render after 1s</div>);
      }, /* 1s */1000);
    }));
  },
});

// 或者用 async 语法
const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));
const App = dynamic({
  loader: async function() {
    await delay(/* 1s */1000);
    return () => <div>I will render after 1s</div>;
  },
});
```

## 构建

### umi/babel

让用户可基于 umi 的 babel 配置进行扩展。


## Umi UI

Umi UI 通过 GUI 的方式，对 umi 项目代码进行管理。

同时提供 [服务端 API](#服务端-api) 和 [客户端 API](#客户端-api) ，实现 UI 的自定义功能。

![](https://gw.alipayobjects.com/zos/antfincdn/sSRhw2OsOv/899a9f10-70b8-44b5-9fbb-f5e102b032a8.png)

## UI 服务端 API

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

## UI 客户端 API

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

### api.listenRemote

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
  actions?: {
    // 标题
    title: string;
    // 按钮样式
    type?: 'default' | 'primary';
    // 与 callRemote 参数一致
    action?: IAction;
    // 额外的点击事件
    onClick?: () => void;
  }[];
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

### api.intl()

使用国际化，使用 [api.addLocale](#api.addLocales()) 添加国际化字段后，可以在组件里使用 `api.intl` 使用国际化。

参数：

`api.intl` 与 [formatMessage](https://github.com/formatjs/react-intl/blob/1c7b6f87d5cc49e6ef3f5133cacf8b066df53bde/docs/API.md#formatmessage) 参数一致。

例如：

```js
// ui.(jsx|tsx)
import React from 'react';

export default (api) => {
  api.addPanel({
    title: '插件模板',
    path: '/plugin-bar',
    icon: 'environment',
    component: <div>{api.intl({ id: 'org.sorrycc.react.name' })}</div>,
  });
};
```

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


## api.notify

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

## api.redirect

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

## api.currentProject

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

## api.debug

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

> 不建议在插件里使用 `console.log` 调用。


## api.getCwd

获取 Umi UI 启动时的路径。

示例：

```js
const { getCwd } = api;

export default () => {
  useEffect(() => {
    (async () => {
      const cwd = await getCwd();
      // set
    })
  }, []);
};
```
