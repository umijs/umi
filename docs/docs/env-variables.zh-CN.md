# 环境变量

## 设置环境变量

### 执行命令时添加

比如，

```bash
# OS X, Linux
$ PORT=3000 umi dev

# Windows (cmd.exe)
$ set PORT=3000&&umi dev
```

如果要同时考虑 OS X 和 Windows，可借助三方工具 [cross-env](https://github.com/kentcdodds/cross-env)，

```bash
$ yarn add cross-env --dev
$ cross-env PORT=3000 umi dev
```

### 在 .env 文件中定义

Umi 中约定根目录下的 `.env` 为环境变量配置文件。

比如：

```bash
PORT=3000
BABEL_CACHE=none
```

然后执行，

```bash
$ umi dev
```

会以 3000 端口启动 dev server，并且禁用 babel 的缓存。

## 环境变量列表

按字母排序。

### APP_ROOT

指定项目根目录。

注意：

- APP_ROOT 不能配在 `.env` 中，只能在命令行里添加

### ANALYZE

用于分析 bundle 构成，默认关闭。

比如：

```bash
$ ANALYZE=1 umi dev
# 或者
$ ANALYZE=1 umi build
```

### ANALYZE_SSR

对服务端包大小的分析，默认关闭，具体见 [服务端渲染#包大小分析](/zh-CN/docs/ssr#包大小分析)。

### BABEL_CACHE

默认开启 Babel 编译缓存，值为 none 时禁用缓存。

### BABEL_POLYFILL

默认会根据 targets 配置打目标浏览器的全量补丁，设置为 `none` 禁用内置的补丁方案。

### COMPRESS

默认压缩 CSS 和 JS，值为 none 时不压缩，build 时有效。

### FORK_TS_CHECKER

默认不开启 TypeScript 类型检查，值为 `1` 时启用。比如：

```bash
$ FORK_TS_CHECKER=1 umi dev
```

### FRIENDLY_ERROR

设为 none 时禁用，有些场景下 [friendly-errors-webpack-plugin](https://github.com/geowarin/friendly-errors-webpack-plugin) 会把错误给吞了。

```bash
$ FRIENDLY_ERROR=none umi dev
```

### HTTPS

localhost 开启 [https](https://baike.baidu.com/item/https/285356)

```bash
$ HTTPS=1 umi dev
```

同时也可以使用配置 `https: { key: '/path/key.pem', cert: '/path/cert.pem' }` 自定义证书。

### HMR

设为 `none` 时禁用代码热更新功能。

### HTML

设为 `none` 时不输出 HTML，`umi build` 时有效。

### HOST

默认是 `0.0.0.0`。

### PORT

指定端口号，默认是 `8000`。

### PROGRESS

设为 `none` 时禁用进度条。比如：

```bash
$ PROGRESS=none umi dev
```

### SOCKET_SERVER

指定用于 HMR 的 socket 服务器。比如：

```bash
$ SOCKET_SERVER=https://localhost:7001/ umi dev
```

### SPEED_MEASURE

分析 Webpack 编译时间，支持 `CONSOLE` 和 `JSON` 两种格式，默认是 `JSON`。

```bash
$ SPEED_MEASURE=CONSOLE umi dev
```

### TERSER_CACHE

默认开启 Terser 压缩缓存，值为 none 时禁用缓存。

### UMI_ENV

指定不同环境各自的配置文件，详见[配置#多环境多份配置](./config#多环境多份配置)。

### WATCH

设为 `none` 时不监听文件变更。比如：

```bash
$ WATCH=none umi dev
```

### WATCH_IGNORED

默认不监听 node_modules 下的文件修改，如果需要，可通过此环境变量进行设置。比如：

```bash
# 整个 node_modules 都监听，会慢点
WATCH_IGNORED=none umi dev

# node_modules 下除 lodash 和 umi 监听，其他忽略
WATCH_IGNORED=node_modules/(?!(lodash|umi)) umi dev
```

### WEBPACK_FS_CACHE

禁用 webpack 5 的物理缓存。

```bash
$ WEBPACK_FS_CACHE=none umi dev
```

### WEBPACK_PROFILE

生成 umi 构建性能分析文件 `dist/stats.json`，结合 [Webpack Xray](https://akx.github.io/webpack-xray) 或 [Webapck Analyse](http://webpack.github.io/analyse) ，`WEBPACK_PROFILE` 值有 `verbose`、`normal`、`minimal`。比如：

```bash
$ WEBPACK_PROFILE=verbose umi build
```

### RM_SERVER_FILE

预渲染下，默认会删除服务端渲染文件 `umi.server.js`，如果希望保留，使用 `RM_SERVER_FILE=none`。
