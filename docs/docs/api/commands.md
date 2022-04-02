# 命令行

为方便查找，以下命令通过字母排序。

## build

构建项目，适用于生产环境的部署。

```bash
$ umi build
```

## config

通过命令行快速查看和修改配置。

查看配置，可以用 `list` 或 `get`。

```bash
$ umi config list
 - [key: polyfill] false
 - [key: externals] { esbuild: true }
  
$ umi config get mfsu
 - [key: externals] { esbuild: true }
```

修改配置，可以用 `set` 或 `remove`。

```bash
$ umi config set polyfill false
set config:polyfill on /private/tmp/sorrycc-wsYpty/.umirc.ts

$ umi config remove polyfill
remove config:polyfill on /private/tmp/sorrycc-wsYpty/.umirc.ts
```

## dev

启动本地开发服务器，进行项目的开发与调试。

```bash
$ umi dev
ready - App listening at http://127.0.0.1:8000
event - compiled successfully in 1051 ms (416 modules)
```

## generate

用于增量生成文件或启用功能，命令行别名是 `g`。

不加任何参数时会给交互式的生成器选择。

```bash
$ umi g
# 或
$ umi generate
? Pick generator type › - Use arrow-keys. Return to submit.
❯   Create Pages -- Create a umi page by page name
    Enable Prettier -- Enable Prettier
```

也可以指定参数。

```bash
# 生成路由文件
$ umi g page index --typescript --less
```

## help

查看帮助。

```bash
$ umi help
Usage: umi <command> [options]

Commands:

    build     build app for production
    config    umi config cli
    dev       dev server for development
    help      show commands help
    setup     setup project
    version   show umi version
    plugin    inspect umi plugins
    generate  generate code snippets quickly

Run `umi help <command>` for more information of specific commands.
Visit https://umijs.org/ to learn more about Umi.
```

也可指定命令，查看特定命令的详细帮助。

```bash
$ umi help build
Usage: umi build [options]
build app for production.

Details:
    umi build

    # build without compression
    COMPRESS=none umi build

    # clean and build
    umi build --clean
```

## lint

用于检查及修正代码是否符合规则。

```bash
$ umi lint
Usage: umi lint 

 支持只校验 js、ts、tsx、jsx 类型文件： umi lint --eslint-only

 支持只校验 css、less 等样式文件： umi lint --stylelint-only

 支持校验 cssinjs 模式校验： umi lint --stylelint-only --cssinjs

 修正代码： --fix

```

## plugin

插件相关操作，目前只支持 `list` 子命令。

列出所有插件。

```bash
$ umi plugin list
- @umijs/core/dist/service/servicePlugin
- @umijs/preset-umi (from preset)
- @umijs/preset-umi/dist/registerMethods (from preset)
- @umijs/preset-umi/dist/features/appData/appData (from preset)
- @umijs/preset-umi/dist/features/check/check (from preset)
- @umijs/preset-umi/dist/features/configPlugins/configPlugins (from preset)
- virtual: config-styles
- virtual: config-scripts
- virtual: config-routes
- virtual: config-plugins
...
```

## setup

初始化项目，会做临时文件的生成等操作。通常在 package.json 的 `scripts.postinstall` 里设置。

```bash
{
  "scripts": { "postinstall": "umi setup" }
}
```

## verifyCommit

验证 commit message 信息，通常和 [husky](https://github.com/typicode/husky) 搭配使用。

比如在 `.husky/commit-msg` 做如下配置，

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install umi verify-ommit $1
```

## version

查看 umi 版本，等同于 `umi -v`。

```bash
$ umi version
4.0.0
```
