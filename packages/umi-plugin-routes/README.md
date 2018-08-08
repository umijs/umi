# umi-plugin-routes

## Usage

Install via yarn or npm.

```bash
$ yarn add umi-plugin-routes
```

Configure it in the `.umirc.js`.

```js
export default {
  plugins: [
    ['umi-plugin-routes', option],
  ],
};
```

## Option

### option.exclude

type: `Array(RegExp|Function)`

e.g.

```js
{
  exclude: [
    // exclude all the `models` directory
    /models\//,
    // exclude ./pages/a.js
    (route) { return route.component === './pages/a.js' },
  ],
}
```

### option.update

type: `Function`

e.g.

```
{
  update(routes) {
    return [
      { path: '/foo', component: './bar.js' },
      ...routes,
    ];
  }
}
```
