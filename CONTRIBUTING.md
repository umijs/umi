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

If the server starts on a different port, such as 8003 or 8004, this is because another process is currently running on port 8002.

It's a better idea to find the running process and kill it.

```bash
# Mac/Linux:
$ lsof -i tcp:3000
# Find the ID of the process
$ kill <process id>

# Windows
$ netstat -ano | findstr :3000
# Find the ID of the process
$ taskkill /PID typeyourPIDhere /F
```

Then,

```
# Then run umi ui under a umi project.
$ LOCAL_DEBUG=1 umi ui

# if want to debug for more defail, using
$ LOCAL_DEBUG=1 DEBUG=umiui:UmiUI* umi ui

# Or Run `umi dev --ui` in examples/func-test.
$ umi dev --ui
```

PR rebase automatically using `/rebase` comment.

![image](https://user-images.githubusercontent.com/13595509/65825000-14069380-e2a4-11e9-9186-e3c31d265b5f.png)
