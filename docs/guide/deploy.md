# Deploy

## Default Scheme

Umi@2 is friendly to newbies by default, so it does not load on-demand by default. After `umi build`, it outputs three files: `index.html`, `umi.js` and `umi.css`.

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

Can be solved by configuring [base](/config/#base).

```bash
export default {
  base: '/path/to/your/app/root',
};
```

## Use hashHistory

This can be solved by configuring [history](/config/#history) for `hash`.

```bash
export default {
  history: 'hash',
};
```

## Load on Demand

To implement on-demand loading, load the umi-plugin-react plugin and configure [dynamicImport](/plugin/umi-plugin-react.html#dynamicimport).

```js
export default {
  plugins: [
    ['umi-plugin-react', {
      dynamicImport: true,
    }],
  ],
};
```

See the parameter [umi-plugin-react#dynamicImport](/plugin/umi-plugin-react.html#dynamicimport) for details.

## Static Resources in Non-Root Directory or CDN

At this point, you need to configure [publicPath](/config/#publicPath). As for publicPath, what? Look at the [webpack documentation](https://webpack.js.org/configuration/output/#output-publicpath) and point it to the path where the static resources (js, css, images, fonts, etc.) are located.

```js
export default {
  publicPath: "http://yourcdn/path/to/static/"
}
```

## Using the publicPath of Runtime

For scenes that need to manage publicPath in html, such as judging the environment to make different output in html, you can solve it by configuring [runtimePublicPath](/config/#runtimepublicpath).

```bash
export default {
  runtimePublicPath: true,
};
```

Then output in html:

```html
<script>
window.publicPath = <%= YOUR_PUBLIC_PATH %>
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
