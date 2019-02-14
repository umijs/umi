---
sidebarDepth: 3
---

# .env and Environment Variables

## How to Configure

For example

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

## Environment Variables

### UMI_ENV

Specifies a profile that overrides the default configuration. For example, `UMI_ENV=prod umi build`, then `.umirc.js` will be overwritten with `.umirc.prod.js`. Or `config/config.prod.js` overrides `config/config.js`. Note that overriding instead of replacing, configurators not in `.umirc.prod.js` will use the configuration in `.umirc.js`.

In addition, the configuration in `.umirc.local.js` or `config/config.local.js` in development mode is always the highest priority.

### PORT

Specify the port number. The default is `8000`. such as:

```bash
$ PORT=8001 umi dev
```

### HOST

The default is `0.0.0.0`.

### ESLINT <Badge text="2.4.0+"/>

When ESLINT is set, the basic eslint check is done by [eslint-config-umi](https://github.com/umijs/umi/tree/master/packages/eslint-config-umi) in the dev and build commands. Avoid some simple mistakes.

### APP_ROOT

::: warning
APP_ROOT cannot be included in .env.
:::

Specify the project root directory. such as:

```bash
$ APP_ROOT=src/renderer umi dev
```

### ANALYZE

It is off by default. Analyze the bundle composition, valid when building. Such as:

```bash
$ ANALYZE=1 umi build
```

### SPEED_MEASURE

It is off by default. Analyze every webpack loader and plugin time consuming. Such as:

```bash
# Output speed measure info to terminal
$ SPEED_MEASURE=CONSOLE umi build

# Output speed measure info to node_modules/speed-measure.json
$ SPEED_MEASURE=JSON umi build
```

### ANALYZE_PORT

ANALYZE server port, default 8888.

### BABEL_POLYFILL <Badge text="2.2.0+"/>

`@babel/polyfill` is included by default, set the value to `none` if you don't want it.

e.g.

```bash
$ BABEL_POLYFILL=none umi build
```

### COMPRESS

The default compression CSS and JS, the value is none when it is none, and it is valid when building. such as:

```bash
$ COMPRESS=none umi build
```

### CSS_COMPRESS

The default compression, the value is none without compression, and is valid at build time. Because css compression is sometimes problematic, and compression does not reduce the size, sometimes you can suppress JS without pressing CSS.

### BROWSER

The browser is automatically opened by default. If the value is none, it will not be automatically opened. It is valid when dev. such as:

```bash
$ BROWSER=none umi dev
```

### CLEAR_CONSOLE

The default is cleared. If the value is none, the screen is not cleared.

### HMR

The HMR is enabled by default, the value is disabled when none, and the value is refreshed when the file changes when reload.

### BABELRC

Turn on `.babelrc` parsing, which is not resolved by default.

### BABEL_CACHE

The babel cache is enabled by default, and is disabled when the value is none. such as:

```bash
$ BABEL_CACHE=none umi dev
```

### MOCK

The mock is enabled by default, and is disabled when the value is none. such as:

```bash
$ MOCK=none umi dev
```

### HTML

The HTML file is packaged by default, and the HTML file is not packaged when the value is none. such as:

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
