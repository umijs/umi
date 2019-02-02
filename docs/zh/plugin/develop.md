---
sidebarDepth: 2
---

# 插件开发

## 初始化插件

你可以通过 [create-umi](https://github.com/umijs/create-umi) 直接创建一个 umi 插件的脚手架：

```shell
$ yarn create umi --plugin
```

在 umi 中，插件实际上就是一个 JS 模块，你需要定义一个插件的初始化方法并默认导出。如下示例：

```js
export default (api, opts) => {
  // your plugin code here
};
```

需要注意的是，如果你的插件需要发布为 npm 包，那么你需要发布之前做编译，确保发布的代码里面是 ES5 的代码。

该初始化方法会收到两个参数，第一个参数 `api`，umi 提供给插件的接口都是通过它暴露出来的。第二个参数 `opts` 是用户在初始化插件的时候填写的。

## 插件接口简介

umi 的所有插件接口都是通过初始化插件时候的 api 来提供的。分为如下几类：

- 环境变量，插件中可以使用的一些环境变量
- 系统级变量，一些插件系统暴露出来的变量或者常量
- 工具类 API，常用的一些工具类方法
- 系统级 API，一些插件系统暴露的核心方法
- 事件类 API，一些插件系统提供的关键的事件点
- 应用类 API，用于实现插件功能需求的 API，有直接调用和函数回调两种方法

**注：** 所有的 API 都是通过 `api.[theApiName]` 的方法使用的，内部的 API 会统一加上 `_` 的前缀。

下面是一个基本的使用示例：

```js
export default (api, opts) => {
  api.onOptionChange(() => {
    api.rebuildTmpFiles();
  });
}
```

## 插件示例

下面是参考 `umi-plugin-locale` 的需求添加的一个插件伪代码示例，完整的例子可以查看[源代码](https://github.com/umijs/umi/blob/master/packages/umi-plugin-locale/src/index.js)。

```js
export default (api, opts = {}) => {
  const { paths } = api;
  // 监听插件配置变化
  api.onOptionChange((newOpts) => {
    opts = newOpts;
    api.rebuildTmpFiles();
  });
  // 添加 Provider 的包裹
  api.addRendererWrapperWithComponent(join(__dirname, './locale.js'));
  api.addRendererWrapperWithComponent(() => {
    if (opts.antd) {
      return join(__dirname, './locale-antd.js');
    }
  });
  // 添加对 locale 文件的 watch
  api.addPageWatcher(
    join(paths.absSrcPath, config.singular ? 'locale' : 'locales'),
  );
};
```

## 插件的顺序

插件的执行顺序依赖用户在配置文件 `.umirc.js` 或者 `config/config.js` 中配置的 `plugins` 配置项，有依赖的插件 umi 会通过插件的 `dependence` 配置检查插件的顺序做出警告，但是目前 umi 不会修改用户的顺序。

当插件调用 `api.applyPlugins` 触发插件的 hooks 时，hooks 的执行顺序对应 `plugins` 的顺序。至于 hooks 是否关心顺序由对应的 hooks 决定。

## 环境变量

### NODE_ENV

`process.env.NODE_ENV`，区分 development 和 production

## 系统级变量

### config

`.umirc.js` 或者 `config/config.js` 里面的配置。

### paths

- outputPath: 构建产物的生成目录
- absOutputPath: 构建产物的生成目录（绝对路径）
- pagesPath: page(s) 路径
- absPagesPath: page(s) 的绝对路径
- tmpDirPath: .umi 临时目录的路径
- absTmpDirPath: .umi 临时目录的路径（绝对路径）
- absSrcPath: src 目录的路径（绝对路径），用户缺省 src 时则对应为项目根目录
- cwd: 项目根目录
- absNodeModulesPath: node_modules 的绝对路径

### routes

umi 处理过后的路由信息。格式如下：

```js
const routes = [{
  path: '/xxx/xxx',
  component: '',
}];
```

## 系统级 API

### registerPlugin

加载插件，用于插件集等需要在一个插件中加载其它插件的场景。

```js
const demoPlugin = require('./demoPlugin');
api.registerPlugin({
  id: 'plugin-id',
  apply: demoPlugin,
  opts: {},
});
```

### registerMethod

注册插件方法，用于给插件添加新的方法给其它插件使用。

```js
// 类型通常和方法名对应 addXxx modifyXxx onXxx afterXxx beforeXxx
api.registerMethod('addDvaRendererWrapperWithComponent', {
  type: api.API_TYPE.ADD
  type: api.API_TYPE.EVENT
  type: api.API_TYPE.MODIFY
  apply: () => {} // for custom type
});
```

对于类型是 `api.API_TYPE.ADD` 的插件方法，你应该返回一项或者通过数组返回多项，也可以返回一个空数组，比如：

```js
api.addHTMLMeta({ /* ... */ });
api.addHTMLMeta([{ /* ... */ }, { /* ... */ }]);
api.addHTMLMeta(() => {
  if (opt === 'h5') {
    return { /* ... */ };
  }
  return [];
});
```

类型是 `api.API_TYPE.EVENT` 的插件方法，你应该传入一个 function 并且不需要返回任何内容。

类型是 `api.API_TYPE.MODIFY` 的插件方法，返回修改后的内容。

你也可以通过 `apply` 来自定义处理的函数，你注册的方法可能被多个插件使用，当你调用 `applyPlugins` 时在 umi 内部会通过 reduce 函数去处理这些插件的返回值。你定义的 `apply` 函数决定了 `applyPlugins` 是怎么处理多个插件的结果作为它的返回值的。通常情况下内置的三种类型就可以满足你的需求了。

### applyPlugins

在插件用应用通过 registerMethod 注册的某个方法。

```js
// 如果 type 为 api.API_TYPE.ADD wrappers 为各个插件返回的值组成的数组
// EVENT 则 wrappers 返回 undefined
// MODIFY 则返回最后的修改值
const wrappers = api.applyPlugins('wrapDvaRendererWithComponent');
```

### restart

```js
api.restart('why');
```

重新执行 `umi dev`，比如在 bigfish 中修改了 appType，需要重新挂载插件的时候可以调用该方法。

### rebuildTmpFiles

```js
api.rebuildTmpFiles('config dva changed');
```

重新生成 bootstrap file（entryFile）等临时文件，这个是最常用的方法，国际化，dva 等插件的配置变化都会用到。

### refreshBrowser

刷新浏览器。

### rebuildHTML

触发 HTML 重新构建。

### changePluginOption

设置插件的配置，比如在 react 插件集中中需要把插件集的 dva 配置传递给 dva 插件的时候用到。

```js
api.changePluginOption('dva-plugin-id', {
  immer: true
});
```

### registerCommand

注册 umi xxx 命令行，比如在 umi 内部 help 命令就是这么实现的。

```
api.registerCommand('help', {
  hide: true
}, args => {
  // more code...
});
```

### \_registerConfig

注册一个配置项，系统方法，通常不要使用。

```js
api._registerConfig(() => {
  return () => {
    return {
      name: 'dva',
      validate: validate,
      onChange(newConfig, oldConfig) {
        api.setPluginDefaultConfig('umi-plugin-dva', config);
      }
    };
  }
});
```

### \_modifyCommand

修改命令的名称和参数。

```js
// A demo for modify block npmClient to cnpm:
api._modifyCommand(({ name, args }) => {
  if (name === 'block') {
    args.npmClient = args.npmClient || 'cnpm';
  }
  return { name, args };
});
```

## 工具类 API

### log

```js
api.log.success('Done');
api.log.error('Error');
api.log.error(new Error('Error'));
api.log.debug('Hello', 'from', 'L59');
api.log.pending('Write release notes for %s', '1.2.0');
api.log.watch('Recursively watching build directory...');
```

输出[各种类型](https://github.com/klaussinani/signale/blob/94984998a0e9cb280e68959ddd9db70b49713738/types.js#L4)的日志。

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

xxx -> xxx.js xxx.ts xxx.jsx xxx.tsx

### findCSS

xxx -> xxx.css xxx.less xxx.scss xxx.sass

### compatDirname

先找用户项目目录，再找插件依赖。

## 事件类 API

事件类 API 遵循以 onXxxXxx, beforeXxx, afterXxx 的命名规范，接收一个参数为回调函数。

### beforeDevServer

dev server 启动之前。

### afterDevServer

dev server 启动之后。

### onStart

`umi dev` 或者 `umi build` 开始时触发。

### onDevCompileDone

`umi dev` 编译完成后触发。

```js
api.onDevCompileDone(({ isFirstCompile, stats }) => {
});
```

### onOptionChange

插件的配置改变的时候触发。

```js
export default (api, defaultOpts = { immer: false }) => {
  let opts = defaultOpts;
  api.onOptionChange((newOpts) => {
    opts = newOpts;
  	api.rebuildFiles();
  });
};
```

### onBuildSuccess

在 `umi build` 成功时候。主要做一些构建产物的处理。

```js
api.onBuildSuccess(({ stats }) => {
  // handle with stats
});
```

### onBuildFail

在 `umi build` 失败的时候。

### onHTMLRebuild

当 HTML 重新构建时被触发。

### onGenerateFiles

路由文件，入口文件生成时被触发。

### onPatchRoute

获取单个路由的配置时触发，可以在这里修改路由配置 `route`。比如可以向 `Routes` 中添加组件路径使得可以给路由添加一层封装。

```js
api.onPatchRoute({ route } => {
  // route:
  // {
  //   path: '/xxx',
  //   Routes: [] 
  // }
})
```

## 应用类 API

对于应用类 API，可以有直接调用和函数回调两种方式。

直接调用的示例如下：

```js
api.addRendererWrapperWithComponent('/path/to/component.js');
```

函数回调的示例如下：

```js
api.addRendererWrapperWithComponent(() => {
  if (opts.antd) {
    return '/path/to/component.js';
  }
});
```

下面是具体的 API。

### modifyDefaultConfig

设置 umi 的默认配置。

```js
api.modifyDefaultConfig(memo => {
  return {
    // 默认使用单数目录
    ...memo,
    singular: true,
  }
});
```

### addPageWatcher

添加 watch 的文件。

```js
api.addPageWatcher(['xxx.js', '*.mock.js']);
```

### addHTMLMeta

在 HTML 中添加 meta 标签。

### addHTMLLink

在 HTML 中添加 Link 标签。

### addHTMLStyle

在 HTML 中添加 Style 标签。

### addHTMLScript

在 HTML 尾部添加脚本。

```js
api.addHTMLScript({
  content: '',
  src: '',
  // ...attrs
});
```

### addHTMLHeadScript

在 HTML 头部添加脚本。

### modifyHTMLChunks <Badge text="2.1.0+"/>

修改 chunks，默认值是 `['umi']`。

### modifyHTMLWithAST

修改 HTML，基于 cheerio 。

参数：

* route，当前路由
* getChunkPath <Badge text="2.2.0+"/>，获取 chunk 的完整路径，包含 publicPath 和 hash 信息

例子：

```js
api.modifyHTMLWithAST(($, { route, getChunkPath }) => {
  $('head').append(`<script src="${getChunkPath('a.js')}"></script>`);
});
```

### modifyHTMLContext

修改 html ejs 渲染时的环境参数。

```js
api.modifyHTMLContext((memo, { route }) => {
  return {
    ...memo,
    title: route.title, // umi-plugin-react 的 title 插件包含了类似的逻辑
  };
});
```

### modifyRoutes

修改路由配置。

```js
api.modifyRoutes((routes) => {
  return routes;
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

### addEntryImportAhead

在入口文件在最上面 import 模块。

```js
api.addEntryImportAhead({
  source: '/path/to/module',
  specifier: 'name', // import 出来后的名称，可以缺省
});
```

### addEntryPolyfillImports

同 addEntryImportAhead，但作为 polyfill，所以添加在最前面。

### addEntryImport

在入口文件中 import 模块。

```js
api.addEntryImport({
  source: '/modulePath/xxx.js',
  specifier: 'moduleName',
});
```

### addEntryCodeAhead

在 render 之前添加代码。

```js
api.addEntryCodeAhead(`
  console.log('addEntryCodeAhead');
`);
```

### addEntryCode

在 render 之后添加代码。

### addRouterImport

在路由文件中添加模块引入。

### addRouterImportAhead

在路由文件头部添加模块引入。

### addRendererWrapperWithComponent

在 <App/> 外面包一层组件。

### addRendererWrapperWithModule

在挂载 <App/> 前执行一个 Module，支持异步。

### modifyEntryRender

modifyEntryRender

### modifyEntryHistory

modifyEntryHistory

### modifyRouteComponent

modifyRouteComponent

### modifyRouterRootComponent

modifyRouterRootComponent

### modifyWebpackConfig

修改 webpack 配置。

```js
// 示例
api.chainWebpackConfig((memo) => {
  return memo;
});
```

### modifyAFWebpackOpts

修改 af-webpack 配置。

```js
// 示例
api.modifyAFWebpackOpts((memo) => {
  return memo;
});
```

### addMiddleware

往开发服务器后面添加中间件。

### addMiddlewareAhead

往开发服务器前面添加中间件。

### addMiddlewareBeforeMock

在 mock 前添加中间件。

### addMiddlewareAfterMock

在 mock 后添加中间件。

### addVersionInfo

添加版本信息，在 `umi -v` 或 `umi version` 时显示。

### addRuntimePlugin

添加运行时插件，参数为文件的绝对路径。

比如：

```js
api.addRuntimePlugin(require.resolve('./app.js'));
```

然后在 app.js 是以下内容：

```
export function render(oldRender) {
  setTimeout(oldRender, 1000);
}
```

这样就实现了延迟 1s 渲染应用。

### addRuntimePluginKey

添加运行时可配置项。
