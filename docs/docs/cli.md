---
translateHelp: true
---

# Cli Commands


## umi build

Compile and build the web artifact. Usually need to do specific configuration and environment variable modification for the deployment environment. For more details, please refer to [Deployment](./deployment).

```bash
$ umi build

✔ Webpack
  Compiled successfully in 5.54s

  DONE  Compiled successfully in 5547ms

Build success.
✨  Done in 9.77s.
```

The default output is output to the `dist` folder of the project. You can specify the output directory of the output by modifying the configuration` outputPath`.
By default, all files in the `publish` folder are copied to the` dist` directory as they are. If you don't need this feature, you can delete it by configuring `chainWebpack`.

```js
export default {
  chainWebpack(memo, { env, webpack }) {
    // Remove umi built-in
    memo.plugins.delete('copy');
  }
}
```

> Note: If a product with the same name exists in `publish`, such as` index.html`, the product file will be overwritten.

## umi dev

Start local development server for project development and debugging

```bash
$ umi dev
```

Start the development server running in the browser, and monitor the source file for changes, automatically hot-loading.

The `8000` port is used by default. If the` 8000` port is occupied, the `8001` port will be used, and so on.
You can specify the development port number by setting the environment variable `PORT`. For more environment variable configuration, please refer to [Environment Variables](/docs/env-variables)。

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

Enabling the development service will also provide a Network link, and you can preview the page on other devices that have access to your currently running device.

> Note: If the VPN is enabled, or in a complicated network environment such as a virtual machine, this address may be wrong. You can access the development page by visiting the corresponding port number of your real available ip.

## umi generate

Built-in generator function, built-in types are `page`, which is used to generate the simplest page. Support alias calling `umi g`.

```bash
$ umi generate <type> <name> [options]
```

This command supports extensions. Registered via `api.registerGenerator`. You can implement your own generators through plugins.

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

For more usage types and parameters, consult the documentation for plugins that provide generator extensions.

## umi plugin

Quickly view all `umi` plugins used in the current project.

```bash
$ umi plugin <type> [options]
```

Currently supported `type` is` list`, optional parameter `key`.

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

Simple help documentation for umi command line.

```bash
$ umi help <command>
```

## umi version

To view the version number of the umi currently in use, you can call it with the alias `-v`.

```bash
$ umi version
$ umi -v
```

## umi webpack

Check out the webpack configuration used by umi.

```bash
$ umi webpack [options]
```

parameter,

| Optional parameter | Description |
|  :-  | :-:  |
| rules | View webpack.module.rules configuration details |
| rule=[name] |  View configuration details for a rule in webpack.module.rules |
| plugins |  View webpack.plugins configuration details |
| plugin=[name] |  View configuration details of a plugin in webpack.plugins |

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
