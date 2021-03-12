# 命令行工具

## umi build

编译构建 web 产物。通常需要针对部署环境，做特定的配置和环境变量修改。相关详情，请查阅[部署](./deployment)。

```bash
$ umi build

✔ Webpack
  Compiled successfully in 5.54s

  DONE  Compiled successfully in 5547ms

Build success.
✨  Done in 9.77s.
```

默认产物输出到项目的 `dist` 文件夹，你可以通过修改配置 `outputPath` 指定产物输出目录。默认编译时会将 `public` 文件夹内的所有文件，原样拷贝到 `dist` 目录，如果你不需要这个特性，可以通过配置 `chainWebpack` 来删除它。

```js
export default {
  chainWebpack(memo, { env, webpack }) {
    // 删除 umi 内置插件
    memo.plugins.delete('copy');
  },
};
```

> 注意：如果 `public` 里面存在产物同名文件，如 `index.html`，将会导致产物文件被覆盖。

## umi dev

启动本地开发服务器进行项目的开发调试

```bash
$ umi dev
```

启动在浏览器中运行的开发服务器，并监视源文件变化，自动热加载。

默认使用 `8000` 端口，如果 `8000` 端口被占用，将会使用 `8001` 端口，以此类推。你可以通过设置环境变量 `PORT` 来指定开发端口号。更多环境变量配置，请查阅[环境变量](/docs/env-variables)。

```bash
umi dev
Starting the development server...

✔ Webpack
  Compiled successfully in 2.27s

  DONE  Compiled successfully in 2276ms

  App running at:
  - Local:   http://localhost:8000 (copied to clipboard)
  - Network: http://192.168.50.236:8000
```

开启开发服务还会同时提供一个 Network 的链接，你可以在能访问到你当前运行设备的其他设备中预览页面。

> 注意：如果是在开启了 VPN，或者虚拟机等复杂的网络环境中，这个地址很可能会错误。你可以通过访问你真实可用 `ip` 的对应端口号来访问开发页面。

## umi generate

内置的生成器功能，内置的类型有 `page` ，用于生成最简页面。支持别名调用 `umi g`。

```bash
$ umi generate <type> <name> [options]
```

这个命令支持扩展，通过 `api.registerGenerator` 注册，你可以通过插件来实现自己常用的生成器。

```ts
import { Generator, IApi } from 'umi';

const createPagesGenerator = function ({ api }: { api: IApi }) {
  return class PageGenerator extends Generator {
    constructor(opts: any) {
      super(opts);
    }
    async writing() {}
  };
};

api.registerGenerator({
  key: 'pages',
  Generator: createPageGenerator({ api }),
});
```

```bash
umi generate page pageName
umi generate page pageName --typescript
umi generate page pageName --less
```

更多使用类型和参数，请查阅提供生成器扩展的插件的文档。

## umi plugin

快速查看当前项目使用到的所有的 `umi` 插件。

```bash
$ umi plugin <type> [options]
```

当前支持的 `type` 是 `list`，可选参数 `key`。

```bash
$ umi plugin list

Plugins:

  - @umijs/preset-built-in (preset)
  - ./node_modules/umi/lib/plugins/umiAlias

✨  Done in 2.27s.
```

```bash
$ umi plugin list --key

Plugins:

  - @umijs/preset-built-in [key: builtIn]  (preset)
  - ./node_modules/umi/lib/plugins/umiAlias  [key: builtIn]

✨  Done in 2.27s.
```

## umi help

umi 命令行的简易帮助文档。

```bash
$ umi help <command>
```

## umi version

查看当前使用的 umi 的版本号，可以使用别名 `-v` 调用。

```bash
$ umi version
$ umi -v
```

## umi webpack

查看 umi 使用的 webpack 配置。

```bash
$ umi webpack [options]
```

参数，

| 可选参数      |                      说明                      |
| :------------ | :--------------------------------------------: |
| rules         |       查看 webpack.module.rules 配置详情       |
| rule=[name]   | 查看 webpack.module.rules 中某个规则的配置详情 |
| plugins       |         查看 webpack.plugins 配置详情          |
| plugin=[name] |   查看 webpack.plugins 中某个插件的配置详情    |

示例，

```bash
$ umi webpack

{
  mode: 'development',
  devtool: 'cheap-module-source-map',
  node:{ },
  output:{ },
  resolve:{ },
  module:{
    rules:[ ]
  },
  plugins:[ ],
  entry:{ }
}

$ umi webpack --rules

[
  'js',
  'ts-in-node_modules',
  'js-in-node_modules',
  'images',
  'svg',
  'fonts',
  'plaintext',
  'css',
  'less'
]

$ umi webpack --rule=js

{
  test: /\.(js|mjs|jsx|ts|tsx)$/,
  include: [ 'xx/umi' ],
  exclude: [ /node_modules/ ],
  use:[
    {
      loader:'xx/babel-loader/lib/index.js',
      options: {
        sourceType: 'unambiguous'
      }
    }
  ]
}

$ umi webpack --plugins

[
  'extract-css',
  'define',
  'progress',
  'copy',
  'friendly-error',
  'hmr'
]

$ umi webpack --plugin=extract-css

MiniCssExtractPlugin {
  options:{
    filename: '[name].css',
    moduleFilename: [Function: moduleFilename],
    ignoreOrder: true,
    chunkFilename: '[name].chunk.css'
  }
}
```

默认会打印 development 的配置，如需查看 production 配置，需要指定环境变量：

```bash
$ NODE_ENV=production umi webpack

{
  mode: 'production'
}
```
