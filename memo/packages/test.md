# @umijs/test

## Break Changes

- `jest.config.js` 中的配置默认为覆盖，而不是扩展，如需扩展，把值改成函数的形式
- 不再内置 enzyme 方案，推荐用 [@testing-library/react](https://github.com/testing-library/react-testing-library)
- 使用 jsdom@14，不再支持 node 6

## Usage

```bash
$ umi-test

# watch mode
$ umi-test -w
$ umi-test --watch

# collect coverage
$ umi-test --coverage

# print debug info
$ umi-test --debug

# test specified package for lerna package
$ umi-test --package name

# don't do e2e test
$ umi-test --no-e2e
```

## Features

### Support modify default config with function in jest.config.js

```js
module.exports = {
  moduleNameMapper(memo) {
    return {
      ...memo,
      '^umi$': require.resolve('umi'),
    };
  },
};
```

### Support lerna package

### Support typescript

### Built-in Polyfills

- core-js/stable
- regenerator-runtime/runtime
- whatwg-fetch

### Support get config from jest.config.js and package.json

jest.config.js 的优先级更高。

## FAQ
