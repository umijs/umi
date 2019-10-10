# Contribute

> Notice: `y` is the alias for `yarn`, `n` is the alias for `npm`.

## Set up

Install dev deps after git clone the repo.

```bash
$ y
```

Bootstrap every package with yarn. (Need to execute when new package is included)

```bash
$ y bootstrap
```

Link umi globally.

```bash
$ cd packages/umi
$ y link
```

## Common Tasks

Monitor file changes and transform with babel.

```bash
$ y build --watch
```

Run test.

```bash
# Including e2e test
$ y test

# Unit test only
$ y debug .test.(t|j)s

# Test specified file and watch
$ y debug getMockData.test.js -w

# Test specified package
$ PACKAGE=umi-mock y debug

# Don't run e2e test
$ E2E=none y debug

# Generate coverage
$ y debug --coverage
```

Run `umi dev` in examples/func-test.

```bash
$ cd examples/func-test
$ umi dev
```

Then open http://localhost:8000/ in your browser.

Run `umi build` in examples/simple.

```bash
$ cd examples/func-test
$ umi build

# Build without compress
$ COMPRESS=none umi build
```

Publish to npm.

```bash
# Generator the changelog first.
$ y changelog

# Do not use yarn for this command.
$ n run publish
```

Debug doc in local.

```bash
$ y doc:dev
```

Deploy doc to [umijs.org](https://umijs.org/).

```bash
$ y doc:deploy
```

Debug `umi ui` in local.

```bash
$ y ui:build --watch

# Then run umi ui under a umi project.
$ umi ui

# if want to debug for more defail, using
$ DEBUG=umiui:UmiUI* umi ui

# Or
$ umi dev --ui
```

PR rebase automatically using `/rebase` comment.

![image](https://user-images.githubusercontent.com/13595509/65825000-14069380-e2a4-11e9-9186-e3c31d265b5f.png)
