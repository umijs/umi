# Contribute

## Set up

Install lerna@2.x globally after git clone the repo.

```bash
$ npm i lerna@2.x -g
```

Install dev deps.

```bash
$ npm i
```

Bootstrap every package. (Need to execute when new package is included)

```bash
$ lerna bootstrap
```

Link umi globally.

```bash
$ cd packages/umi
$ npm link
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
$ cd boilerplates/simple
$ umi dev

# Specifiy the port
$ PORT=8001 umi dev
```

Then open http://localhost:8000/ in your browser.

Run `umi build` in examples/simple.

```bash
$ cd boilerplates/simple
$ umi build

# Don't compress
$ NO_COMPRESS=true umi build

# Debug transform result of specified loader
DEBUG_LOADER=src/page/index.js umi build
```

Publish to npm.

```bash
$ npm run publish

# Ignore specified package
$ npm run publish -- --ignore af-webpack
```
