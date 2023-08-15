Sure, here's the translated markdown with the Chinese words replaced:

# Command Line

Umi provides many built-in command-line tools for project startup, building, and various development aids such as generators.

To get a list of available commands, you can run the `help` command in your project directory:

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

Run `umi help <command>` for more information on specific commands.
Visit https://umijs.org/ to learn more about Umi.
```

> For easier searching, the following commands are sorted alphabetically.

## build

Builds the project, suitable for production deployment.

```bash
$ umi build
```

## config

Quickly view and modify configurations through the command line.

To view configurations, you can use `list` or `get`.

```bash
$ umi config list
 - [key: polyfill] false
 - [key: externals] { esbuild: true }

$ umi config get mfsu
 - [key: externals] { esbuild: true }
```

To modify configurations, you can use `set` or `remove`.

```bash
$ umi config set polyfill false
set config:polyfill on /private/tmp/sorrycc-wsYpty/.umirc.ts

$ umi config remove polyfill
remove config:polyfill on /private/tmp/sorrycc-wsYpty/.umirc.ts
```

## dev

Starts the local development server for project development and debugging.

```bash
$ umi dev
        ╔═════════════════════════════════════════════════════╗
        ║ App listening at:                                   ║
        ║  >   Local: https://127.0.0.1:8001                  ║
ready - ║  > Network: https://192.168.1.1:8001                ║
        ║                                                     ║
        ║ Now you can open the browser with the above addresses👆 ║
        ╚═════════════════════════════════════════════════════╝
event - compiled successfully in 1051 ms (416 modules)
```

## generate

Used to incrementally generate files or enable features. The command-line alias is `g`.

When no parameters are added, an interactive generator selection will be provided.

```bash
$ umi g
# Or
$ umi generate
? Pick generator type › - Use arrow keys. Return to submit.
❯   Create Pages -- Create a umi page by page name
    Enable Prettier -- Enable Prettier
```

You can also specify parameters.

```bash
# Generate a route file
$ umi g page index --typescript --less
```

## help

Displays help information.

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

Run `umi help <command>` for more information on specific commands.
Visit https://umijs.org/ to learn more about Umi.
```

You can also specify a command to see detailed help for a specific command.

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

Used to check and correct whether the code complies with the rules.

```bash
$ umi lint
Usage: umi lint

 Supports checking only js, ts, tsx, jsx type files: umi lint --eslint-only

 Supports checking only style files like css, less: umi lint --stylelint-only

 Supports checking css-in-js mode: umi lint --stylelint-only --cssinjs

 Fix code issues: --fix
```

## plugin

Plugin-related operations, currently only supports the `list` sub-command.

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

The `umi preview` command starts a local static web server that runs the `dist` folder at http://127.0.0.1:4172. This is used to preview the built artifacts and supports settings like proxy and mock.

You can configure the server's port using the `--port` parameter.

```bash
$ umi preview --port 9527
```

Now the `preview` command will run the server at http://127.0.0.1:9527.

You can use the `--host` parameter to specify the hostname for the service to run.

The following user configurations will also take effect during `preview`:

- [https](./config#https)
- [proxy](../guides/proxy)
- [mock](../guides/mock)

Note that the `dist` directory will change with the change in the `outputPath` configuration.

## run

The `umi run` command allows you to run TypeScript and ESM files like you would run JavaScript using Node. You can also use [zx](https://github.com/google/zx) to better utilize script commands.

```bash
$ umi run ./script.ts
```

## setup

Initializes the project by performing operations like generating temporary files. Usually set in `scripts.postinstall` in `package.json`.

```json
{
  "scripts": { "postinstall": "umi setup" }
}
```

## deadcode

Used to find unused files in the `src` directory and output them to the root directory.

```bash
$ umi deadcode
- Preparing...
- begin check deadCode
- write file /examples/umi-run/DeadCodeList-{timeStamp}.txt
- check dead code end, please be careful if you want to remove them
```

## mfsu

The `umi mfsu` command can be used to view MFSU dependency information, rebuild MFSU dependencies, and clear MFSU dependencies.

```bash title="Get MFSU Command Help"
$ umi mfsu
```

```bash title="Get MFSU Dependency List"
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

```bash title="Rebuild MFSU Dependencies"
$ umi mfsu build
info  - Preparing...
info  - MFSU eager strategy enabled
warn  - Invalidate webpack cache since mfsu cache is missing
info  - [MFSU] buildDeps since cacheDependency has changed
...
info  - [plugin: @umijs/preset-umi/dist/commands/mfsu/mfsu] [MFSU][eager] build success
```

```bash title="Clear MFSU Dependencies"
$ # Remove dependency information list
$ umi mfsu remove
$ # Remove both dependency information list and artifact files
$ umi mfsu remove --all
```

## verifyCommit

Verifies commit message information, usually used in conjunction with [husky](https://github.com/typicode/husky).

For example, configure the `.husky/commit-msg` as follows,

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install umi verify-commit $1
```

## version

Displays the `umi` version, equivalent to `umi -v`.

```bash
$ umi version
4.0.0
```

