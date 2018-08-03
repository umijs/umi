---
sidebarDepth: 2
---

# 插件开发

## 初始化插件

在 umi 中，插件实际上就是一个 JS 模块，你需要定义一个插件的初始化方法并默认导出。如下示例：

```js
export default (api, opts) => {
  // your plugin code here
};

// 如果你的插件依赖其它插件，导出该配置后 umi 会帮你检测用户是否在你的插件之前加入了依赖的插件，待定
export const dependence = ['umi-plugin-dva'];
```

需要注意的是，如果你的插件需要发布为 npm 包，那么你需要发布之前做编译，确保发布的代码里面是 ES5 的代码。我们提供了 umi 插件的脚手架（umi-plugin-demo，开发中）方便你进行插件的开发。

该初始化方法会收到两个参数，第一个参数 `api`，umi 提供给插件的接口都是通过它暴露出来的。第二个参数 `opts` 是用户在初始化插件的时候填写的。

## 插件接口简介

umi 的所有插件接口都是通过初始化插件时候的 api 来提供的。分为如下几类：

- 环境变量，插件中可以使用的一些环境变量
- 系统级变量，一些插件系统暴露出来的变量或者常量
- 系统级 API，一些插件系统暴露的核心方法
- 事件类 API，一些插件系统提供的关键的事件点
- 工具类 API，常用的一些工具类方法
- 运行时 API，umi/runtime 暴露给浏览器中使用的 API
- 应用类 API，用于实现插件功能需求的 API，有直接调用和函数回调两种方法

**注：** 所有的 API 都是通过 `api.name` 的方法使用的，内部的 API 会统一加上 `_` 的前缀。

下面是一个基本的使用示例：

```js
export default (api, opts) => {
  api.onOptionChange(() => {
    api.rebuildFiles();
  });
}
```

## 插件示例

下面是参考 `umi-plugin-locale` 的需求添加的一个插件。

```js
export default (api, defaultOpts) => {
  const { paths } = api.service;
  // 监听插件配置变化，这一堆代码是不是应该有什么快捷的 alias
  let opts = defaultOpts;
  api.onOptionChange((newOpts) => {
    opts = newOpts;
    api.rebuildFile();
  });
  // 添加 Provider 的包裹
  api.addRendererWrapperWithComponent(join(__dirname, './locale.js'));
  api.addRendererWrapperWithComponent(() => {
    if (opts.antd) {
      return join(__dirnae, './locale-antd.js'));
    }
  });
  // 添加对 locale 文件的 watch
  api.registerWatcher({
    path: join(paths.srcPath, './locale/*.js')),
    onChange() {
      api.rebuildFiles();
    }
  });
  // 语言文件载入到代码中
  api.importModule(() => {
    const allLocaleFiles = getLocaleFiles(); // locale/*.js
    return {
       path: allLocaleFiles,
       name: 'localesModules',
    };
  });
  api.insertFragmentAfterImport(`
     getRuntimeState('localesModules', localesModules);
  `);
};
```

## 插件的顺序

插件的执行顺序依赖用户在配置文件 `.umirc.js` 中配置的 `plugins` 配置项，有依赖的插件 umi 会通过插件的 `dependence` 配置检查插件的顺序做出警告，但是目前 umi 不会修改用户的顺序。

当插件调用 `api.applyPlugin` 触发插件的 hooks 时，hooks 的执行顺序对应 `plugins` 的顺序。至于 hooks 是否关心顺序由对应的 hooks 决定。

## 环境变量

### NODE_ENV

`process.env.NODE_ENV`，区分 development 和 production

## 系统级变量

### service.config

`.umirc.js` 或者 `config/config.js` 里面的配置。

### service.cwd

### service.pkg

### service.paths

outputPath
absOutputPath
pagesPath
absPagesPath
tmpDirPath
absTmpDirPath
absSrcPath

### service.routes

## 系统级 API

### loadPlugin

加载插件，用于插件集或者 bigfish。

```js
const demoPlugin = require('./demoPlugin');
api.loadPlugin(demoPlugin);
api.loadPlugin('umi-plugin-dva', {
  immer: true,
});
```

### registerApi

注册插件方法，用于给插件添加新的方法给其它插件使用。

```js
// 类型通常和方法名对应 addXxx modifyXxx onXxx afterXxx beforeXxx
api.registerApi('addDvaRendererWrapperWithComponent', {
  type: api.API_TYPE.ADD
  type: api.API_TYPE.EVENT
  type: api.API_TYPE.MODIFY
  reducerHandler: () => {} // for custom type
});
```

### applyPlugin

在插件用应用通过 registerApi 注册的某个方法。

```js
// 如果 type 为 api.API_TYPE.ADD wrappers 为各个插件返回的值组成的数组
// EVENT 则 wrappers 返回 undefined
// MODIFY 则返回最后的修改值
const wrappers = api.applyPlugin('wrapDvaRendererWithComponent');
```

### restart

```js
api.restart();
```

重新执行 `umi dev`，比如在 bigfish 中修改了 appType，需要重新挂载插件的时候可以调用该方法。

### rebuildFiles

```js
api.rebuildFiles('config dva changed');
```

重新生成 bootstrap file（entryFile），这个是最常用的方法，国际化，dva 等插件的配置变化都会用到。

### refreshBrowser

刷新浏览器，通常需要按照配置重新修改 HTML 的时候要用到。

### setPluginDefaultOption

设置插件的默认配置，比如在 bigfish 中需要把配置文件中的 dva 配置传递给 dva 插件的时候用到。

```js
const dvaPlugin = require('umi-plugin-dva');

api.setPluginDefaultOption(dvaPlugin, {
  immer: true
});
```

### setDefaultConfig

设置 umi 的默认配置。

```js
api.setDefaultConfig({
  disableDynamicImport: true,
});
```

### setState

```js
api.setState('routesConfig', []);
```

### getState

```js
const config = api.setState('routesConfig');
```

### registerCommand

注册 umi xxx 命令行

### \_registerConfig

注册一个配置项，类似之前的 modifyConfigPlugins。

```js
api.addConfig({
  name: 'dva',
  onChange(config) {
    api.setPluginDefaultConfig('umi-plugin-dva', config);
  }
});
```

## 工具类 API

### winPath

```js
api.winPath('/path/to.js');
```

将文件路径转换为兼容 window 的路径，用于在代码中添加 `require('/xxx/xxx.js')` 之类的代码。

### debug

```js
api.debug('msg');
```

### findJS

xxx -> xxx.js xxx.ts

### compatDirname

先找用户项目目录，再找插件依赖。

## 事件类 API

事件类 API 遵循以 onXxxXxx, beforeXxx, afterXxx 的命名规范，接收一个参数为回调函数。

### onOptionChange

插件的配置改变的时候触发。

```js
export default (api, defaultOpts = { immer: false }) {
  let opts = defaultOpts;
  api.onOptionChange((newOpts) => {
    opts = newOpts;
	api.rebuildFiles();
  });
}
```

### onBuildSuccess

在 `umi build` 成功时候。主要做一些构建产物的处理。

```js
api.onBuildSuccess({
  assets,
} => {
  /* TODO confirm
  assets = {
    common: {
	  js: [],
	  css: [],
	},
    pages: [{
	  name: 'index',
	  html: 'index.html',
	  js: ['umi-xxx.js'],
	  css: ['umi-xxx.css']
	}],
  }
  */
});
```

### onBuildFail

在 `umi build` 失败的时候。


## 运行时 API

在浏览器端可以通过 `umi/runtime` 获得的 API。也可以通过 `registerRuntimeExtension` 添加运行时模块，通过 runtimeApi 获取。`umi/runtime` === `runtimeApi`。

### setRuntimeState

```js
import { setRuntimeState } from 'umi/runtime';

const app = new Dva();

setRuntimeState('dvaApp', app);
```

### getRuntimeState

```js
import { getRuntimeState } from 'umi/runtime';

getRuntimeState('dvaApp', app);
```

### onRouteChange

路由变化时候调用。

```js
onRouteChange(({ route, params }) => {
});
```

```js

api.import

// runtime.js
import { onRouteChange } from 'umi/runtime';
				   
onRouteChange((routes) => {
   if (routes.workspace) {
      window.AntdCloudNav.set();
   }
});
```

## 应用类 API

对于应用类 API，可以有直接调用和函数回调两种方式。

直接调用的示例如下：

```js
api.addRendererWapperWithComponent('/path/to/component.js');
```

函数回调的示例如下：

```js
api.addRendererWapperWithComponent(() => {
  if (opts.antd) {
    return '/path/to/component.js';
  }
});
```

下面是具体的 API。

### addWatcher

添加 watch 的文件，类似之前的 modifyPageWatchers。

```js
api.registerWatcher(['xxx.js', '*.mock.js']);
```

### addRuntimeExtension

添加运行时的扩展，runtimeApi 提供的方法参考后面的运行时部分。

```js
api.registerRuntimeExtension('/runtime.js', {})
```

```js
// runtime.js
export default (runtimeApi, opts) => {
  // runtimeApi === require('umi/runtime');
}
```

### modifyDefaultTemplateContent

修改默认的模板，bigfish 会用到。

### addFragmentToHTML

在头部添加内容，bigfish 会用到添加一些注释信息

### addFragmentInHTMLBodyTail

在 body 的最后添加内容

### addFragmentInHTMLBodyTop

在 body 的前面添加内容

### addFragmentInHTMLHead

在 head 的最后添加内容

### addFragmentInHeadTop

在 head 的前面添加内容。

### modifyRoutesConfig

修改路由配置。

```js
api.modifyRoutesConfig(({ memo, args}) => {
  return memo;
})
```

### modifySingleRouteConfig

修改单个路由的配置。

```js
api.modifySingleRouteConfig({ memo } => {
  return memo;
})
```

路由配置的格式如下：

```js
const route = {
  path: '/xxx',
  component: '/path/to/component',
  Routes: ['/permissionControl.js'],
}
```

```js
exports.routes = [{
  path: '/xxx',
  workspace: false,
}];
```

```js
//permissionControl.js
export class Control extends Component (props) => {
  componentDidount() => {
     if(props.route.workspace === false) {
       window.AntdCloudNav.set()
     }
  }
}

```


### addRouteWrapperWithComponent

```js
api.addRouteWrapperWithComponent('./path/to/component.js');
```

在路由组件外面包一层组件，也可以用 modifySingleRouteConfig 这个实现，这个相当于是一个快捷方式。

### addFragmentToEntry

在 entry 最后添加代码。

### addFragmentAfterImport

在 import 的位置添加代码。

### addFragmentAhead

在最前面添加代码。

### addModuleImport

添加模块的引入，可以指定模块引入后的名称。

```js
api.addModuleImport({
  path: '/path/to/module', // 可以是数组
  name: 'xxx', // 如果有该项，那么 Module 会被 setRuntimeState 设置到 runtimeState 中
});

// or

api.addModuleImport(() => {
  return {
    path: '/path/to/module',
    name: 'xxx', // 可以缺省，直接返回一个 path 的 string
  };
});
```

### addModuleAndExcuteDefault

require 一个模块并在最后执行它的 default 方法。

### addRendererWrapperWithComponent

在 <App/> 外面包一层组件。

### addRendereWrapperWithModule

在挂载 <App/> 前执行一个 Module，支持异步。

### modifyWebpackConfig

修改 webpack 配置。

```js
// 示例
api.chainWebpackConfig(({ memo }) => {
  return memo;
});
```

### modifyAfWebpackConfig

修改 af-webpack 配置。

```js
// 示例
api.modifyAfWebpackConfig(({ memo }) => {
  return memo;
});
```

### addMiddlewareAtFront

往前面添加中间件

### addMiddlewareAtTail

往后面添加中间件

### addMiddlewareBeforeMock

在 mock 前添加中间件

### addMiddlewareAfterMock

在 mock 后添加中间件

