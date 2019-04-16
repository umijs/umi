# umi-plugin-auto-externals

Simple way to external in umi.

## Usage

Configured in `.umirc.js`:

```js
export default {
  plugins: [
    ['umi-plugin-auto-externals', {
      externals: [ 'react', 'react-dom', 'moment', 'antd', 'jquery' ],
      urlTemplate: 'https://unpkg.com/{{ library }}@{{ version }}/{{ path }}',
      checkOnline: false,
    }],
  ],
};
```

## Configuration items

### externals

* Type: `Array`

Librarys need to be externaled. Support librarys are:

* `react`
* `react-dom`
* `moment`
* `antd`
* `jquery`

https://github.com/umijs/auto-external-packages

::: warning
If you want to external antd, please ensure that react + react-dom + moment are configed in front of antd.
:::

### urlTemplate

* Type: `String`

If you want to use your own CDN service, you need to config this.

There will be three variables provided to render this template: library, version, path.

### checkOnline

* Type: `Boolean`

If checkOnline is true, we will check all urls if online.
