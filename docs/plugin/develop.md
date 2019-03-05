---
sidebarDepth: 2
---

# Plugin develop

## initialize plugin

You can create a umi plugin scaffold in a simple way with [create-umi](https://github.com/umijs/create-umi):

```shell
$ yarn create umi --plugin
```

In umi, the plugin is actually a JS module, you need to define a plugin initialization method and export by default. The following example:

```js
export default (api, opts) => {
  // your plugin code here
};
```

It should be noted that if your plugin needs to be published as an npm package, then you need to compile before publishing, to ensure that the code in the release is ES5 code.

The initialization method will receive two parameters, the first parameter `api`, the interface provided by the umi to the plugin is exposed through it. The second parameter, `opts`, is filled in by the user when initializing the plugin.

## Introduction to the plugin interface

All of umi's plugin interfaces are provided through the api when the plugin is initialized. Divided into the following categories:

- Environment variables, some environment variables that can be used in the plugin
- System-level variables, variables or constants exposed by some plug-in systems
- Tools API, some commonly used tool class methods
- System level API, some core methods exposed by plugin systems
- Event class API, key event points provided by some plugin systems
- Application class API, API for implementing plugin function requirements, there are two methods of direct call and function callback

**Note:** All APIs are used by the `api.[theApiName]` method, and the internal APIs are uniformly prefixed with `_`.

Here's a basic usage example:

```js
export default (api, opts) => {
  api.onOptionChange(() => {
    api.rebuildTmpFiles();
  });
}
```

## Plugin demo

The following is an example of plugin example code refer to `umi-plugin-locale` plugin code. For a complete example, see [source code](https://github.com/umijs/umi/blob/master/packages/umi- Plugin-locale/src/index.js).

```js
export default (api, opts = {}) => {
  const { paths } = api;
  // Linstening plugin options changes
  api.onOptionChange((newOpts) => {
    opts = newOpts;
    api.rebuildTmpFiles();
  });
  // add Provider wrapper
  api.addRendererWrapperWithComponent(join(__dirname, './locale.js'));
  api.addRendererWrapperWithComponent(() => {
    if (opts.antd) {
      return join(__dirname, './locale-antd.js'));
    }
  });
  // add watcher on locale files
  api.addPageWatcher(
    join(paths.absSrcPath, config.singular ? 'locale' : 'locales'),
  );
};
```

## Plugins order

The execution order of the plugins depends on the `plugins` configuration item configured by the user in the configuration file `.umirc.js` or `config config.js`. The dependent plugin umi will check the order of the plugins through the plugin's `dependence` configuration. A warning is issued, but currently umi does not modify the order of the users.

When the plugin calls `api.applyPlugins` to trigger the hooks of the plugin, the execution order of the hooks corresponds to the order of `plugins`. The order in which hooks are concerned is determined by the corresponding hooks.

## Environmental variable

### NODE_ENV

`process.env.NODE_ENV`, Distinguish between development and production

## System level variable

### config

configuration in `.umirc.js` or `config/config.js`.

### paths

- outputPath
- absOutputPath
- pagesPath
- absPagesPath
- tmpDirPath
- absTmpDirPath
- absSrcPath
- cwd: project root
- absNodeModulesPath

### routes

umi processed routing information. The format is as follows:

```js
const routes = [{
  path: '/xxx/xxx',
  component: '',
}];
```

## System level API

### registerPlugin

Register a plugin, usually used for plugin set.

```js
const demoPlugin = require('./demoPlugin');
api.registerPlugin({
  id: 'plugin-id',
  apply: demoPlugin,
  opts: {},
});
```

### registerMethod

Register a plugin method to add a new method to the plugin for use by other plugins.

```js
// Type usually corresponds to the method name addXxx modifyXxx onXxx afterXxx beforeXxx
api.registerMethod('addDvaRendererWrapperWithComponent', {
  type: api.API_TYPE.ADD
  type: api.API_TYPE.EVENT
  type: api.API_TYPE.MODIFY
  apply: () => {} // for custom type
});
```

For plugin methods of type `api.API_TYPE.ADD`, you should return an item or return a multiple of the array, or you can return an empty array, such as:

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

The type is a plugin method of `api.API_TYPE.EVENT`, you should pass in a function and don't need to return anything.

The plugin method of type `api.API_TYPE.MODIFY` returns the modified content.

You can also use `apply` to customize the processing function. Your registered method may be used by multiple plugins. When you call `applyPlugins`, the return value of these plugins will be processed by the reduce function inside umi. The `apply` function you define determines how `applyPlugins` handles the result of multiple plugins as its return value. Usually three types of built-in can meet your needs.

### applyPlugins

Trigger a method registered by the app via `registerMethod`.

```js
// If the type is api.API_TYPE.ADD wrappers an array of values returned by each plugin
// EVENT wrapper returns undefined
// MODIFY returns the last modified value
const wrappers = api.applyPlugins('wrapDvaRendererWithComponent');
```

### restart

```js
api.restart('why');
```

rerun `umi dev`.

### rebuildTmpFiles

```js
api.rebuildTmpFiles('config dva changed');
```

regenerate bootstrap file (entryFile), this is the most commonly used method, plugins such as dva and locale will be used.

### refreshBrowser

refresh browser.

### rebuildHTML

Trigger HTML rebuild.

### changePluginOption

Set the options of the plugin, such as when you need to pass the dva configuration of the plugin set to the dva plugin in the umi-plugin-react.

```js
api.changePluginOption('dva-plugin-id', {
  immer: true
});
```

### registerCommand

Register the umi xxx command line, as in the umi internal help command.

```js
api.registerCommand('help', {
  hide: true
}, args => {
  // more code...
});
```

### \_registerConfig

Register a configuration item, system method, usually do not use.

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

Modify command name and args.

```js
// A demo for modify block npmClient to cnpm:
api._modifyCommand(({ name, args }) => {
  if (name === 'block') {
    args.npmClient = args.npmClient || 'cnpm';
  }
  return { name, args };
});
```

## Tool class API

### log

```js
api.log.success('Done');
api.log.error('Error');
api.log.error(new Error('Error'));
api.log.debug('Hello', 'from', 'L59');
api.log.pending('Write release notes for %s', '1.2.0');
api.log.watch('Recursively watching build directory...');
```

Output various [types](https://github.com/klaussinani/signale/blob/94984998a0e9cb280e68959ddd9db70b49713738/types.js#L4) of logs.

### winPath

```js
api.winPath('/path/to.js');
```

Convert the file path to a path compatible with window to add code such as `require('/xxx/xxx.js')`.

### debug

```js
api.debug('msg');
```

### findJS

xxx -> xxx.js xxx.ts xxx.jsx xxx.tsx

### findCSS

xxx -> xxx.css xxx.less xxx.scss xxx.sass

### compatDirname

Look for the user project directory first, then find the plugin dependencies.

## Event class API

The event class API follows the naming convention of onXxxXxx, beforeXxx, afterXxx and receives a parameter as a callback function.

### beforeDevServer

Before dev server start.

### afterDevServer

After dev server start.

### onStart

Triggered when `umi dev` or `umi build` start.

### onDevCompileDone

Triggered after `umi dev` compilation is complete.

```js
api.onDevCompileDone(({ isFirstCompile, stats }) => {
});
```

### onOptionChange

Triggered when the configuration of the plugin changes.

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

When the `umi build` was successful. Mainly do some processing of the construction products.

```js
api.onBuildSuccess(({ stats })=> {
  // handle with stats
});
```

### onBuildFail

When the `umi build` failed.

### onHTMLRebuild

Triggered when the HTML is rebuilt.

### onGenerateFiles

The routing file is triggered when the entry file is generated.

### onPatchRoute

Triggered when getting the configuration of a single route, you can modify the route configuration `route` here. For example, you can add a component path to `Routes` to add a layer of encapsulation to the route.

```js
api.onPatchRoute({ route } => {
  // route:
  // {
  //   path: '/xxx',
  //   Routes: [] 
  // }
})
```

## Application class API

For the application class API, there are two ways to use: direct calling and function callback.

direct calling:

```js
api.addRendererWrapperWithComponent('/path/to/component.js');
```

function callback:

```js
api.addRendererWrapperWithComponent(() => {
  if (opts.antd) {
    return '/path/to/component.js';
  }
});
```

Below is the specific API.

### modifyDefaultConfig

set umi default configuration.

```js
api.modifyDefaultConfig(memo => {
  return {
    ...memo,
    singular: true,
  }
});
```

### addPageWatcher

add watching files.

```js
api.addPageWatcher(['xxx.js', '*.mock.js']);
```

### addHTMLMeta

add meta in HTML.

### addHTMLLink

add link in HTML.

### addHTMLStyle

add tyle in HTML.

### addHTMLScript

Add a script at the bottom of the HTML.

```js
api.addHTMLScript({
  content: '',
  src: '',
  // ...attrs
});
```

### addHTMLHeadScript

Add a script to the HTML head.

### modifyHTMLChunks <Badge text="2.1.0+"/>

Modify chunks in HTML, default `['umi']`.

### modifyHTMLWithAST

Modify the HTML, based on cheerio.

Options:

* route, current route
* getChunkPath <Badge text="2.2.0+"/>, get the full path of chunk, including publicPath and hash

e.g.

```js
api.modifyHTMLWithAST(($, { route, getChunkPath }) => {
  $('head').append(`<script src="${getChunkPath('a.js')}"></script>`);
});
```

### modifyHTMLContext

Modify the environment parameters when html ejs is rendered.

```js
api.modifyHTMLContext((memo, { route }) => {
  return {
    ...memo,
    title: route.title, // The title plugin for umi-plugin-react contains similar logic
  };
});
```

### modifyRoutes

Modify the routing configuration.

```js
api.modifyRoutes((routes) => {
  return routes;
})
```

The format of the route configuration is as follows:

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

add import at the top of the entry file.

```js
api.addEntryImportAhead({
  source: '/path/to/module',
  specifier: 'name', // module name with import, can be ignored
});
```

### addEntryPolyfillImports

Same as `addEntryImportAhead`, but as a polyfill, so add it first.

### addEntryImport

Import module in the entry file.

```js
api.addEntryImport({
  source: '/modulePath/xxx.js',
  specifier: 'moduleName',
});
```

### addEntryCodeAhead

Add code before render.

```js
api.addEntryCodeAhead(`
  console.log('addEntryCodeAhead');
`);
```

### addEntryCode

Add code after render.

### addRouterImport

Add a module import to the routing file.

### addRouterImportAhead

Add a module to the header of the routing file to introduce.

### addRendererWrapperWithComponent

Wrapper a component outside the <App/>.

### addRendererWrapperWithModule

Excute a module before mount <App/>.

### modifyEntryRender

modifyEntryRender

### modifyEntryHistory

modifyEntryHistory

### modifyRouteComponent

modifyRouteComponent

### modifyRouterRootComponent

modifyRouterRootComponent

### modifyWebpackConfig

modify webpack Configuration.

```js
// demo
api.chainWebpackConfig((memo) => {
  return memo;
});
```

### modifyAFWebpackOpts

Modify the af-webpack configuration.

```js
// demo
api.modifyAFWebpackOpts((memo) => {
  return memo;
});
```

### addMiddleware

Append middleware to the dev server.

### addMiddlewareAhead

Add middleware to the front of the development server.

### addMiddlewareBeforeMock

Add middleware before the mock.

### addMiddlewareAfterMock

Add middleware after the mock.

### addVersionInfo

Added version information, displayed in `umi -v` or `umi version`.

### addRuntimePlugin

Add a runtime plugin with parameters as the absolute path to the file.

e.g.

```js
api.addRuntimePlugin(require.resolve('./app.js'));
```

Then in `app.js`:

```
export function render(oldRender) {
  setTimeout(oldRender, 1000);
}
```

This implements a 1 second delayed rendering application.

### addRuntimePluginKey

Add a runtime configurable item.
