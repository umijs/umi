---
sidebarDepth: 3
---

# .env 和环境变量

## 如何配置

比如要

```
# OS X, Linux
$ PORT=3000 umi dev

# Windows (cmd.exe)
$ set PORT=3000&&umi dev

# Or use cross-env for all platforms
$ yarn add cross-env --dev
$ cross-env PORT=3000 umi dev

# .env
$ echo PORT=3000 > .env
```

## 环境变量

### UMI_ENV

指定覆盖默认配置的配置文件。比如 `UMI_ENV=prod umi build`，那么则会用 `.umirc.prod.js` 覆盖 `.umirc.js`。或者是 `config/config.prod.js` 覆盖 `config/config.js`。注意是覆盖而不是替换，`.umirc.prod.js` 中没有的配置者会使用 `.umirc.js` 中的配置。

另外，开发模式下 `.umirc.local.js` 或者 `config/config.local.js` 中的配置永远是优先级最高的。

### PORT

指定端口号，默认是 `8000`。比如：

```bash
$ PORT=8001 umi dev
```

### HOST

默认是 `0.0.0.0`。

### ESLINT <Badge text="2.4.0+"/>

有值时在 dev 和 build 命令里会通过 [eslint-config-umi](https://github.com/umijs/umi/tree/master/packages/eslint-config-umi) 做基础的 eslint 校验，避免一些低级错误。

### APP_ROOT

::: warning
APP_ROOT 不能配在 .env 里。
:::

指定项目根目录。比如：

```bash
$ APP_ROOT=src/renderer umi dev
```

### ANALYZE

默认关闭。分析 bundle 构成，build 时有效。比如：

```bash
$ ANALYZE=1 umi build
```

### SPEED_MEASURE

默认关闭。分析各个 plugin 和 loader 的耗时。比如：

```bash
# 将分析信息在控制台输出
$ SPEED_MEASURE=CONSOLE umi build

# 将分析信息保存到 node_modules/speed-measure.json
$ SPEED_MEASURE=JSON umi build
```

### ANALYZE_PORT

ANALYZE 服务器端口，默认 8888。

### BABEL_POLYFILL <Badge text="2.2.0+"/>

默认引入 `@babel/polyfill`，值为 none 时不引入。比如：

```bash
$ BABEL_POLYFILL=none umi build
```

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

### CLEAR_CONSOLE

默认清屏，值为 none 时不清屏。

### HMR

默认开启 HMR，值为 none 时禁用，值为 reload 时文件有变化时刷新浏览器。

### BABELRC

开启 `.babelrc` 解析，默认不解析。

### BABEL_CACHE

默认开启 babel cache，值为 none 时禁用。比如：

```bash
$ BABEL_CACHE=none umi dev
```

### MOCK

默认开启 mock，值为 none 时禁用。比如：

```bash
$ MOCK=none umi dev
```

### HTML

默认打包 HTML 文件，值为 none 时不打包 HTML 文件。比如：

```bash
$ HTML=none umi build
```

### WATCH_FILES

### RM_TMPDIR

### FORK_TS_CHECKER
默认不开启TypeScript检查，值为1时启用。比如：

```bash
$ FORK_TS_CHECKER=1 umi dev
```
