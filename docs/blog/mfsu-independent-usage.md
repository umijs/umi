import { Message } from 'umi';

# Using MFSU Independently

`MFSU` can be used independently in non-UmiJS projects. This article will guide you through the process of integrating `MFSU` into your webpack project.

## Sample Projects

To demonstrate MFSU integration, here are a few example projects you can refer to:

Webpack Configuration Example: [examples/mfsu-independent](https://github.com/umijs/umi/tree/master/examples/mfsu-independent)

CRA v5 Configuration Example: [cra-v5-with-mfsu-example](https://github.com/umijs/cra-v5-with-mfsu-example)

## Installation

First, install the dependencies for `mfsu`:

```bash
pnpm add -D @umijs/mfsu
```

## Configuring MFSU

Configuring MFSU involves four simple steps. Make sure these steps are applied only in the development environment.

### 1. Initialize an Instance

In the first step, initialize an `MFSU` instance, which serves as the foundation for `MFSU`:

```js
// webpack.config.js

const { MFSU } = require('@umijs/mfsu')
const webpack = require('webpack')

// [mfsu] 1. init instance
const mfsu = new MFSU({
  implementor: webpack,
  buildDepWithESBuild: true,
});
```

### 2. Add Middleware

In the second step, add the `MFSU` `devServer` middleware to the webpack-dev-server. This middleware provides the required packaged resources for `MFSU`:

#### webpack 5

```js
// webpack.config.js

module.exports = {
  devServer: {
    // [mfsu] 2. add mfsu middleware
    setupMiddlewares(middlewares, devServer) {
      middlewares.unshift(
        ...mfsu.getMiddlewares()
      )
      return middlewares
    },
  }
}
```

#### webpack 4

```js
// webpack.config.js

module.exports = {
  devServer: {
    // [mfsu] 2. add mfsu middleware
    onBeforeSetupMiddleware(devServer) {
      for (const middleware of mfsu.getMiddlewares()) {
        devServer.app.use(middleware);
      }
    }
  }
}
```

### 3. Configure Transformers

The third step involves configuring a source code transformer. Its purpose is to collect and transform dependency import paths, replacing them with `MFSU`'s module federation addresses provided by the middleware.

Two options are provided here: `babel plugins` or `esbuild handler`. Generally, `babel plugins` is the preferred choice.

#### Babel Plugins

Simply add `MFSU`'s `babel plugins` to the `babel-loader`:

```js
// webpack.config.js

module.exports = {
  module: {
    rules: [
      // handle javascript source loader
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              // [mfsu] 3. add mfsu babel plugins
              ...mfsu.getBabelPlugins()
            ]
          }
        }
      }
    ]
  }
}
```

#### Esbuild handler

An alternative is using the built-in `esbuild-loader` to handle `js/ts` resources. Note that this is only for the development environment.

<Message type='success' emoji="🚀">
<strong>The benefit of this approach is</strong>: faster compilation and startup speed than `babel` in the development environment.
</Message>

```js
// webpack.config.js

const { esbuildLoader } = require('@umijs/mfsu')
const esbuild = require('esbuild')

module.exports = {
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: esbuildLoader,
          options: {
            handler: [
              // [mfsu] 3. add mfsu esbuild loader handlers
              ...mfsu.getEsbuildLoaderHandler()
            ],
            target: 'esnext',
            implementation: esbuild
          }
        }
      }
    ]
  }
}
```

<Message type='warning' emoji="💡">
<strong>When should I not use the esbuild approach?</strong><br />1. I have custom `babel plugins` that must be used in the development environment.<br />2. I need developer-friendly class names for `css-in-js` in the development environment (usually supported by babel plugins).<br />3. The cost of adapting to a set of `esbuild-loader` in the development environment is higher than configuring `babel plugins`.
</Message>

### 4. Set Webpack Configuration

In the fourth step, use the methods provided by `MFSU` to modify your webpack configuration. This involves incremental changes, so you don't need to worry about affecting your original configuration.

As shown in the following code, `mfsu.setWebpackConfig` is an asynchronous method. To use it, extract your original webpack configuration into a separate `config` object. Then, export the return value of calling this method.

```js
// webpack.config.js

const config = {
  // origin webpack config
}

const depConfig = {
  // webpack config for dependencies
}

// [mfsu] 4. inject mfsu webpack config
const getConfig = async () => {
  await mfsu.setWebpackConfig({
    config, depConfig
  });
  return config
}

module.exports = getConfig()
```

At this point, your `MFSU` configuration is complete. You can now start using it in your project.

## Usage

After completing the four configuration steps, start your project. You will find a `.mfsu` folder in the project's root directory. This folder contains the `MFSU` cache files. Make sure to add this folder to your Git ignore list (you shouldn't commit these cache files):

```bash
# .gitignore

.mfsu
```

If everything is set up correctly, you can now enjoy the benefits of `MFSU`, including faster packaging with `esbuild` and improved speed for hot restarts.

## Other Configurations

Here are additional configurations for the `MFSU` instance that you might find useful:

```js
  const mfsu = new MFSU({
    cwd: process.cwd()
  })
```

Other Options:

|option|default|description|
|:-|:-|:-|
|`cwd`|`process.cwd()`|Project root directory|
|`getCacheDependency`|`() => {}`|Function that returns a value used to invalidate MFSU cache|
|`tmpBase`|`${process.cwd()}/.mfsu`|Location to store MFSU cache|
|`unMatchLibs`|`[]`|Manually exclude specific dependencies from MFSU processing|
|`runtimePublicPath`|`undefined`|Same as umijs > [`runtimePublicPath`](../docs/api

/config#runtimepublicpath)|
|`implementor`|`undefined`|Webpack instance, must match the unique instance used in the project|
|`buildDepWithESBuild`|`false`|Whether to use `esbuild` to package dependencies|
|`onMFSUProgress`|`undefined`|Callback to get MFSU compilation progress|

## Frequently Asked Questions

#### How can I ensure that my MFSU configuration only applies in the development environment?

Use environment flags to avoid configuring all `MFSU` settings during production build:

```js
const isDev = process.env.NODE_ENV === 'development'

const mfsu = isDev
  ? new MFSU({
      implementor: webpack,
      buildDepWithESBuild: true,
    }) 
  : undefined

// e.g.
{
  test: /\.[jt]sx?$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      plugins: [
        ...(isDev ? [] : mfsu.getBabelPlugins())
      ]
    }
  }
}
```



