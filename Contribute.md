# Contribute

## Set up

Install dev deps after git clone the repo.

```bash
$ yarn
```

Bootstrap every package with yarn. (Need to execute when new package is included)

```bash
$ yarn bootstrap
```

Link umi globally.

```bash
$ cd packages/umi
$ yarn link
```

## Common Tasks

Monitor file changes and transform with babel.

```bash
$ yarn build --watch
```

Run test.

```bash
# Including e2e test
$ yarn test

# Unit test only
$ yarn debug .test.(t|j)s

# Test specified file and watch
$ yarn debug getMockData.test.js -w
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
$ npm run publish
```
