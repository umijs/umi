# Deployment


## Default Scheme

Umi is friendly to novices by default, so it does not do on-demand loading by default. `umi build` outputs `index.html`, `umi.js`, and `umi.css`.

## Do Not Output HTML Files

Some scene html files are handed to the backend output. The frontend build does not need to output html files. The environment variable `HTML=none` is configurable.

```bash
$ HTML=none umi build
```

## Deploy HTML to a Non-Root Directory

I often have students asking this question:

> Why is my local development good, no response after deployment, and no error?

**No error!** This is a typical phenomenon where an application is deployed on a non-root path. Why do you have this problem? Because the route does not match, for example, if you deploy the application under `/xxx/` and then access `/xxx/hello`, and the code matches `/hello`, then it will not match, but there is no definition. A fallback route, such as 404, will display a blank page.

How to deal with it?

This can be solved by configuring [base](../config#base).

```bash
export default {
  base: '/path/to/your/app/root',
};
```

## 使用 hash history

This can be solved by configuring [history](../config#history) as `hash`.

```bash
export default {
  history: { type: 'hash' },
};
```

## Load on Demand

To achieve on-demand loading, configure [dynamicImport](../config#dynamicimport).

```js
export default {
  dynamicImport: {},
};
```

## Static resource in non-root directory or cdn

In this case, you need to configure [publicPath](../config#publicpath). What is publicPath? Specifically see [webpack documentation](https://webpack.js.org/configuration/output/#output-publicpath), point him to the path where the static resources (js, css, images, fonts, etc.) are located.

```js
export default {
  publicPath: "http://yourcdn/path/to/static/"
}
```

## Using the publicPath of Runtime

For scenarios where publicPath needs to be managed in html, such as judging the environment in html to do different output, you can solve it by configuring [runtimePublicPath](../config#runtimepublicpath).

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

In some scenarios, you can't do html fallback on the server side, that is, let each route output the contents of index.html, then it needs to be static.

For example, in the above example, we configured in .umirc.js:

```js
export default {
  exportStatic: {},
}
```

Then execute the umi build and output an html file for each route.

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

> Note: Statics does not support scenarios with variable routing.

## HTML Suffix

In some static scenarios, the index file is not automatically read, such as Alipay's container environment, then this html file cannot be generated.

```
├── index.html
├── list
│   └── index.html
```

But generate,

```
├── index.html
└── list.html
```

The configuration is in .umirc.js,

```js
export default {
   exportStatic: {
     htmlSuffix: true,
   },
}
```

Umi build will generate,

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

## Statically Output to Any Path

```js
export default {
  exportStatic: {
    htmlSuffix: true,
    dynamicRoot: true,
  },
}
```
