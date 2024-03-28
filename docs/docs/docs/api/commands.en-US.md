---
order: 4
toc: content
translated_at: '2024-03-17T10:43:51.227Z'
---

# Command Line

umi offers many built-in command line interfaces to start and build projects, as well as some auxiliary development commands, such as generators.

To get a list of available commands, you can run the help command in the project directory:

```bash
umi help
```

You should see logs similar to the following:

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

> For ease of lookup, the commands below are sorted alphabetically.

## build

Build the project for deployment in a production environment.

```bash
$ umi build
```

## config

Quickly view and modify configuration via the command line.

Viewing configuration, you can use `list` or `get`.

```bash
$ umi config list
 - [key: polyfill] false
 - [key: externals] { esbuild: true }

$ umi config get mfsu
 - [key: externals] { esbuild: true }
```

Modifying configuration, you can use `set` or `remove`.

```bash
$ umi config set polyfill false
set config:polyfill on /private/tmp/sorrycc-wsYpty/.umirc.ts

$ umi config remove polyfill
remove config:polyfill on /private/tmp/sorrycc-wsYpty/.umirc.ts
```

## dev

Start a local development server for project development and debugging.

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

Used for incrementally generating files or enabling features, the command line alias is `g`.

When used without any parameters, it will opt for an interactive generator selection.

```bash
$ umi g
# or
$ umi generate
? Pick generator type › - Use arrow-keys. Return to submit.
❯   Create Pages -- Create a umi page by page name
    Enable Prettier -- Enable Prettier
```

You can also specify parameters.

```bash
# Generate route files
$ umi g page index --typescript --less
```

## help

View help.

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

You can also specify a command to see detailed help for that command.

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

Used to check and correct code to match rules.

```bash
$ umi lint
Usage: umi lint

 Support for validation of js, ts, tsx, jsx type files only: umi lint --eslint-only

 Support for validation of css, less and other style files only: umi lint --stylelint-only

 Support for cssinjs mode validation: umi lint --stylelint-only --cssinjs

 Correct the code: --fix

```

## plugin

Plugin related operations, currently only supports the `list` subcommand.

List all plugins.

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

The `umi preview` command will launch a local static web server, running the dist folder at http://127.0.0.1:4172, for previewing the production build, supporting proxy, mock, etc. settings.

You can use the `--port` parameter to configure the service's running port.

```bash
$ umi preview --port 9527
```

Now the `preview` command will run the server at http://127.0.0.1:9527.

Use the `--host` parameter to specify the service's running hostname.

The following user configurations will also take effect during `preview`

* [https](./config#https)
* [proxy](../guides/proxy)
* [mock](../guides/mock)

Note that the `dist` directory will change with the configuration of `outputPath`.

## run

The `umi run` command allows you to run TypeScript and ESM files like running js with node. You can pair it with [zx](https://github.com/google/zx) for better script command usability.

```bash
$ umi run ./script.ts
```

## setup

Initialize the project, doing operations like generating temporary files. Usually set in `scripts.postinstall` in package.json.

```bash
{
  "scripts": { "postinstall": "umi setup" }
}
```

## deadcode

Used to find files in the src directory that are not referenced, and output to the root directory.

```bash
$ umi deadcode
- Preparing...
- begin check deadCode
- write file /examples/umi-run/DeadCodeList-{timeStamp}.txt
- check dead code end, please be careful if you want to remove them
```

## mfsu

The `umi mfsu` command can be used to view MFSU dependency information, rebuild MFSU dependencies, and clear MFSU dependencies.

```bash title="Get MFSU command help"
$ umi mfsu
```

```bash title="Get MFSU dependency list"
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

```bash title="Rebuild MFSU dependency"
$ umi mfsu build
info  - Preparing...
info  - MFSU eager strategy enabled
warn  - Invalidate webpack cache since mfsu cache is missing
info  - [MFSU] buildDeps since cacheDependency has changed
...
info  - [plugin: @umijs/preset-umi/dist/commands/mfsu/mfsu] [MFSU][eager] build success
```

```bash title="Clear MFSU dependency"
$ # Delete dependency information list
$ umi mfsu remove
$ # Delete dependency information list and product files
$ umi mfsu remove --all
```

## verifyCommit

Verify commit message information, usually used in conjunction with [husky](https://github.com/typicode/husky).

For example, configure the following in `.husky/commit-msg`,

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install umi verify-commit $1
```

## version

View the `umi` version, equivalent to `umi -v`.

```bash
$ umi version
4.0.0
```
