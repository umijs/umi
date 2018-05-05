
# umi-plugin-datahub

umi plugin for integrating [mocaca-datahub](https://github.com/macacajs/macaca-datahub), which is a GUI-style mock tool that can be used to replace umi's built-in mock solution.

<img src="https://camo.githubusercontent.com/ccba90158ba05866a0f02634e24be1e26747e7d4/68747470733a2f2f7778322e73696e61696d672e636e2f6c617267652f36643330386264396779316670626d6478327768646a32316b773133613766612e6a7067" />

## Setup

Install it via npm or yarn,

```bash
$ npm i umi-plugin-datahub -D
```

Configure this plugin in `.umirc.js`,

```js
export default {
  plugins: [
    'umi-plugin-datahub',
  ],
};
```

## Options

We can specify options for mocaca-datahub, such as proxy and store.

```js
export default {
  plugins: [
    ['umi-plugin-datahub', {
      proxy: {
        '^/api': {
          hub: 'ifccustmng',
        },
      },
      store: path.join(__dirname, 'data'),
    }],
  ],
};
```

Checkout [data-proxy-middleware](https://github.com/macacajs/datahub-proxy-middleware#common-usage) and [macaca-datahub](https://github.com/macacajs/macaca-datahub#configuration) for more options.

## LICENSE

MIT
