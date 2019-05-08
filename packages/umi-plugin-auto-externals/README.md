# umi-plugin-auto-externals

A simple way to [external](https://webpack.js.org/configuration/externals/) packages in umi.

## Usage

Configured in `.umirc.js`:

```js
export default {
  plugins: [
    ['umi-plugin-auto-externals', {
      packages: [ 'antd' ],
      urlTemplate: 'https://unpkg.com/{{ library }}@{{ version }}/{{ path }}',
      checkOnline: false,
    }],
  ],
};
```

## Configuration items

### packages

* Type: `Array`

Librarys need to be externaled. Support librarys are:

* `react`
* `react-dom`
* `moment`
* `antd`
* `jquery`

https://github.com/umijs/auto-external-packages

### urlTemplate

* Type: `String`
* Default: `{{ publicPath }}externals/{{ library }}@{{ version }}/{{ path }}`

If you want to use your own CDN service, you need to config this item.

There will be three variables provided to render this template: library, version, path.

For example: `https://unpkg.com/{{ library }}@{{ version }}/{{ path }}`

### checkOnline

* Type: `Boolean`

If checkOnline is true, we will check all urls if online.

## LICENSE

MIT
