---
order: 10
toc: content
translated_at: '2024-03-17T10:32:30.023Z'
---

# Environment Variables

Umi can use environment variables for some special configuration and functions.

## How to Set Environment Variables

### Set when Executing Commands

For example, if you need to change the port of the `umi dev` development server, you can use the following command.

```bash
# OS X, Linux
$ PORT=3000 umi dev

# Windows (cmd.exe)
$ set PORT=3000&&umi dev
```

If you need to use environment variables on different operating systems, it is recommended to use the tool [cross-env](https://github.com/kentcdodds/cross-env).

```bash
$ pnpm install cross-env -D
$ cross-env PORT=3000 umi dev
```

### Set in .env File

If your environment variables need to be shared among developers, it is recommended to set them in the `.env` file in your project root directory, for example:

```text
# file .env
PORT=3000
BABEL_CACHE=none
```

Then execute,

```bash
$ umi dev
```

`umi` will start the dev server on port 3000 and disable babel's cache.

If you have some environment variables that need special configuration locally, you can configure them in the `.env.local` file to override the configuration in `.env`. For example, on top of the previous `.env` configuration, if you want to override the port 3000 with port 4000 for local development, you can define it as follows.

```text
# file .env.local
PORT=4000
```

`umi` will start the dev server on port 4000 while keeping babel's cache disabled.

Furthermore, the `umi` `.env` file also supports the way of configuring environment variables through variables. For example:

```
# file .env.local
FOO=foo
BAR=bar

CONCAT=$FOO$BAR # CONCAT=foobar
```

Use `.env.development` / `.env.production` to configure different environment variables for development and build respectively.

Note:

* It is not recommended to add `.env.local` to version control.

### Use Environment Variables in Browser

All the environment variables set through `.env` files or command line injection are by default only effective within the Umi configuration file (Node.js environment) and cannot directly use `process.env.VAR_NAME` in the browser. By further configuring [`define`](../api/config.md#define), they can be injected into the browser environment:

```bash
# .env
MY_TOKEN="xxxxx"
```

<br />

```ts
// .umirc.ts

  define: { 'process.env.MY_TOKEN': process.env.MY_TOKEN }
```

Note: We agree that all environment variables starting with `UMI_APP_` will be automatically injected into the browser, no need to configure `define` manually.

## List of Environment Variables

Listed in alphabetical order.

### APP_ROOT

Specify the project root directory.

Note:

* `APP_ROOT` cannot be set in `.env`, it can only be added in the command line

### ANALYZE

Used to analyze the bundle composition, turned off by default.

For example:

```bash
$ ANALYZE=1 umi dev
# or
$ ANALYZE=1 umi build
```

You can customize the port with the `ANALYZE_PORT` environment variable or customize the configuration with the [`analyze`](../api/config#analyze) option.

### BABEL_POLYFILL

By default, it applies all the patches for the targeted browsers based on the targets configuration, setting to `none` disables the built-in patch scheme.

### COMPRESS

CSS and JS are compressed by default, when the value is `none`, no compression is applied, valid during `build`.

### DID_YOU_KNOW

Setting to `none` will disable the "Did You Know" tips.

### ERROR_OVERLAY

Setting to `none` will disable the "Error Overlay", useful when debugging Error Boundary.

### FS_LOGGER

By default, physical logging is enabled, setting to `none` disables it, and it is temporarily not saved for webcontainer scenarios (e.g., stackbliz).

### HMR

HMR feature is enabled by default, setting to `none` turns it off.

### HOST

The default is `0.0.0.0`.

### PORT

Specifies the port number, the default is `8000`.

### SOCKET_SERVER

Specifies the socket server for HMR. For example:

```bash
$ SOCKET_SERVER=http://localhost:8000/ umi dev
```

### SPEED_MEASURE

Analyzes the Webpack compile time, supports `CONSOLE` and `JSON` formats, the default is `CONSOLE`.

```bash
$ SPEED_MEASURE=JSON umi dev
```

### UMI_ENV

When `UMI_ENV` is specified, it will additionally load the configuration file with the specified value, with priority as:

 - `config.ts`

 - `config.${UMI_ENV}.ts`

 - `config.${dev | prod | test}.ts`

 - `config.${dev | prod | test}.${UMI_ENV}.ts`

 - `config.local.ts`

If `UMI_ENV` is not specified, only the configuration file corresponding to the current environment will be loaded, the more specific down the list, the higher the priority, higher priority configurations can be moved down.

Note: Depending on the current environment, `dev`, `prod`, `test` configuration files will be automatically loaded, do not set the value of `UMI_ENV` to these.

### UMI_PLUGINS

Specifies the path of additional plugins to load when the `umi` command is executed, separated by `,`.

```bash
$ UMI_PLUGINS=./path/to/plugin1,./path/to/plugin2  umi dev
```

### UMI_PRESETS

Specifies the path of additional plugin sets to load when the `umi` command is executed, separated by `,`.

```bash
$ UMI_PRESETS=./path/to/preset1,./path/to/preset2  umi dev
```

### UMI_DEV_SERVER_COMPRESS

By default, the Umi development server comes with the [compress](https://github.com/expressjs/compression) compression middleware, which [prevents streaming access to SSE data](https://github.com/umijs/umi/issues/12144) during development. You can close the compress compression feature by specifying `UMI_DEV_SERVER_COMPRESS=none`:

```bash
  UMI_DEV_SERVER_COMPRESS=none umi dev
```

### WEBPACK_FS_CACHE_DEBUG

Turn on webpack's physical cache debug log.

```bash
$ WEBPACK_FS_CACHE_DEBUG=1 umi dev
```
