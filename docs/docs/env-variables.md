# Environment Variables

## Setting Environment Variables

### Adding When Executing Commands

For example,

```bash
# OS X, Linux
$ PORT=3000 umi dev

# Windows (cmd.exe)
$ set PORT=3000&&umi dev
```

To consider both OS X and Windows, you can use a third-party tool called [cross-env](https://github.com/kentcdodds/cross-env):

```bash
$ yarn add cross-env --dev
$ cross-env PORT=3000 umi dev
```

### Defining in .env Files

In Umi, the `.env` file in the root directory is used as the environment variable configuration file.

For example:

```bash
PORT=3000
BABEL_CACHE=none
```

Then execute:

```bash
$ umi dev
```

This will start the dev server on port 3000 and disable Babel's cache.

## List of Environment Variables

Listed alphabetically.

### APP_ROOT

Specifies the project's root directory.

Note:

- APP_ROOT cannot be configured in `.env` and can only be added in the command line.

### ANALYZE

Used for analyzing bundle composition, disabled by default.

For example:

```bash
$ ANALYZE=1 umi dev
# or
$ ANALYZE=1 umi build
```

### ANALYZE_SSR

Analyzes the size of server-side bundles, disabled by default. See [Server-Side Rendering #Bundle Size Analysis](/docs/ssr#package-size-analysis) for details.

### BABEL_CACHE

Babel compilation cache is enabled by default. Set to `none` to disable the cache.

### BABEL_POLYFILL

By default, it patches target browsers with full polyfills based on the targets configuration. Set to `none` to disable built-in patching.

### COMPRESS

CSS and JS are compressed by default. Set to `none` to disable compression, effective during the build.

### FORK_TS_CHECKER

TypeScript type checking is disabled by default. Set to `1` to enable it.

For example:

```bash
$ FORK_TS_CHECKER=1 umi dev
```

### FRIENDLY_ERROR

Disable it by setting to `none`. In some cases, [friendly-errors-webpack-plugin](https://github.com/geowarin/friendly-errors-webpack-plugin) might swallow errors.

```bash
$ FRIENDLY_ERROR=none umi dev
```

### HTTPS

Enables [https](https://en.wikipedia.org/wiki/HTTPS) for localhost.

```bash
$ HTTPS=1 umi dev
```

You can also use the `https: { key: '/path/key.pem', cert: '/path/cert.pem' }` configuration to customize certificates.

### HMR

Disable code hot module replacement by setting to `none`.

### HTML

Set to `none` to skip HTML output, effective during `umi build`.

### HOST

Defaults to `0.0.0.0`.

### PORT

Specifies the port number, default is `8000`.

### PROGRESS

Disable progress bar by setting to `none`. For example:

```bash
$ PROGRESS=none umi dev
```

### SOCKET_SERVER

Specify the socket server for HMR. For example:

```bash
$ SOCKET_SERVER=https://localhost:7001/ umi dev
```

### SPEED_MEASURE

Analyze Webpack compilation time, supports two formats: `CONSOLE` and `JSON`, default is `JSON`.

```bash
$ SPEED_MEASURE=CONSOLE umi dev
```

### TERSER_CACHE

Terser compression cache is enabled by default. Set to `none` to disable the cache.

### UMI_ENV

Specifies configuration files for different environments. See [Configuration #Multiple Configurations for Multiple Environments](./config#multiple-configurations-for-multiple-environments) for details.

### WATCH

Disable file watching by setting to `none`. For example:

```bash
$ WATCH=none umi dev
```

### WATCH_IGNORED

By default, it does not watch file changes in the `node_modules` directory. If needed, you can configure this environment variable. For example:

```bash
# Watch the entire node_modules directory, slower
WATCH_IGNORED=none umi dev

# Watch everything in node_modules except lodash and umi, ignore others
WATCH_IGNORED=node_modules/(?!(lodash|umi)) umi dev
```

### WEBPACK_FS_CACHE

Disable fs cache of webpack 5.

```bash
$ WEBPACK_FS_CACHE=none umi dev
```

### WEBPACK_PROFILE

Generate Umi build performance analysis file `dist/stats.json`, combined with [Webpack Xray](https://akx.github.io/webpack-xray) or [Webpack Analyse](http://webpack.github.io/analyse). `WEBPACK_PROFILE` values include `verbose`, `normal`, and `minimal`.

For example:

```bash
$ WEBPACK_PROFILE=verbose umi build
```

### RM_SERVER_FILE

Under prerendering, it usually deletes the server-side rendering file `umi.server.js`. If you want to keep it, use `RM_SERVER_FILE=none`.
