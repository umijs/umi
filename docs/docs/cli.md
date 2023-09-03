# CLI Commands

## umi build

Compiles and builds web assets. Typically, you need to make specific configurations and environment variable modifications for the deployment environment. For more details, please refer to the [deployment](./deployment) documentation.

```bash
$ umi build

✔ Webpack
  Compiled successfully in 5.54s

  DONE  Compiled successfully in 5547ms

Build success.
✨  Done in 9.77s.
```

By default, the build output goes to the `dist` folder in your project. You can specify the output directory by modifying the `outputPath` configuration.

During compilation, all files within the `public` folder are copied as-is to the `dist` directory. If you don't need this feature, you can remove it by configuring `chainWebpack`:

```js
export default {
  chainWebpack(memo, { env, webpack }) {
    // Remove the built-in copy plugin
    memo.plugins.delete('copy');
  }
}
```

> Note: If there are files with the same name in the `public` folder, like `index.html`, they will overwrite the output files.

## umi dev

Starts a local development server for debugging and developing your project.

```bash
$ umi dev
```

It launches a development server in your browser, watches for source file changes, and provides hot reloading.

By default, it uses port `8000`, and if port `8000` is occupied, it will use `8001`, and so on. You can specify the development port by setting the `PORT` environment variable. For more environment variable configurations, please refer to the [environment variables](/docs/env-variables) documentation.

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

Starting the development server also provides a Network link that allows you to preview the page on other devices that can access the current running device.

> Note: If you are in a complex network environment with VPN or virtual machines, this address may be incorrect. You can access the development page by using the corresponding port number of your real and available IP.

## umi generate

This command is an embedded generator with the built-in type `page` for generating simple pages. You can also use the alias `umi g`.

```bash
$ umi generate <type> <name> [options]
```

This command can be extended by registering generators with `api.registerGenerator`. You can create your own custom generators using plugins.

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

For more usage types and options, please refer to the documentation of plugins that provide generator extensions.

## umi plugin

Quickly view all `umi` plugins used in the current project.

```bash
$ umi plugin <type> [options]
```

The currently supported `type` is `list`, and it accepts an optional `key` parameter.

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

Provides a simple help documentation for `umi` commands.

```bash
$ umi help <command>
```

## umi version

View the current version of `umi`. You can also use the alias `-v`.

```bash
$ umi version
$ umi -v
```

## umi webpack

View the webpack configuration used by `umi`.

```bash
$ umi webpack [options]
```

Parameters:

| Optional Parameter | Description |
|  :-  | :-:  |
| rules | View details of webpack.module.rules configuration |
| rule=[name] | View the configuration details of a specific rule in webpack.module.rules |
| plugins | View details of webpack.plugins configuration |
| plugin=[name] | View the configuration details of a specific plugin in webpack.plugins |

Examples:

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

By default, it prints the development configuration. If you want to view the production configuration, you need to specify the `NODE_ENV` environment variable:

```bash
$ NODE_ENV=production umi webpack

{
  mode: 'production'
}
```
