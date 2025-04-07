---
order: 16
toc: content
---
# 开发插件
Umi 的核心就在于它的插件机制。基于 Umi 的插件机制，你可以获得扩展项目的编译时和运行时的能力。你可以利用我们提供的 [插件API](../api/plugin-api) 来自由地编写插件，进而实现修改代码打包配置、修改启动代码、约定目录结构、修改 HTML 等丰富的功能。

## 核心概念
插件的本质就是一个方法，该方法接收了一个参数：api。在插件中，你可以调用 api 提供的方法进行一些 hook 的注册，随后 Umi 会在特定的时机执行这些 hook。

比如：
```js
import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'changeFavicon',
    config: {
      schema(joi) {
        return joi.string();
      },
    },
    enableBy: api.EnableBy.config
  });
  api.modifyConfig((memo)=>{
    memo.favicons = api.userConfig.changeFavicon;
    return memo;
  });
};
```
这个插件的作用是根据用户配置的 changeFavicon 值来更改配置中的 favicons，（一个很简单且没有实际用途的例子XD）。可以看到插件其实就是一个接收了参数 api 的方法。在这个方法中，我们调用了 `api.modifyConfig` 注册了一个 hook： `(memo)=>{...}`。当你在配置中配置了 `changeFavicon` 之后， Umi 会注册该插件。在 Umi 收集配置的生命周期里，我们在插件里注册的 hook 将被执行，此时配置中的 `favicon` 就会被修改为用户配置中的 `changeFavicon` 。

### plugin 和 preset
preset 的作用是预设一些插件，它通常用来注册一批 presets 和 plugins。在 preset 中，上述提到的接受 api 的方法可以有返回值，该返回值是一个包含 plugins 和 presets 属性的对象，其作用就是注册相应的插件或者插件集。

比如：
```js
import { IApi } from 'umi';

export default (api: IApi) => {
  return {
    plugins: ['./plugin_foo','./plugin_bar'],
    presets: ['./preset_foo']
  }
};
```
它们的注册顺序是值得注意的：presets 始终先于 plugins 注册。Umi 维护了两个队列分别用来依次注册 presets 和 plugins，这个例子中的注册的 `preset_foo` 将被置于 presets 队列队首，而 `plugin_foo` 和 `plugin_bar` 将被依次置于 plugins 队列队尾。这里把 preset 放在队首的目的在于保证 presets 之间的顺序和关系是可控的。

另外一个值得注意的点是：在 plugin 中，你也可以 return 一些 plugins 或者 presets，但是 Umi 不会对它做任何事情。

### 插件的 id 和 key
每个插件都对应一个 id 和 key。

id 是插件所在路径的简写，作为插件的唯一标识；而 key 则是用于插件配置的键名。 

比如插件 `node_modules/@umijs/plugin-foo/index.js` ，通常来说，它的 id 是 `@umijs/plugin-foo` , key 是 `foo`。此时就允许开发者在配置中来配置键名为 `foo` 的项，用来对插件进行配置。

## 启用插件
插件有两种启用方式： 环境变量中启用和配置中启用。（与 `umi@3` 不同，我们不再支持对 `package.json` 中依赖项的插件实现自动启用）

注意：这里的插件指的是第三方插件，Umi 的内置插件统一在配置中通过对其 key 进行配置来启用。

### 环境变量
还可以通过环境变量 `UMI_PRESETS` 和 `UMI_PLUGINS` 注册额外插件。
比如：
```shell
$ UMI_PRESETS = foo/preset.js umi dev
```
注意： 项目里不建议使用，通常用于基于 Umi 的框架二次封装。

### 配置
在配置里通过 `presets` 和 `plugins` 配置插件，比如：
```js
export default {
  presets: ['./preset/foo','bar/presets'],
  plugins: ['./plugin', require.resolve('plugin_foo')]
}
```
配置的内容为插件的路径。

### 插件的顺序
Umi 插件的注册遵循一定的顺序：
- 所有的 presets 都先于 plugins 被注册。
- 内置插件 -> 环境变量中的插件 -> 用户配置中的插件
- 同时注册（同一个数组里）的插件按顺序依次注册。
- preset 中注册的 preset 立即执行， 注册的 plugin 最后执行。

## 禁用插件
有两种方式禁用插件
### 配置 key 为 false
比如：
```js
export default{
  mock: false
}
```
会禁用 Umi 内置的 mock 插件。

### 在插件中禁用其他插件
可通过 `api.skipPlugins(pluginId[])` 的方式禁用，详见[插件 API](../api/plugin-api)。

## 查看插件注册情况
### 命令行
```shell
$ umi plugin list
```

## 配置插件
通过配置插件的 key 来配置插件，比如：
```js
export default{
  mock: { exclude: ['./foo'] }
}
```
这里 mock 就是 Umi 内置插件 mock 的 key。

再比如我们安装一个插件 `umi-plugin-bar`, 其 key 默认是 `bar`, 就可以配置：
```js
export default{
  bar: { ... }
}
```

### 插件 key 的默认命名规则
如果插件是一个包的话，key 的默认值将是去除前缀的包名。比如 `@umijs/plugin-foo` 的 key 默认为 `foo`， `@alipay/umi-plugin-bar` 的 key 默认为 `bar`。值得注意的是，该默认规则要求你的包名符合 Umi 插件的命名规范。

如果插件不是一个包的话，key 的默认值将是插件的文件名。比如 `./plugins/foo.js` 的 key 默认为 `foo` 。

为了避免不必要的麻烦，我们建议你为自己编写的插件显式地声明其 key。

## Umi 插件的机制及其生命周期

![Umi 插件机制](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*GKNdTZgPQCIAAAAAAAAAAAAAARQnAQ)

### 生命周期

- init stage: 该阶段 Umi 将加载各类配置信息。包括：加载 `.env` 文件； require `package.json`  ；加载用户的配置信息； resolve 所有的插件（内置插件、环境变量、用户配置依次进行）。
- initPresets stage:  该阶段 Umi 将注册 presets。presets 在注册的时候可以通过 `return { presets, plugins }` 来添加额外的插件。其中 presets 将添加到 presets 队列的队首，而 plugins 将被添加到 plugins 队列的队尾。
- initPlugins stage: 该阶段 Umi 将注册 plugins。这里的 plugins 包括上个阶段由 presets 添加的额外的 plugins， 一个值得注意的点在于： 尽管 plugins 也可以 `return { presets, plugins }` ，但是 Umi 不会对其进行任何操作。插件的 init 其实就是执行插件的代码（但是插件的代码本质其实只是调用 api 进行各种 hook 的注册，而 hook 的执行并非在此阶段执行，因此这里叫插件的注册）。
- resolveConfig stage: 该阶段 Umi 将整理各个插件中对于 `config schema` 的定义，然后执行插件的 `modifyConfig` 、`modifyDefaultConfig`、 `modifyPaths` 等 hook，进行配置的收集。
- collectionAppData stage: 该阶段 Umi 执行 `modifyAppData` hook，来维护 App 的元数据。（ `AppData` 是 `umi@4` 新增的 api ）
- onCheck stage: 该阶段 Umi 执行 `onCheck` hook。
- onStart stage: 该阶段 Umi 执行 `onStart` hook。
- runCommand stage:  该阶段 Umi 运行当前 cli 要执行的 command，（例如 `umi dev`, 这里就会执行 dev command）Umi 的各种核心功能都在 command 中实现。包括我们的插件调用 api 注册的绝大多数 hook。

以上就是 Umi 的插件机制的整体流程。

### `register()` 、 `registerMethod()` 以及 `applyPlugins()`

`register()` 接收一个 key 和 一个 hook，它维护了一个 `key-hook[]` 的 map，每当调用 `register()` 的时候，就会为 key 额外注册一个 hook。

`register()` 注册的 hooks 供 applyPlugins 使用。 这些 hook 的执行顺序参照 [tapable](https://github.com/webpack/tapable)。

`registerMethod()` 接收一个 key 和 一个 fn，它会在 api 上注册一个方法。如果你没有向 `registerMethod()` 中传入 fn，那么 `registerMethod()` 会在 api 上注册一个“注册器”： 它会将 `register()` 传入 key 并柯里化后的结果作为 fn 注册到 api 上。这样就可以通过调用这个“注册器”，快捷地为 key 注册 hook 了。

关于上述 api 的更具体的使用，请参照[插件 API](../api/plugin-api)。

### PluginAPI 的原理
Umi 会为每个插件赋予一个 PluginAPI 对象，这个对象引用了插件本身和 Umi 的 service。

Umi 为 PluginAPI 对象的 `get()` 方法进行了 proxy，具体规则如下：
- pluginMethod:  如果 prop 是 Umi 所维护的 `pluginMethods[]` ( `通过 registerMethod()` 注册的方法 ）中的方法，则返回这个方法。
- service props: 如果 prop 是 serviceProps 数组中的属性（这些属性是 Umi 允许插件直接访问的属性），则返回 service 对应的属性。
- static props: 如果 prop 是参数 staticProps 数组中的属性（这些属性是静态变量，诸如一些类型定义和常量），则将其返回。
- 否则返回 api 的属性。

因此，Umi 提供给插件的 api 绝大多数都是依靠 `registerMethod()` 来实现的，你可以直接使用我们的这些 api 快速地在插件中注册 hook。这也是 Umi 将框架和功能进行解耦的体现： Umi 的 service 只提供插件的管理功能，而 api 都依靠插件来提供。

### preset-umi
`umi-core` 提供了一套插件的注册及管理机制。而 Umi 的核心功能都靠 [preset-umi](https://github.com/umijs/umi/tree/master/packages/preset-umi) 来实现。

`preset-umi` 其实就是内置的一个插件集，它提供的插件分为三大类：
- registerMethods 这类插件注册了一些上述提到的“注册器”，以供开发者快速地注册 hook，这类方法也占据了 PluginAPI 中的大多数。
- features 这类插件为 Umi 提供了一些特性，例如 appData、lowImport、mock 等。
- commands 这类插件注册了各类 command， 提供了 Umi CLI 的各种功能。Umi 能够在终端中正常运行，依靠的就是 command 提供的功能。
