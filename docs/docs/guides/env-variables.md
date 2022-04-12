# 环境变量

umi 可以通过环境变量来完成一些特殊的配置和功能。

## 如何设置环境变量

### 执行命令时设置

例如需要改变 `umi dev` 开发服务器的端口，进可以通过如下命令实现。

```bash
# OS X, Linux
$ PORT=3000 umi dev

# Windows (cmd.exe)
$ set PORT=3000&&umi dev
```

如果需要同时在不同的操作系统中使用环境变量，推荐使用工具 [cross-env](https://github.com/kentcdodds/cross-env)

```bash
$ pnpm install cross-env -D
$ cross-env PORT=3000 umi dev
```

### 设置在 .env 文件中

如果你的环境变量需要在开发者之间共享，推荐你设置在项目根目录的 `.env` 文件中，例如:

```text
# file .env
PORT=3000
BABEL_CACHE=none
```

然后执行，

```bash
$ umi dev
```

umi 会以 3000 端口启动 dev server，并且禁用 babel 的缓存。

如果你有部分环境变量的配置在本地要做特殊配置，可以配置在 `.env.local` 文件中去覆盖 `.env` 的配置。比如在之前的 `.env` 的基础上, 你想本地开发覆盖之前 3000 端口, 而使用 4000 端口，可以做如下定义。

```text
# file .env.local
PORT=4000
```

umi 会以 4000 端口启动 dev server，同时保持禁用 babel 的缓存。

注意：

* 不建议将 `.env.local` 加入版本管理中。

## 环境变量列表

按字母顺序排列。

### APP_ROOT

指定项目根目录。

注意：

* APP_ROOT 不能配在 .env 中，只能在命令行里添加


### ANALYZE

用于分析 bundle 构成，默认关闭。

比如：

```bash
$ ANALYZE=1 umi dev
# 或者
$ ANALYZE=1 umi build
```

### BABEL_POLYFILL

默认会根据 targets 配置打目标浏览器的全量补丁，设置为 `none` 禁用内置的补丁方案。

### COMPRESS

默认压缩 CSS 和 JS，值为 none 时不压缩，build 时有效。

### HOST

默认是 `0.0.0.0`。

### PORT

指定端口号，默认是 `8000`。

### SOCKET_SERVER

指定用于 HMR 的 socket 服务器。比如：

```bash
$ SOCKET_SERVER=https://localhost:7001/ umi dev
```

### SPEED_MEASURE

分析 Webpack 编译时间，支持 `CONSOLE` 和 `JSON` 两种格式，默认是 `CONSOLE`。

```bash
$ SPEED_MEASURE=JSON umi dev
```

### UMI_PLUGINS

指定 umi 命令执行时额外加载的插件的路径，使用 `,` 隔开。

```bash
$ UMI_PLUGINS=./path/to/plugin1,./path/to/plugin2  umi dev
```

### UMI_PRESETS

指定 umi 命令执行时额外加载插件集的路径，使用 `,` 隔开。

```bash
$ UMI_PRESETS=./path/to/preset1,./path/to/preset2  umi dev
```

### WEBPACK_FS_CACHE_DEBUG

开启 webpack 的物理缓存 debug 日志。

```bash
$ WEBPACK_FS_CACHE_DEBUG=1 umi dev
```
