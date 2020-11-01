---
translateHelp: true
---

# Env Variables


## Set environment variables

### Add when executing the command

such as,

```bash
# OS X, Linux
$ PORT=3000 umi dev

# Windows (cmd.exe)
$ set PORT=3000&&umi dev
```

If you want to consider both OS X and Windows, you can use the third-party tool [cross-env](https://github.com/kentcdodds/cross-env),

```bash
$ yarn add cross-env --dev
$ cross-env PORT=3000 umi dev
```

### Defined in the .env file

It is agreed in Umi that `.env` in the root directory is an environment variable configuration file.

such as:

```bash
PORT=3000
BABEL_CACHE=none
```

Then execute，

```bash
$ umi dev
```

The dev server will be started on port 3000 and babel's cache will be disabled.

## Environment variable list

Sort alphabetically.

### APP\_ROOT

Specify the project root directory.

note:

* APP\_ROOT cannot be configured in `.env`, it can only be added in the command line

### ANALYZE

It is used to analyze the bundle composition and is closed by default.

such as:
```bash
$ ANALYZE=1 umi dev
# or
$ ANALYZE=1 umi build
```

### ANALYZE_SSR

The analysis of the server-side packet size is disabled by default. For details, see [Server-side rendering#Package size analysis](/zh-CN/docs/ssr#Package size analysis).

### BABEL_CACHE

Babel compilation cache is enabled by default, and the cache is disabled when the value is none.

### BABEL\_POLYFILL

By default, the full patch of the target browser will be applied according to the targets configuration. Set to `none` to disable the built-in patch scheme.

### COMPRESS

CSS and JS are compressed by default. When the value is none, it will not be compressed, and it will be effective when building.

### FORK_TS_CHECKER

TypeScript type checking is disabled by default, and it is enabled when the value is `1`. such as:

```bash
$ FORK_TS_CHECKER=1 umi dev
```

### FRIENDLY_ERROR

It is disabled when set to none. In some scenarios, [friendly-errors-webpack-plugin](https://github.com/geowarin/friendly-errors-webpack-plugin) will swallow errors.

```bash
$ FRIENDLY_ERROR=none umi dev
```

### HTTPS

localhost 开启 [https](https://baike.baidu.com/item/https/285356)

```bash
$ HTTPS=1 umi dev
```

You can also use the configuration `https: {key:'/path/key.pem', cert:'/path/cert.pem' }` to customize the certificate.

### HMR

When set to `none`, the hot code update function is disabled.

### HTML

When set to `none`, HTML will not be output, and it will be effective when ʻumi build`.

### HOST

The default is `0.0.0.0`.

### PORT

Specify the port number, the default is `8000`.

### PROGRESS

When set to `none`, the progress bar is disabled. such as:

```bash
$ PROGRESS=none umi dev
```

### SOCKET_SERVER

指定用于 HMR 的 socket 服务器。比如：

```bash
$ SOCKET_SERVER=https://localhost:7001/ umi dev
```

### SPEED_MEASURE

Analyze Webpack compile time, support two formats `CONSOLE` and `JSON`, the default is `JSON`.

```bash
$ SPEED_MEASURE=CONSOLE umi dev
```

### TERSER_CACHE

Terser compression caching is enabled by default, and caching is disabled when the value is none.

### UMI_ENV

Specify the respective configuration files of different environments, see [Configuration#多环境多份configuration](./config#多环境多份configuration).

### WATCH

When set to `none`, file changes are not monitored. such as:

```bash
$ WATCH=none umi dev
```

### WATCH_IGNORED

By default, the file modification under node_modules is not monitored. If necessary, it can be set through this environment variable. such as:

```bash
# The entire node_modules are monitored, it will be slower
WATCH_IGNORED=none umi dev

# node_modules Except lodash and umi monitoring, others ignore
WATCH_IGNORED=node_modules/(?!(lodash|umi)) umi dev
```

## WEBPACK_PROFILE

Generate umi build performance analysis file `dist/stats.json`, combined with [Webpack Xray](https://akx.github.io/webpack-xray) or [Webapck Analyse](http://webpack.github.io/ analyse), the values ​​of `WEBPACK_PROFILE` include `verbose`, `normal`, and `minimal`. such as:
```bash
$ WEBPACK_PROFILE=verbose umi build
```

### RM_SERVER_FILE

Under pre-rendering, the server rendering file ʻumi.server.js` will be deleted by default by default. If you want to keep it, use `RM_SERVER_FILE=none`.
