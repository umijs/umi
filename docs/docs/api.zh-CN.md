---
title: API
---

## 基本 API

### dynamic

动态加载组件。

```js
import { dynamic } from 'umi';

const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

export default dynamic({
  loader: async function() {
    await delay(/* 1s */1000);
    return () => <div>I will render after 1s</div>;
  },
});
```

### history

可用于获取当前路由信息，

```js
import { history } from 'umi';

// history 栈里的实体个数
console.log(history.length);

// 当前 history 跳转的 action，有 PUSH、REPLACE 和 POP 三种类型
console.log(history.action);

// location 对象，包含 pathname、search 和 hash
console.log(history.location.pathname);
console.log(history.location.search);
console.log(history.location.hash);
```

可用于路由跳转，

```js
import { history } from 'umi';

// 跳转到指定路由
history.push('/list');

// 带参数跳转到指定路由
history.push('/list?a=b');
history.push({
  pathname: '/list',
  query: {
    a: 'b',
  },
});

// 跳转到上一个路由
history.goBack();
```

也可用于路由监听，

```js
import { history } from 'umi';

const unlisten = history.listen((location, action) => {
  console.log(location.pathname);
});
unlisten();
```

### plugin

> 主要在插件利用，项目代码中一般用不到。

运行时插件接口，是 Umi 内置的跑在浏览器里的一套插件体系。

比如：

```js
import { plugin, ApplyPluginsType } from 'umi';

// 注册插件
plugin.register({
  apply: { dva: { foo: 1 } },
  path: 'foo',
});
plugin.register({
  apply: { dva: { bar: 1 } },
  path: 'bar',
});

// 执行插件
// 得到 { foo: 1, bar: 1 }
plugin.applyPlugins({
  key: 'dva',
  type: ApplyPluginsType.modify,
  initialValue: {},
  args: {},
  async: false,
});
```

参数属性包含：

* **key**，坑位的 key
* **type**，执行方式类型，详见 [ApplyPluginsType](#ApplyPluginsType)
* **initialValue**，初始值
* **args**，参数
* **async**，是否异步执行且返回 Promise

### ApplyPluginsType

> 主要在插件利用，项目代码中一般用不到。

运行时插件执行类型，enum 类型，包含三个属性：

* **compose**，用于合并执行多个函数，函数可决定前序函数的执行时机
* **modify**，用于修改值
* **event**，用于执行事件，前面没有依赖关系

## 路由

### Link

### NavLink

### Prompt

### withRouter

### useRouter

### useHistory

### useLocation

### useParams

### useRouteMatch

## node 侧接口

> 通过 package.json 的 main 字段露出，且不存在于 modules 字段里。

### Service

Umi 内核的 Service 方法，用于测试，或调用 Umi 底层命令。

### utils

utils 方法，给插件使用，和插件里的 api.utils 是同一个底层库。

### defineConfig

用于校验和提示用户配置类型，详见[配置#TypeScript 提示](TODO)。

## 插件类型定义

### IApi

### IConfig
