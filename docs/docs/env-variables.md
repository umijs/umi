---
translateHelp: true
---

# Env Variables

## Setting environment variables

### When executing CLI command

Example:

```bash
# OS X, Linux
$ PORT=3000 umi dev

# Windows (cmd.exe)
$ set PORT=3000&&umi dev
```

If you want it to work for multiple Operating Systems, such as OS X and Windows, you can use [cross-env](https://github.com/kentcdodds/cross-env)，

```bash
$ yarn add cross-env --dev
$ cross-env PORT=3000 umi dev
```

### .env file

The `.env` file can be used to configure environment variables.

Example:

```bash
PORT=3000
BABEL_CACHE=none
```

Then execute

```bash
$ umi dev
```

The dev server is started at port 3000, and babel's cache is disabled.

## List of environment variables

In alphabetical order

### APP\_ROOT

Specify the project root directory.

Note:

* APP\_ROOT can not bne set in `.env` file, you can only set it via CLI

### ANALYZE

Used to analyze the composition of the bundle. It is turned off by default.

Example:

```bash
$ ANALYZE=1 umi dev
# build
$ ANALYZE=1 umi build
```

### COMPRESS

By default, CSS and JS are compressed. When the value is `none`, it is not compressed. It is valid during build.

### FORK_TS_CHECKER

The default is not open TypeScript type checking is `1` enabled. 

Example:

```bash
$ FORK_TS_CHECKER=1 umi dev
```

### HTML

Set `none` when output is not HTML, `umi build` is valid.

### HOST

The default is `0.0.0.0`。

### PORT

Specify the port number. The default is `8000`.

### UMI\_ENV

Specify the respective configuration files for different environments. For details, see [TODO](TODO)。
