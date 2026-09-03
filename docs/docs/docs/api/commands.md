---
order: 4
toc: content
---
# 命令行

umi 提供了很多内置的命令行用于启动，构建项目，另外还有一些辅助开发的命令，如生成器等。

要获取可用的命令列表，你可以在项目目录中运行 help 命令：

```bash
umi help
```

你应该能看到类似如下的日志：

```bash
Usage: umi <command> [options]

Commands:

    build     build app for production
    config    umi config cli
    dev       dev server for development
    help      show commands help
    lint      lint source code using eslint and stylelint
    setup     setup project
    deadcode  check dead code
    version   show umi version
    v         show umi version
    plugin    inspect umi plugins
    verify-commit verify the commit message, which is usually used with husky.
    preview   locally preview production build
    run       run the script commands, support for ts and zx
    generate  generate code snippets quickly
    g         generate code snippets quickly

Run `umi help <command>` for more information of specific commands.
Visit https://umijs.org/ to learn more about Umi.
```

> 为方便查找，以下命令通过字母排序。

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
        ╔═════════════════════════════════════════════════════╗
        ║ App listening at:                                   ║
        ║  >   Local: https://127.0.0.1:8001                  ║
ready - ║  > Network: https://192.168.1.1:8001                ║
        ║                                                     ║
        ║ Now you can open browser with the above addresses👆 ║
        ╚═════════════════════════════════════════════════════╝
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

## preview

`umi preview` 命令会在本地启动一个静态 Web 服务器，将 dist 文件夹运行在 http://127.0.0.1:4172, 用于预览构建后产物, 支持 proxy、mock 等设置。

你可以通过 `--port` 参数来配置服务的运行端口。

```bash
$ umi preview --port 9527
```

现在 `preview` 命令会将服务器运行在 http://127.0.0.1:9527.

通过 `--host` 参数来指定 配置服务运行的 hostname。

以下用户配置在 `preview` 时也会生效

* [https](./config#https)
* [proxy](../guides/proxy)
* [mock](../guides/mock)

注意 `dist` 目录会随着配置 `outputPath` 的变更而变更。

## run

`umi run` 命令可以让你像 node 运行 js 一样来运行 TypeScript 和 ESM 文件。你可以搭配 [zx](https://github.com/google/zx) 来更好的使用脚本命令。

```bash
$ umi run ./script.ts
```

## setup

初始化项目，会做临时文件的生成等操作。通常在 package.json 的 `scripts.postinstall` 里设置。

```bash
{
  "scripts": { "postinstall": "umi setup" }
}
```

## deadcode

用于查找 src 目录下未被引用的文件，并在根目录输出文件。

```bash
$ umi deadcode
- Preparing...
- begin check deadCode
- write file /examples/umi-run/DeadCodeList-{timeStamp}.txt
- check dead code end, please be careful if you want to remove them
```

## mfsu

`umi mfsu` 命令可以查看 MFSU 依赖信息、重新构建 MFSU 依赖和清除 MFSU 依赖。


```bash title="获取 MFSU 命令帮忙"
$ umi mfsu
```

```bash title="获取 MFSU 依赖列表"
$ umi mfsu ls
warning@4.0.3
regenerator-runtime/runtime.js@0.13.11
react/jsx-dev-runtime@18.1.0
react-intl@3.12.1
react-error-overlay/lib/index.js@6.0.9
react@18.1.0
qiankun@2.8.4
lodash/noop@4.17.21
lodash/mergeWith@4.17.21
lodash/concat@4.17.21
...
```

```bash title="重新构建 MFSU 依赖"
$ umi mfsu build
info  - Preparing...
info  - MFSU eager strategy enabled
warn  - Invalidate webpack cache since mfsu cache is missing
info  - [MFSU] buildDeps since cacheDependency has changed
...
info  - [plugin: @umijs/preset-umi/dist/commands/mfsu/mfsu] [MFSU][eager] build success
```

```bash title="清除 MFSU 依赖"
$ # 删除依赖信息列表
$ umi mfsu remove
$ # 删除依赖信息列表和产物文件
$ umi mfsu remove --all
```

## verifyCommit

验证 commit message 信息，通常和 [husky](https://github.com/typicode/husky) 搭配使用。

比如在 `.husky/commit-msg` 做如下配置，

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install umi verify-commit $1
```

## version

查看 `umi` 版本，等同于 `umi -v`。

```bash
$ umi version
4.0.0
```
