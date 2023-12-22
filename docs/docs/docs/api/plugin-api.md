---
order: 5
toc: content
---
# 插件 API

Umi 的核心就在于它的插件机制。基于 Umi 的插件机制，你可以获得扩展项目的编译时和运行时的能力。以下罗列出我们为你提供的所有的插件API，以帮助你能自由编写插件。

在查用 Umi 插件 API 之前，我们建议你先阅读[插件](../guides/plugins)一节，以了解 umi 插件的机制及原理，这将帮助你更好的使用插件 API。

> 为方便查找，以下内容通过字母排序。

## 核心 API
service 和 PluginAPI 里定义的方法。

### applyPlugins
```ts
api.applyPlugins({ key: string, type?: api.ApplyPluginsType, initialValue?: any, args?: any })
```
取得 `register()` 注册的 hooks 执行后的数据，这是一个异步函数，因此它返回的将是一个 Promise。这个方法的例子和详解见 [register](#register) api

### describe
```ts
api.describe({ key?:string, config?: { default , schema, onChange }, enableBy? })
```
在插件注册阶段( initPresets or initPlugins stage )执行，用于描述插件或者插件集的 key、配置信息和启用方式等。

- `key` 是配置中该插件配置的键名
- `config.default` 是插件配置的默认值，当用户没有在配置中配置 key 时，默认配置将生效。
- `config.schema` 用于声明配置的类型，基于 [joi](https://joi.dev/) 。 **如果你希望用户进行配置，这个是必须的** ，否则用户的配置无效
- `config.onChange` 是 dev 模式下，配置被修改后的处理机制。默认值为 `api.ConfigChangeType.reload`，表示在 dev 模式下，配置项被修改时会重启 dev 进程。 你也可以修改为 `api.ConfigChangeType.regenerateTmpFiles`, 表示只重新生成临时文件。你还可以传入一个方法，来自定义处理机制。
- `enableBy` 是插件的启用方式，默认是`api.EnableBy.register`，表示注册启用，即插件只要被注册就会被启用。可以更改为 `api.EnableBy.config` ，表示配置启用，只有配置插件的配置项才启用插件。你还可以自定义一个返回布尔值的方法（ true 为启用 ）来决定其启用时机，这通常用来实现动态生效。

e.g.
```ts
api.describe({
  key: 'foo',
  config: {
    schema(joi){
      return joi.string();
    },
    onChange: api.ConfigChangeType.regenerateTmpFiles,
  },
  enableBy: api.EnableBy.config,
})
```
这个例子中，插件的 `key` 为 `foo`，因此配置中的键名为 `foo`，配置的类型是字符串，当配置 `foo` 发生变化时，dev 只会重新生成临时文件。该插件只有在用户配置了 `foo` 之后才会启用。

### isPluginEnable
```ts
api.isPluginEnable( key：string)
```
判断插件是否启用，传入的参数是插件的 key

### register
```ts
api.register({ key: string, fn, before?: string, stage?: number})
```
为 `api.applyPlugins` 注册可供其使用的 hook。

- `key` 是注册的 hook 的类别名称，可以多次使用 `register` 向同一个 `key` 注册 hook，它们将会依次执行。这个 `key` 也同样是使用 `applyPlugins` 收集 hooks 数据时使用的 `key`。注意： **这里的 key 和 插件的 key 没有任何联系。** 
- `fn` 是 hook 的定义，可以是同步的，也可以是异步的（返回一个 Promise 即可）
- `stage` 用于调整执行顺序，默认为 0，设为 -1 或更少会提前执行，设为 1 或更多会后置执行。
- `before` 同样用于调整执行的顺序，传入的值为注册的 hook 的名称。注意：**`register` 注册的 hook 的名称是所在 Umi 插件的 id。** stage 和 before 的更多用法参考 [tapable](https://github.com/webpack/tapable)

注意： 相较于 `umi@3`， `umi@4` 去除了 `pluginId` 参数。

fn 的写法需要结合即将使用的 applyPlugins 的 type 参数来确定：
- `api.ApplyPluginsType.add` `applyPlugins` 将按照 hook 顺序来将它们的返回值拼接成一个数组。此时 `fn` 需要有返回值，`fn` 将获取 `applyPlugins` 的参数 `args` 来作为自己的参数。`applyPlugins` 的 `initialValue` 必须是一个数组，它的默认值是空数组。当 `key` 以 `'add'` 开头且没有显式地声明 `type` 时，`applyPlugins` 会默认按此类型执行。
- `api.ApplyPluginsType.modify` `applyPlugins` 将按照 hook 顺序来依次更改 `applyPlugins` 接收的 `initialValue`， 因此此时 **`initialValue` 是必须的** 。此时 `fn` 需要接收一个 `memo` 作为自己的第一个参数，而将会把 `applyPlugins` 的参数 `args` 来作为自己的第二个参数。`memo` 是前面一系列 hook 修改 `initialValue` 后的结果， `fn` 需要返回修改后的`memo` 。当 `key` 以 `'modify'` 开头且没有显式地声明 `type` 时，`applyPlugins` 会默认按此类型执行。
- `api.ApplyPluginsType.event` `applyPlugins` 将按照 hook 顺序来依次执行。此时不用传入 `initialValue` 。`fn` 不需要有返回值，并且将会把 `applyPlugins` 的参数 `args` 来作为自己的参数。当 `key` 以 `'on'` 开头且没有显式地声明 `type` 时，`applyPlugins` 会默认按此类型执行。

e.g.1 add 型
```ts
api.register({
  key: 'addFoo',
  // 同步
  fn: (args) => args
});

api.register({
  key: 'addFoo',
  // 异步
  fn: async (args) => args * 2
})

api.applyPlugins({
  key: 'addFoo',
  // key 是 add 型，不用显式声明为 api.ApplyPluginsType.add
  args: 1
}).then((data)=>{
  console.log(data); // [1,2]
})
```
e.g.2 modify 型
```ts
api.register({
  key: 'foo',
  fn: (memo, args) => ({ ...memo, a: args})
})
api.register({
  key: 'foo',
  fn: (memo) => ({...memo, b: 2})
})
api.applyPlugins({ 
  key: 'foo', 
  type: api.ApplyPluginsType.modify,
  // 必须有 initialValue
  initialValue: { 
    a: 0,
    b: 0
  },
  args: 1
}).then((data) => {
    console.log(data); // { a: 1, b: 2 }
});
```

### registerCommand
```ts
api.registerCommand({
  name: string,
  description? : string,
  options? : string,
  details? : string,
  fn,
  alias? : string | string[]
  resolveConfigMode? : 'strict' | 'loose'
})
```
注册命令。
- `alias` 为别名，比如 generate 的别名 g
- `fn` 的参数为 `{ args }`， args 的格式同 [yargs](https://github.com/yargs/yargs) 的解析结果，需要注意的是 `_` 里的 command 本身被去掉了，比如执行`umi generate page foo`，`args._` 为 `['page','foo']`
- `resolveConfigMode` 参数控制执行命令时配置解析的方式，`strict` 模式下强校验 Umi 项目的配置文件内容，如果有非法内容中断命令执行；`loose` 模式下不执行配置文件的校验检查。

### registerMethod
```ts
api.registerMethod({ name: string, fn? })
```
往 api 上注册一个名为 `'name'` 的方法。

- 当传入了 fn 时，执行 fn
- 当没有传入 fn 时，`registerMethod` 会将 `name` 作为 `api.register` 的 `key` 并且将其柯里化后作为 `fn`。这种情况下相当于注册了一个 `register` 的快捷调用方式，便于注册 hook。

注意： 
- 相较于 `umi@3`， `umi@4` 去除了 exitsError 参数。
- 通常不建议注册额外的方法，因为它们不会有 ts 提示，直接使用 `api.register()` 是一个更安全的做法。

e.g.1
```ts
api.registerMethod({
  name: foo,
  // 有 fn
  fn: (args) => {
    console.log(args);
  }
})
api.foo('hello, umi!'); // hello, umi!
```
该例子中，我们往api上注册了一个 foo 方法，该方法会把参数 console 到控制台。

e.g.2
```ts
import api from './api';

api.registerMethod({
  name: 'addFoo'
  // 没有 fn
})

api.addFoo( args => args );
api.addFoo( args => args * 2 );

api.applyPlugins({
  key: 'addFoo',
  args: 1
}).then((data)=>{
  console.log(data); // [ 1, 2 ]
});
```
该例子中，我们没有向 `api.registerMethod` 中传入 fn。此时，我们相当于往 api 上注册了一个"注册器"：`addFoo`。每次调用该方法都相当于调用了 `register({ key: 'addFoo', fn })`。因此当我们使用 `api.applyPlugins` 的时候（由于我们的方法是 add 型的，可以不用显式声明其 type ）就可以获取刚刚注册的 hook 的值。

### registerPresets
```ts
api.registerPresets( presets: string[] )
```
注册插件集，参数为路径数组。该 api 必须在 initPresets stage 执行，即只可以在 preset 中注册其他 presets

e.g.
```ts
api.registerPresets([
  './preset',
  require.resolve('./preset_foo')
])
```

### registerPlugins
```ts
api.registerPlugins( plugins: string[] )
```
注册插件，参数为路径数组。该 api 必须在 initPresets 和 initPlugins stage 执行。

e.g.
```ts
api.registerPlugins([
  './plugin',
  require.resolve('./plugin_foo')
])
```

注意： 相较于 `umi@3` ，`umi@4` 不再支持在 `registerPresets` 和 `registerPlugins` 中直接传入插件对象了，现在只允许传入插件的路径。

### registerGenerator

注册微生成器用来快捷生成模板代码。

示例：

```ts
import { GeneratorType } from '@umijs/core';
import { logger } from '@umijs/utils';
import { join } from 'path';
import { writeFileSync } from 'fs';

api.registerGenerator({
  key: 'editorconfig',
  name: 'Create .editorconfig',
  description: 'Setup editorconfig config',
  type: GeneratorType.generate,
  fn: () => {
    const configFilePath = join(api.cwd, '.editorconfig')
    if (existsSync(configFilePath)) {
      logger.info(`The .editorconfig file already exists.`)
      return
    }
    writeFileSync(
      configFilePath,
      `
# 🎨 http://editorconfig.org
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
`.trimStart(),
      'utf-8'
    )
    logger.info(`Generate .editorconfig file successful.`)
  }
})
```

更多示例见 [`已有生成器源码`](https://github.com/umijs/umi/tree/master/packages/preset-umi/src/commands/generators) 。

### skipPlugins
```ts
api.skipPlugins( keys: string[])
```
声明哪些插件需要被禁用，参数为插件 key 的数组

## 扩展方法
通过`api.registerMethod()` 扩展的方法，它们的作用都是注册一些 hook 以供使用，因此都需要接收一个 fn。这些方法中的大部分都按照 `add-` `modify-` `on-` 的方式命名，它们分别对应了 `api.ApplyPluginsType`的三种方式，不同方式接收的 fn 不太相同，详见 [register](#register) 一节。

注意： 下文提到的所有 fn 都可以是同步的或者异步的（返回一个 Promise 即可）。fn 都可以被

```ts
{
  fn,
  name?: string,
  before?: string | string[],
  stage: number,
}

```
代替。其中各个参数的作用详见 [tapable](https://github.com/webpack/tapable)

### addBeforeBabelPlugins
增加额外的 Babel 插件。传入的 fn 不需要参数，且需要返回一个 Babel 插件或插件数组。
```ts
api.addBeforeBabelPlugins(() => {
  // 返回一个 Babel 插件（来源于 Babel 官网的例子）
  return () => {
    visitor: {
      Identifier(path) {
        const name = path.node.name;
        path.node.name = name.split("").reverse().join("");
      }
    }
  }
})
```

### addBeforeBabelPresets
增加额外的 Babel 插件集。传入的 fn 不需要参数，且需要返回一个 Babel 插件集( presets )或插件集数组。
```ts
api.addBeforeBabelPresets(() => {
  // 返回一个 Babel 插件集
  return () => {
    return {
      plugins: ["Babel_Plugin_A","Babel_Plugin_B"]
    }
  }
})
```

### addBeforeMiddlewares
在 webpack-dev-middleware 之前添加中间件。传入的 fn 不需要参数，且需要返回一个 express 中间件或其数组。
```ts
api.addBeforeMiddlewares(() => {
  return (req, res, next) => {
    if(false) {
      res.end('end');
    }
    next();
  }
})
```

### addEntryCode
在入口文件的最后面添加代码（render 后）。传入的 fn 不需要参数，且需要返回一个 string 或者 string 数组。
```ts
api.addEntryCode(() => `console.log('I am after render!')`);
```

### addEntryCodeAhead
在入口文件的最前面添加代码（render 前，import 后）。传入的 fn 不需要参数，且需要返回一个 string 或者 string 数组。
```ts
api.addEntryCodeAhead(() => `console.log('I am before render!')`)
```

### addEntryImports
在入口文件中添加 import 语句 （import 最后面）。传入的 fn 不需要参数，其需要返回一个 `{source: string, specifier?: string}` 或其数组。
```ts
api.addEntryImports(() => ({
  source: '/modulePath/xxx.js',
  specifier: 'moduleName'
}))
```

### addEntryImportsAhead
在入口文件中添加 import 语句 （import 最前面）。传入的 fn 不需要参数，其需要返回一个 `{source: string, specifier?: string}` 或其数组。
```ts
api.addEntryImportsAhead(() => ({
  source: 'anyPackage'
}))
```

### addExtraBabelPlugins
添加额外的 Babel 插件。 传入的 fn 不需要参数，且需要返回一个 Babel 插件或插件数组。

### addExtraBabelPresets
添加额外的 Babel 插件集。传入的 fn 不需要参数，且需要返回一个 Babel 插件集或其数组。

### addHTMLHeadScripts
往 HTML 的 `<head>` 元素里添加 Script。传入的 fn 不需要参数，且需要返回一个 string（想要加入的代码） 或者 `{ async?: boolean, charset?: string, crossOrigin?: string | null, defer?: boolean, src?: string, type?: string, content?: string }` 或者它们的数组。
```ts
api.addHTMLHeadScripts(() => `console.log('I am in HTML-head')`)
```

### addHTMLLinks 
往 HTML 里添加 Link 标签。 传入的 fn 不需要参数，返回的对象或其数组接口如下：
```ts
{  
  as?: string, crossOrigin: string | null, 
  disabled?: boolean,
  href?: string,
  hreflang?: string,
  imageSizes?: string,
  imageSrcset?: string,
  integrity?: string,
  media?: string,
  referrerPolicy?: string,
  rel?: string,
  rev?: string,
  target?: string,
  type?: string 
}
```

### addHTMLMetas
往 HTML 里添加 Meta 标签。 传入的 fn 不需要参数，返回的对象或其数组接口如下：
```ts
{
  content?: string,
  'http-equiv'?: string,
  name?: string,
  scheme?: string  
}
```

### addHTMLScripts
往 HTML 尾部添加 Script。 传入的 fn 不需要参数，返回的对象接口同 [addHTMLHeadScripts](#addHTMLHeadScripts) 

### addHTMLStyles
往 HTML 里添加 Style 标签。 传入的 fn 不需要参数，返回一个 string （style 标签里的代码）或者 `{ type?: string, content?: string }`，或者它们的数组。


### addLayouts
添加全局 layout 组件。 传入的 fn 不需要参数，返回 `{ id?: string, file: string }`

### addMiddlewares
添加中间件，在 route 中间件之后。 传入的 fn 不需要参数，返回 express 中间件。

### addPolyfillImports
添加补丁 import，在整个应用的最前面执行。 传入的 fn 不需要参数，返回 `{ source: string, specifier?:string }`

### addPrepareBuildPlugins

### addRuntimePlugin
添加运行时插件，传入的 fn 不需要参数，返回 string ，表示插件的路径。

### addRuntimePluginKey
添加运行时插件的 Key， 传入的 fn 不需要参数，返回 string ，表示插件的路径。

### addTmpGenerateWatcherPaths
添加监听路径，变更时会重新生成临时文件。传入的 fn 不需要参数，返回 string，表示要监听的路径。

### addOnDemandDeps
添加按需安装的依赖，他们会在项目启动时检测是否安装：

```ts
  api.addOnDemandDeps(() => [{ name: '@swc/core', version: '^1.0.0', dev: true }])
```

### chainWebpack
通过 [webpack-chain](https://github.com/neutrinojs/webpack-chain) 的方式修改 webpack 配置。传入一个fn，该 fn 不需要返回值。它将接收两个参数：
- `memo` 对应 webpack-chain 的 config
- `args:{ webpack, env }`  `arg.webpack` 是 webpack 实例， `args.env` 代表当前的运行环境。

e.g.
```ts
api.chainWebpack(( memo, { webpack, env}) => {
  // set alias
  memo.resolve.alias.set('a','path/to/a');
  // Delete progess bar plugin
  memo.plugins.delete('progess');
})
```

### modifyAppData （`umi@4` 新增）

修改 app 元数据。传入的 fn 接收 appData 并且返回它。
```ts
api.modifyAppData((memo) => {
  memo.foo = 'foo';
  return memo;
})
```

### modifyConfig
修改配置，相较于用户的配置，这份是最终传给 Umi 使用的配置。传入的 fn 接收 config 作为第一个参数，并且返回它。另外 fn 可以接收 `{ paths }` 作为第二个参数。`paths` 保存了 Umi 的各个路径。
```ts
api.modifyConfig((memo, { paths }) => {
  memo.alias = {
    ...memo.alias,
    '@': paths.absSrcPath
  }
  return memo;
})
```

### modifyDefaultConfig
修改默认配置。传入的 fn 接收 config 并且返回它。

### modifyHTML
修改 HTML，基于 cheerio 的 ast。传入的 fn 接收 cheerioAPI 并且返回它。另外 fn 还可以接收`{ path }` 作为它的第二个参数，该参数代表路由的 path
```ts
api.modifyHTML(($, { path }) => {
  $('h2').addClass('welcome');
  return $;
})
```

### modifyHTMLFavicon
修改 HTML 的 favicon 路径。 传入的 fn 接收原本的 favicon 路径(string 类型)并且返回它。 

### modifyPaths
修改 paths，比如 absOutputPath、absTmpPath。传入的 fn 接收 paths 并且返回它。

paths 的接口如下：
```ts
paths:{
  cwd?: string;
  absSrcPath?: string;
  absPagesPath?: string;
  absTmpPath?: string;
  absNodeModulesPath?: string;
  absOutputPath?: string;
}
```

### modifyRendererPath
修改 renderer path。传入的 fn 接收原本的 path （string 类型）并且返回它。

### modifyServerRendererPath
修改 server renderer path。传入的 fn 接收原本的 path （string 类型）并且返回它。

### modifyRoutes
修改路由。 传入的 fn 接收 id-route 的 map 并且返回它。其中 route 的接口如下：
```ts
interface IRoute {
  path: string;
  file?: string;
  id: string;
  parentId?: string;
  [key: string]: any;
}
```
e.g.
```ts
api.modifyRoutes((memo) => {
  Object.keys(memo).forEach((id) => {
    const route = memo[id];
    if(route.path === '/'){
      route.path = '/redirect'
    }
  });
  return memo;
})
```

### modifyTSConfig

修改临时目录下的 tsconfig 文件内容。

```ts
api.modifyTSConfig((memo) => {
  memo.compilerOptions.paths['foo'] = ['bar'];
  return memo;
});
```

### modifyViteConfig
修改 vite 最终配置。 传入的 fn 接收 vite 的 Config 对象作为第一个参数并且返回它。另外 fn 还可以接收 `{ env }` 作为第二个参数，可以通过该参数获取当前的环境。
```ts
api.modifyViteConfig((memo, { env }) => {
  if(env === 'development'){
    // do something
  }
  return memo;
})
```
### modifyWebpackConfig
修改 webpack 最终配置。传入的 fn 接收 webpack 的 Config 对象作为第一个参数并且返回它。另外 fn 还可以接收 `{ webpack, env }` 作为第二个参数，其中 webpack 是 webpack 实例，env 代表当前环境。

```ts
api.modifyWebpackConfig((memo, { webpack, env }) => {
  // do something
  
  return memo;
})
```

### onBeforeCompiler
generate 之后，webpack / vite compiler 之前。传入的 fn 不接收任何参数。

### onBeforeMiddleware
提供在服务器内部执行所有其他中间件之前执行自定义中间件的能力, 这可以用来定义自定义处理程序， 例如:

```ts
api.onBeforeMiddleware(({ app }) => {
  app.get('/some/path', function (req, res) {
    res.json({ custom: 'response' });
  });
});
```

### onBuildComplete
build 完成时。传入的 fn 接收 `{ isFirstCompile: boolean, stats, time: number, err?: Error }` 作为参数。

### onBuildHtmlComplete
build 完成且 html 完成构建之后。

### onCheck
检查时，在 onStart 之前执行。传入的 fn 不接收任何参数

### onCheckCode
检查代码时。传入的 fn 接收的参数接口如下：
```ts
args: {
  file: string;
  code: string;
  isFromTmp: boolean;
  imports: {
    source: string;
    loc: any;
    default: string;
    namespace: string;
    kind: babelImportKind;
    specifiers: Record<string, { name: string; kind: babelImportKind }>;
  }[];
  exports: any[];
  cjsExports: string[]; 
}
```

### onCheckConfig
检查 config 时。传入的 fn 接收 `{ config, userConfig }`作为参数，它们分别表示实际的配置和用户的配置。

### onCheckPkgJSON
检查 package.json 时。传入的 fn 接收 `{origin?, current}` 作为参数。它们的类型都是 package.json 对象

### onDevCompileDone
dev 完成时。传入的 fn 接收的参数接口如下：
```ts
args: {
  isFirstCompile: boolean;
  stats: any;
  time: number; 
}
```

### onGenerateFiles
生成临时文件时，随着文件变化会频繁触发，有缓存。 传入的 fn 接收的参数接口如下：
```ts
args: {
  isFirstTime?: boolean;
  files?: {
    event: string;
    path: string;
  } | null;
}
```


### onPatchRoute
匹配单个路由，可以修改路由，给路由打补丁


### onPkgJSONChanged
package.json 变更时。传入的 fn 接收 `{origin?, current}` 作为参数。它们的类型都是 package.json 对象

### onPrepareBuildSuccess

### onStart
启动时。传入的 fn 不接收任何参数。


### writeTmpFile
`api.writeTmpFile()`的 type 参数的类型。

- content: 写入的文本内容，有内容就不会使用模板。
- context: 模板上下文。
- noPluginDir: 是否使用插件名做为目录。
- path: 写入文件的路径。
- tpl: 使用模板字符串，没有模板路径会使用它。
- tplPath: 使用模板文件的路径。


## 属性
从 api 可以直接访问到的属性，这些属性有一部分来自于 service

### appData

### args
命令行参数，这里去除了命令本身。

e.g.
- `$ umi dev --foo`,  args 为 `{ _:[], foo: true }`
- `$ umi g page index --typescript --less` , args 为 `{ _: [ 'page', 'index''], typescript: true, less: true }`

### config
最终的配置（取决于你访问的时机，可能是当前收集到的最终配置）

### cwd
当前路径

### env
即 `process.env.NODE_ENV` 可能有 `development`、`production` 和 `test`

### logger
插件日志对象，包含 `{ log, info, debug, error, warn, profile }`，他们都是方法。其中 `api.logger.profile` 可用于性能耗时记录。

```ts
api.logger.profile('barId');
setTimeout(() => {
  api.logger.profile('barId');
})
// profile - barId Completed in 6254ms
```

### name
当前命令的名称，例如 `$ umi dev `， `name` 就是 `dev`

### paths
项目相关的路径：
- `absNodeModulesPath`，node_modules 目录绝对路径
- `absOutputPath`，输出路径，默认是 ./dist
- `absPagesPath`，pages 目录绝对路径
- `absSrcPath`，src 目录绝对路径，需注意 src 目录是可选的，如果没有 src 目录，absSrcPath 等同于 cwd
- `absTmpPath`，临时目录绝对路径
- `cwd`，当前路径

注意： 注册阶段不能获取到。因此不能在插件里直接获取，要在 hook 里使用。

### pkg
当前项目的 `package.json` 对象

### pkgPath
当前项目的 `package.json` 的绝对路径。

### plugin
当前插件的对象。
- `type` 插件类型，有 preset 和 plugin 两种
- `path` 插件路径
- `id` 插件 id
- `key` 插件 key
- `config` 插件的配置
- `enableBy` 插件的启用方式

注意： 注册阶段使用的 plugin 对象是你 `describe` 之前的对象。

### service
Umi 的 `Service` 实例。通常不需要用到，除非你知道为什么。

### userConfig
用户的配置，从 `.umirc` 或 `config/config` 中读取的内容，没有经过 defaultConfig 以及插件的任何处理。可以在注册阶段使用。

### ApplyPluginsType
`api.applyPlugins()` 的 type 参数的类型。包含
- add
- modify
- event

### ConfigChangeType
为 `api.describe()` 提供 `config.onChange` 的类型，目前包含两种：
- restart，重启 dev 进程，是默认值
- regenerateTmpFiles，重新生成临时文件

### EnableBy
插件的启用方式，包含三种：
- register
- config

### ServiceStage
Umi service 的运行阶段。有如下阶段：
- uninitialized
- init
- initPresets
- initPlugins
- resolveConfig
- collectAppData
- onCheck
- onStart
- runCommand
