---
translateHelp: true
---

# Cli Commands


## umi build

Compile and build web products. Usually need to make specific configuration and environment variable modification for the deployment environment. For details, please refer to [Deployment](./deployment).

```bash
$ umi build

✔ Webpack
  Compiled successfully in 5.54s

  DONE  Compiled successfully in 5547ms

Build success.
✨  Done in 9.77s.
```

The default product output is to the project's `dist` folder, you can modify the configuration ʻoutputPath` to specify the product output directory.

By default, all files in the `public` folder will be copied to the `dist` directory as they are during compilation. If you don't need this feature, you can delete it by configuring `chainWebpack`.

```js
export default {
  chainWebpack(memo, { env, webpack }) {
    // 删除 umi 内置插件
    memo.plugins.delete('copy');
  }
}
```

> Note: If there is a product file with the same name in `public`, such as ʻindex.html`, the product file will be overwritten.

## umi dev

Start the local development server for project development and debugging

```bash
$ umi dev
```

Start the development server running in the browser, monitor the source file changes, and automatically hot load.

By default, port `8000` is used. If port `8000` is occupied, port `8001` will be used, and so on.
You can specify the development port number by setting the environment variable `PORT`. For more environment variable configuration, please refer to [Environment Variables](/docs/env-variables).

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

Enabling the development service will also provide a Network link at the same time, and you can preview the page on other devices that can access your currently running device.

> Note: If you are in a complex network environment such as a VPN or virtual machine, this address is likely to be wrong. You can access the development page by accessing the corresponding port number of your truly available ʻip`.

## umi generate

The built-in generator function, the built-in type is `page`, which is used to generate the simplest page. Support alias calling ʻumi g`.

```bash
$ umi generate <type> <name> [options]
```

This command supports extensions, through the ʻapi.registerGenerator` registration, you can implement your own commonly used generators through plug-ins.

```ts
import { Generator, IApi } from 'umi';

const createPagesGenerator = function ({ api }: { api: IApi }) {
  return class PageGenerator extends Generator {
    constructor(opts: any) {
      super(opts);
    }
    async writing() {}
  };
}

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

For more usage types and parameters, please refer to the documentation of plugins that provide generator extensions.

## umi plugin

Quickly view all the ʻumi` plugins used in the current project.

```bash
$ umi plugin <type> [options]
```

Currently supported `type` is `list`, optional parameter `key`.

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

umi simple help document for command line.

```bash
$ umi help <command>
```

## umi version

To view the version number of the currently used umi, you can use the alias `-v` to call.

```bash
$ umi version
$ umi -v
```

## umi webpack

Check the webpack configuration used by umi.

```bash
$ umi webpack [options]
```

parameter,

| Optional parameters | Description |
| :- | :-: |
| rules | View webpack.module.rules configuration details |
| rule=[name] | View the configuration details of a rule in webpack.module.rules |
| plugins | View webpack.plugins configuration details |
| plugin=[name] | View the configuration details of a plugin in webpack.plugins |

Example,

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
      options: [Object]
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
