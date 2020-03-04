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

### APP\_ROOT

指定项目根目录。

注意：

* APP\_ROOT 不能配在 `.env` 中，只能在命令行里添加

### ANALYZE

用于分析 bundle 构成，默认关闭。

比如：

```bash
$ ANALYZE=1 umi dev
# 或者
$ ANALYZE=1 umi build
```

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

### UMI_ENV

指定不同环境各自的配置文件，详见[配置#多环境多份配置](TODO)。

