# Contributing to umi

## Set up

Install dev deps after git clone the repo.

```bash
# npm is not allowed.
$ yarn
```

Link umi globally.

```bash
$ cd packages/umi
$ yarn link
$ cd -
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

## Release

```bash
$ npm run release
$ npm run release -- --publish-only
$ npm run release -- --skip-git-status-check
$ npm run release -- --skip-build
$ npm run release -- --otp
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

## Docs

```bash
# add doc
$ yarn docs add docs/routing --title Routing
```

## Examples

Umi 3 examples in `examples/*` directory

### Running the Examples apps

Running examples:

```sh
yarn example dev examples/normal
```

### Create new examples

Such as creating example `hello-world`.

```bash
$ mkdir -p examples/hello-world
$ yarn bootstrap:examples
```

Then you will find the `README.md` and `package.json` is generated in `examples/hello-world`.

```bash
$ tree examples/hello-world
examples/hello-world
├── pages/index.tsx
├── README.md
└── package.json
```

## Benchmarks

if you want to add a benchmark, you can add `examples/*/benchmark.js` like this:

```js
// examples/ssr-normal/benchmark.js
module.exports = (suite) => {
  // add tests
  suite
    // your logic
    .add('ssr#normal /')
    // your logic
    .add('ssr#normal#stream /');
};
```

and run `yarn benchmark` to see the result:

```bash
$ node scripts/benchmarks.js
☐  pending   building .../examples/ssr-normal
☒  complete  success build .../examples/ssr-normal
ssr#normal / x 2,400 ops/sec ±2.08% (76 runs sampled)
ssr#normal#stream / x 4,026 ops/sec ±1.45% (50 runs sampled)
```
