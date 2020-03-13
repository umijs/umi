---
translateHelp: true
---

# Env Variables


## Setting environment variables

### Add when executing the command

such as,

```bash
# OS X, Linux
$ PORT=3000 umi dev

# Windows (cmd.exe)
$ set PORT=3000&&umi dev
```

If you want to consider both OS X and Windows, you can use the three-party tool [cross-env](https://github.com/kentcdodds/cross-env),

```bash
$ yarn add cross-env --dev
$ cross-env PORT=3000 umi dev
```

### Defined in .env file

Umi convention `.env` in the root directory is the environment variable configuration file.

such as:

```bash
PORT=3000
BABEL_CACHE=none
```

Then execute,

```bash
$ umi dev
```

The dev server will be started at port 3000, and babel's cache will be disabled.

## List of environment variables

Sorted alphabetically.

### APP\_ROOT

Specify the project root directory.

note:

* APP\_ROOT cannot be used in `.env`, it can only be added on the command line

### ANALYZE

Used to analyze the composition of the bundle. It is turned off by default.

such as:

```bash
$ ANALYZE=1 umi dev
# or
$ ANALYZE=1 umi build
```

### COMPRESS

CSS and JS are compressed by default. When the value is none, it is not compressed. It is valid at build time.

### FORK_TS_CHECKER

TypeScript type checking is not enabled by default and is enabled when the value is `1`. such as:

```bash
$ FORK_TS_CHECKER=1 umi dev
```

### FRIENDLY_ERROR

Disabled when set to none, in some scenarios [friendly-errors-webpack-plugin](https://github.com/geowarin/friendly-errors-webpack-plugin) will hide errors.

```bash
$ FRIENDLY_ERROR=none umi dev
```

### HMR

When set to `none`, hot code update is disabled.

### HTML

When set to `none`, HTML is not output.` Umi build` is effective.

### HOST

The default is `0.0.0.0`.

### PORT

Specify the port number. The default is `8000`.

### PROGRESS

Disables the progress bar when set to `none`. such as:

```bash
$ PROGRESS=none umi dev
```

### UMI_ENV

Specify the configuration files for different environments. For details, see [Multi-environment Configuration](TODO).
