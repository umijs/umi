# umi-plugin-datahub

umi plugin for integrating [macaca-datahub](//github.com/macacajs/macaca-datahub), which is a GUI-style mock tool that can be used to replace umi's built-in mock solution.

<div align="center">
  <img src="https://wx2.sinaimg.cn/large/6d308bd9gy1fpbmdx2whdj21kw13a7fa.jpg" width="75%" />
</div>

## Setup

Install it via npm or yarn,

```bash
$ npm i umi-plugin-datahub -D
```

Configure and import this plugin in `.umirc.js`,

```js
export default {
  plugins: [
    'umi-plugin-datahub',
  ],
};
```

## Options

We can specify options for macaca-datahub, such as proxy and store.

```javascript
export default {
  plugins: [
    ['umi-plugin-datahub', {
      proxy: {
        '^/api': {
          hub: 'hubname',
        },
      },
      store: path.join(__dirname, 'data'),
    }],
  ],
};
```

Checkout [macaca-datahub](//github.com/macacajs/macaca-datahub#configuration) for more options.

## Example

- [umi-examples](//github.com/umijs/umi-examples/tree/master/eleme-demo)

## LICENSE

MIT
