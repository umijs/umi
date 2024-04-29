---
order: 10
toc: content
---
# 环境变量

Umi 可以通过环境变量来完成一些特殊的配置和功能。

## 如何设置环境变量

### 执行命令时设置

例如需要改变 `umi dev` 开发服务器的端口，可以通过如下命令实现。

```bash
# OS X, Linux
$ PORT=3000 umi dev

# Windows (cmd.exe)
$ set PORT=3000&&umi dev
```

如果需要同时在不同的操作系统中使用环境变量，推荐使用工具 [cross-env](https://github.com/kentcdodds/cross-env)。

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

`umi` 会以 3000 端口启动 dev server，并且禁用 babel 的缓存。

如果你有部分环境变量的配置在本地要做特殊配置，可以配置在 `.env.local` 文件中去覆盖 `.env` 的配置。比如在之前的 `.env` 的基础上, 你想本地开发覆盖之前 3000 端口, 而使用 4000 端口，可以做如下定义。

```text
# file .env.local
PORT=4000
```

`umi` 会以 4000 端口启动 dev server，同时保持禁用 babel 的缓存。

此外 `umi` `.env` 文件中还支持变量的方式来配置环境变量。例如：

```
# file .env.local
FOO=foo
BAR=bar

CONCAT=$FOO$BAR # CONCAT=foobar
```

Umi 不支持 `.env.development` / `.env.production` 的环境变量配置文件，如需在不同的环境下有不同的变量值，请使用 `cross-env` 在不同的启动命令上区分，或定义在各个 `UMI_ENV` 对应的 Umi 配置文件内。

注意：

* 不建议将 `.env.local` 加入版本管理中。

### 在浏览器中使用环境变量

所有通过 `.env` 环境变量文件 或 命令行注入 的环境变量均默认只在 Umi 配置文件 (Node.js 环境) 内生效，在浏览器中无法直接通过 `process.env.VAR_NAME` 方式使用，通过进一步配置 [`define`](../api/config.md#define) 来注入到浏览器环境中：

```bash
# .env
MY_TOKEN="xxxxx"
```

<br />

```ts
// .umirc.ts

  define: { 'process.env.MY_TOKEN': process.env.MY_TOKEN }
```

注：我们约定所有以 `UMI_APP_` 开头的环境变量会默认注入到浏览器中，无需配置 `define` 手动注入。

## 环境变量列表

按字母顺序排列。

### APP_ROOT

指定项目根目录。

注意：

* `APP_ROOT` 不能配在 `.env` 中，只能在命令行里添加


### ANALYZE

用于分析 bundle 构成，默认关闭。

比如：

```bash
$ ANALYZE=1 umi dev
# 或者
$ ANALYZE=1 umi build
```

可以通过 `ANALYZE_PORT` 环境变量自定义端口或 [`analyze`](../api/config#analyze) 选项自定义配置。

### BABEL_POLYFILL

默认会根据 targets 配置打目标浏览器的全量补丁，设置为 `none` 禁用内置的补丁方案。

### COMPRESS

默认压缩 CSS 和 JS，值为 `none` 时不压缩，`build` 时有效。

### DID_YOU_KNOW

设置为 `none` 会禁用「你知道吗」提示。

### ERROR_OVERLAY

设置为 `none` 会禁用「Error Overlay」，在调试 Error Boundary 时会有用。

### FS_LOGGER

默认会开启保存物理日志，值为 `none` 时不保存，同时针对 webcontainer 场景（比如 stackbliz）暂不保存。

### HMR

默认开启 HMR 功能，值为 `none` 时关闭。

### HOST

默认是 `0.0.0.0`。

### PORT

指定端口号，默认是 `8000`。

### SOCKET_SERVER

指定用于 HMR 的 socket 服务器。比如：

```bash
$ SOCKET_SERVER=http://localhost:8000/ umi dev
```

### SPEED_MEASURE

分析 Webpack 编译时间，支持 `CONSOLE` 和 `JSON` 两种格式，默认是 `CONSOLE`。

```bash
$ SPEED_MEASURE=JSON umi dev
```

### UMI_ENV

当指定 `UMI_ENV` 时，会额外加载指定值的配置文件，优先级为：

 - `config.ts`

 - `config.${UMI_ENV}.ts`

 - `config.${dev | prod | test}.ts`

 - `config.${dev | prod | test}.${UMI_ENV}.ts`

 - `config.local.ts`

若不指定 `UMI_ENV` ，则只会加载当前环境对应的配置文件，越向下的越具体，优先级更高，高优的配置可以往下移动。

注：根据当前环境的不同，`dev`, `prod`, `test` 配置文件会自动加载，不能将 `UMI_ENV` 的值设定成他们。

### UMI_PLUGINS

指定 `umi` 命令执行时额外加载的插件的路径，使用 `,` 隔开。

```bash
$ UMI_PLUGINS=./path/to/plugin1,./path/to/plugin2  umi dev
```

### UMI_PRESETS

指定 `umi` 命令执行时额外加载插件集的路径，使用 `,` 隔开。

```bash
$ UMI_PRESETS=./path/to/preset1,./path/to/preset2  umi dev
```

### UMI_DEV_SERVER_COMPRESS

默认 Umi 开发服务器自带 [compress](https://github.com/expressjs/compression) 压缩中间件，这会使开发时 SSE 数据的传输 [无法流式获取](https://github.com/umijs/umi/issues/12144) ，通过指定 `UMI_DEV_SERVER_COMPRESS=none` 来关闭 compress 压缩功能：

```bash
  UMI_DEV_SERVER_COMPRESS=none umi dev
```

### WEBPACK_FS_CACHE_DEBUG

开启 webpack 的物理缓存 debug 日志。

```bash
$ WEBPACK_FS_CACHE_DEBUG=1 umi dev
```
