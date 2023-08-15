# Env Variables

Umi can use environment variables to configure specific settings and functionality.

## How to Set Environment Variables

### Setting in Command Line

For example, if you need to change the port of the `umi dev` development server, you can achieve this with the following command:

```bash
# OS X, Linux
$ PORT=3000 umi dev

# Windows (cmd.exe)
$ set PORT=3000&&umi dev
```

If you need to use environment variables across different operating systems, it's recommended to use the tool [cross-env](https://github.com/kentcdodds/cross-env):

```bash
$ pnpm install cross-env -D
$ cross-env PORT=3000 umi dev
```

### Setting in `.env` File

If you want to share environment variables among developers, it's recommended to set them in a `.env` file at the root of your project. For example:

```text
# file .env
PORT=3000
BABEL_CACHE=none
```

Then execute:

```bash
$ umi dev
```

The `umi` command will start the dev server on port 3000 and disable babel caching.

If you have some environment variable configurations that need to be customized locally, you can configure them in the `.env.local` file to override the configurations in `.env`. For instance, based on the previous `.env` configuration, if you want to use port 4000 for local development instead of the previous 3000, you can define it as follows:

```text
# file .env.local
PORT=4000
```

The `umi` command will start the dev server on port 4000 and still disable babel caching.

Additionally, you can use variable interpolation to configure environment variables in the `.env` file. For example:

```
# file .env.local
FOO=foo
BAR=bar

CONCAT=$FOO$BAR # CONCAT=foobar
```

Note:

* It's not recommended to include `.env.local` in version control.

## List of Environment Variables

Listed in alphabetical order.

### APP_ROOT

Specifies the project root directory.

Note:

* APP_ROOT cannot be configured in `.env`, only in command line.

### ANALYZE

Used for analyzing bundle composition, disabled by default.

For example:

```bash
$ ANALYZE=1 umi dev
# Or
$ ANALYZE=1 umi build
```

You can customize the port using the `ANALYZE_PORT` environment variable or the [`analyze`](../api/config#analyze) option.

### BABEL_POLYFILL

By default, Babel will apply polyfills based on the targets configuration. Setting this to `none` disables the built-in polyfill.

### COMPRESS

By default, CSS and JS are compressed. Setting this to `none` disables compression and is effective during the build process.

### DID_YOU_KNOW

Setting this to `none` disables "Did You Know" prompts.

### ERROR_OVERLAY

Setting this to `none` disables the "Error Overlay," which can be useful when debugging error boundaries.

### FS_LOGGER

By default, physical logs are saved. Setting this to `none` disables saving logs. It is also disabled for web container scenarios (e.g., stackblitz).

### HMR

HMR (Hot Module Replacement) is enabled by default. Setting this to `none` disables HMR.

### HOST

The default value is `0.0.0.0`.

### PORT

Specifies the port number. The default is `8000`.

### SOCKET_SERVER

Specifies the socket server used for HMR. For example:

```bash
$ SOCKET_SERVER=http://localhost:8000/ umi dev
```

### SPEED_MEASURE

Analyzes Webpack compilation time. Supports two formats: `CONSOLE` and `JSON`. Default is `CONSOLE`.

```bash
$ SPEED_MEASURE=JSON umi dev
```

### UMI_ENV

When `UMI_ENV` is specified, it will load an additional configuration file with the specified value. The priority is:

 - `config.ts`

 - `config.${UMI_ENV}.ts`

 - `config.${dev | prod | test}.ts`

 - `config.${dev | prod | test}.${UMI_ENV}.ts`

 - `config.local.ts`

If `UMI_ENV` is not specified, only the configuration file corresponding to the current environment will be loaded. Files that are lower in the list will override those higher up.

Note: Depending on the current environment, the `dev`, `prod`, and `test` configuration files will be automatically loaded. You should not set `UMI_ENV` to these values.

### UMI_PLUGINS

Specifies the paths of additional plugins to load when executing the `umi` command. Use commas to separate paths.

```bash
$ UMI_PLUGINS=./path/to/plugin1,./path/to/plugin2  umi dev
```

### UMI_PRESETS

Specifies the paths of additional plugin sets to load when executing the `umi` command. Use commas to separate paths.

```bash
$ UMI_PRESETS=./path/to/preset1,./path/to/preset2  umi dev
```

### WEBPACK_FS_CACHE_DEBUG

Enables debug logs for Webpack's physical caching.

```bash
$ WEBPACK_FS_CACHE_DEBUG=1 umi dev
```
