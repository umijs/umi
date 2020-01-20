# Contributing to umi

## Set up

Install dev deps after git clone the repo.

```bash
$ yarn
```

Link umi globally.

```bash
$ cd packages/umi
$ yarn link
```

Try the `umi` cli.

```bash
$ yarn build
$ umi -v
umi@0.0.1-alpha.1@local
```

## Build

Transform with babel and rollup.

```bash
$ yarn build

# Build and monitor file changes
$ yarn build --watch

# Build specified package only
$ PACKAGE=core yarn build --watch
```

## Test

```bash
$ yarn test

# Test specified file and watch
$ yarn test getMockData.test.js -w

# Test specified package
$ yarn test --package core

# Generate coverage
$ yarn test --coverage
```

## Create new package

Such as creating package `foo`.

```bash
$ mkdir -p packages/foo
$ yarn bootstrap
```

Then you will find the `README.md` and `package.json` is generated in `packages/foo`.

```bash
$ tree packages/foo
packages/foo
├── README.md
└── package.json
```

## Upgrade dependencies

```bash
$ yarn update:deps
```
