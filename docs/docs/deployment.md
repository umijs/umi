# Deployment

## Umi's default scheme

Umi tries to be novice-friendly, so by default it does not do on-demand processing. After running `umi build`, three files, `index.html`, `umi.js` and `umi.css`, will be generated.

## Suppress output of html files

In some scenarios, the html file is handled by the back-end, and so the front-end does not need to output the html file. To account for this, you can use the environment variable `HTML=none` in your configuration:

```bash
$ HTML=none umi build
```

## Deploy html to a non-root directory

Users frequently ask the question:

> Why does my local development environment look good, but after deploying to production, there is no response, and there are no errors reported?

This commonly happens when the application is deployed to a non-root path. Why does this happen? In a nutshell it is because the route does not match: when you deploy the application under `/xxx/`, and then visit `/xxx/hello`, the code matches `/hello`, which will not match, and since the fallback route is not defined, such as a 404, a blank page will be displayed instead.

How can you fix this?

To fix this issue, you can configure the [base path](../config#base):

```bash
export default {
  base: '/path/to/your/app/root',
};
```

## Use hash history

If you wish to change the way history is managed to use a hash history, you can change the [history](../config#history) variable to type `hash` to solve this.

```bash
export default {
  history: { type: 'hash' },
};
```

## Load on demand

To achieve on-demand loading, you can configure [dynamicImport](../config#dynamicimport) to do so.

```js
export default {
  dynamicImport: {},
};
```

## Static resources are in a non-root directory or cdn

If your static resources are in a non-root directory or through a cdn, you'll need to configure the [publicPath](../config#publicpath) variable and point it to the path where the static resources (js, css, pictures, fonts, etc.) are located. To learn more about what the `publicPath` configuration option does, please see the [webpack documentation](https://webpack.js.org/configuration/output/#output-publicpath) for details.

```js
export default {
  publicPath: 'http://yourcdn/path/to/static/',
};
```

## Use a runtime publicPath

For scenarios where you need to manage publicPath in html, such as determining the environment in html to generate different outputs, you can configure [runtimePublicPath](/zh-CN/config/#runtimepublicpath) to solve it.

```bash
export default {
  runtimePublicPath: true,
};
```

Then output in html:

```html
<script>
  window.publicPath = <%= YOUR PUBLIC_PATH %>
</script>
```

## Static

In some scenarios, server-side html fallback cannot be done, and so, to make each route output the content of index.html, you'll need to configure the `exportStatic` variable.

For example, in the above example, we can configure in .umirc.js:

```js
export default {
  exportStatic: {},
};
```

And then execute umi build, which will output an html file for each route.

```
./dist
├── index.html
├── list
│   └── index.html
└── static
    ├── pages__index.5c0f5f51.async.js
    ├── pages__list.f940b099.async.js
    ├── umi.2eaebd79.js
    └── umi.f4cb51da.css
```

> Note: the Static option currently does not support variable routing.

## HTML suffix

In some static scenarios, the index file under folders cannot be automatically read, such as in Alipay’s container environment, so html files cannot be generated.

```
├── index.html
├── list
│   └── index.html
```

To handle this, you can use the `htmlSuffix` configuration variable, to make your output look instead like this:

```
├── index.html
└── list.html
```

To do so, configure your .umirc.js file as follows:

```js
export default {
  exportStatic: {
    htmlSuffix: true,
  },
};
```

umi build will generate,

```
./dist
├── index.html
├── list.html
└── static
    ├── pages__index.5c0f5f51.async.js
    ├── pages__list.f940b099.async.js
    ├── umi.2924fdb7.js
    └── umi.cfe3ffab.css
```

## Static output to any path

```js
export default {
  exportStatic: {
    htmlSuffix: true,
    dynamicRoot: true,
  },
};
```
