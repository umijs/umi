# Configuration

## Configuration File

Umi can be configured in `.umirc.js` or `config/config.js` (choose one, `.umirc.js` has priority), ES6 syntax is supported.

> To simplify the description, only `.umirc.js` will appear in subsequent documents.

Such as:

```js
export default {
  base: '/admin/',
  publicPath: 'http://cdn.com/foo',
  plugins: [
    ['umi-plugin-react', {
      dva: true,
    }],
  ],
};
```

For details, see [Configuration](/config/).

## .umirc.local.js

`.umirc.local.js` is a local configuration file, **don't commit to git**, so it usually needs to be configured to `.gitignore`. If it exists, it will be merged with `.umirc.js` and then returned.

## UMI_ENV

The configuration can be specified by the environment variable `UMI_ENV` to distinguish between different environments.

For a example,

```js
// .umirc.js
export default { a: 1, b: 2 };

// .umirc.cloud.js
export default { b: 'cloud', c: 'cloud' };

// .umirc.local.js
export default { c: 'local' };
```

When `UMI_ENV` is not specified, the configuration is:

```js
{
  a: 1,
  b: 2,
  c: 'local',
}
```

When `UMI_ENV=cloud` is specified, the configuration is:

```js
{
  a: 1,
  b: 'cloud',
  c: 'local',
}
```
