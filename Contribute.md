# Contribute

## Set up

Install dev deps after git clone the repo.

```bash
$ yarn
```

Bootstrap every package with yarn. (Need to execute when new package is included)

```bash
$ npm run bootstrap -- --npm-client yarn
```

Link umi globally.

```bash
$ cd packages/umi
$ yarn link
```

## Common Tasks

Monitor file changes and transform with babel.

```bash
$ npm run build -- --watch
```

Run test for a specified package.

```bash
$ lerna exec --scope af-webpack -- npm run debug
```

Run `umi dev` in examples/simple.

```bash
$ cd examples/func-test
$ umi dev

# Specifiy the port
$ PORT=8001 umi dev
```

Then open http://localhost:8000/ in your browser.

Run `umi build` in examples/simple.

```bash
$ cd examples/func-test
$ umi build

# Build without compress
$ NO_COMPRESS=true umi build
```

Publish to npm.

```bash
$ npm run publish
```

## Git Commit Message Convention

> From the [config-conventional](https://github.com/marionebl/commitlint/tree/master/%40commitlint/config-conventional) standard conventional
