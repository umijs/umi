# @umijs/test

## Break Changes

- `jest.config.js` 中的配置默认为覆盖，而不是扩展，如需扩展，把值改成函数的形式
- 不再内置 enzyme 方案，推荐用 [@testing-library/react](https://github.com/testing-library/react-testing-library)

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

## FAQ
