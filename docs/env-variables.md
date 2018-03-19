---
id: env-variables
title: 环境变量
---

## 如何配置

e.g. start dev server with port 3000,

```
# OS X, Linux
$ PORT=3000 umi dev

# Windows (cmd.exe)
$ set PORT=3000&&umi dev

# Or use cross-env for all platforms
$ cross-env PORT=3000 umi dev
```

## 环境变量

### PORT

指定端口号，默认是 `8000`。比如：

```bash
$ PORT=8001 umi dev
```

### HOST

默认是 `0.0.0.0`。

### PUBLIC_PATH

配置静态资源文件所在的路径，即 webpack 的 publicPath，相比 .webpackrc 里的配置，这里的优先级最高。

默认值：

* dev 下是 `/`
* build 下是 `./dist/static`

### BASE_URL

配置 html 所在的根路径，用于给 react-router 的 basename，以及加载 service-worker.js 用。

### ANALYZE

默认关闭。分析 bundle 构成，build 时有效。比如：

```bash
$ ANALYZE=1 umi build
```

### ANALYZE_PORT

ANALYZE 服务器端口，默认 8888。

### COMPRESS

默认压缩 CSS 和 JS，值为 none 时不压缩，build 时有效。比如：

```bash
$ COMPRESS=none umi build
```

### CSS_COMPRESS

默认压缩，值为 none 时不压缩，build 时有效。因为 css 压缩有时是会有问题的，而且压缩并不能减少多少尺寸，所以有时可以压 JS 而不压 CSS。

### BROWSER

默认自动开浏览器，值为 none 时不自动打开，dev 时有效。比如：

```bash
$ BROWSER=none umi dev
```

### COMPILE_ON_DEMAND

默认开启按需编译，值为 none 时关闭。

### CLEAR_CONSOLE

默认清屏，值为 none 时不清。

### HMR

默认开启 HMR，值为 none 时禁用，值为 reload 时切换为页面刷新的方式。

### TSLINT

默认进行 tslint 校验，值为 none 时不校验。

### ESLINT

默认进行 eslint 校验，值为 none 时不校验。比如：

```bash
$ ESLINT=none umi dev
```

### BABELRC

开启 `.babelrc` 解析，默认不解析。
