# Contributing to umi

> Notice: `y` is the alias for `yarn`, `n` is the alias for `npm`.

## Set up

Install dev deps after git clone the repo.

```bash
$ y
```

Link umi globally.

```bash
$ cd packages/umi
$ y link

# Try the umi cli
$ umi -v
umi@0.0.1-alpha.1@local
```

## Common Tasks

Monitor file changes and transform with babel and rollup.

```bash
$ y build --watch
```

Run test.

```bash
# Including e2e test
$ y test

# Test specified file and watch
$ y test getMockData.test.js -w

# Test specified package
$ y test --package core

# Generate coverage
$ y test --coverage
```
