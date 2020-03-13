---
translateHelp: true
---

# Deployment


## Default Scheme

Umi 默认对新手友好，所以默认不做按需加载处理，`umi build` 后输出 `index.html`、`umi.js` 和 `umi.css` 三个文件。

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

可通过配置 [base](../config#base) 解决。 

```bash
export default {
  base: '/path/to/your/app/root',
};
```

## 使用 hash history

可通过配置 [history](../config#history) 为 `hash` 为解决。 

```bash
export default {
  history: { type: 'hash' },
};
```

## Load on Demand

要实现按需加载，需配置 [dynamicImport](../config#dynamicimport)。

```js
export default {
  dynamicImport: {},
};
```

## 静态资源在非根目录或 cdn

这时，就需要配置 [publicPath](../config#publicpath)。至于 publicPath 是啥？具体看 [webpack 文档](https://webpack.js.org/configuration/output/#output-publicpath)，把他指向静态资源（js、css、图片、字体等）所在的路径。

```js
export default {
  publicPath: "http://yourcdn/path/to/static/"
}
```

## Using the publicPath of Runtime

对于需要在 html 里管理 publicPath 的场景，比如在 html 里判断环境做不同的输出，可通过配置 [runtimePublicPath](/zh/config/#runtimepublicpath) 为解决。 

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
