---
id: deploy
title: 部署
---

umi build 后会生成 dist 目录，这个目录可直接用于部署。

比如：

```bash
./pages
├── index.css
├── index.js
└── list.js
```

build 之后会生成：

```
./dist
├── index.html
└── static
    ├── pages__index.5c0f5f51.async.js
    ├── pages__list.f940b099.async.js
    ├── umi.2eaebd79.js
    └── umi.f4cb51da.css
```

index.html 会加载 umi.{hash}.js 和 umi.{hash}.css，然后按需加载 index 和 list 两个页面的 JS。

## 部署 static 目录到 cdn

一旦静态资源和 html 分开部署，比如要部署到 cdn 上，而 umi 又大量使用了按需加载，这时，就需要配置 publicPath。至于 publicPath 是啥？具体看 [webpack 文档](https://webpack.js.org/configuration/output/#output-publicpath)，把他指向静态资源（js、css、图片、字体等）所在的路径。

umi 里，publicPath 可以在 .webpackrc 里配置：

```json
{
  "publicPath": "http://yourcdn/path/to/static/"
}
```

也可以通过环境变量指定，

```bash
$ PUBLIC_PATH=http://yourcdn/path/to/static/ umi build
```

## HTML 在非根路径

经常有同学问这个问题：

> 为什么我本地开发是好的，部署后就没反应了，而且没有报错？

**没有报错！**这是应用部署在非根路径的典型现象。为啥会有这个问题？因为路由没有匹配上，比如你把应用部署在 `/xxx/` 下，然后访问 `/xxx/hello`，而代码里匹配的是 `/hello`，那就匹配不上了，而又没有定义 fallback 的路由，比如 404，那就会显示空白页。

怎么解决？

通过环境变量配置 BASE_URL，

```bash
$ BASE_URL=/path/to/yourapp/ umi build
```

## 静态化

在一些场景中，无法做服务端的 html fallback，即让每个路由都输出 index.html 的内容，那么就要做静态化。

比如上面的例子，我们在 .umirc.js 里配置：

```js
export default {
  exportStatic: {},
}
```

然后执行 umi build，会为每个路由输出一个 html 文件。

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

> 注意：静态化暂不支持有变量路由的场景。

## HTML 后缀

有些静态化的场景里，是不会自动读索引文件的，比如支付宝的容器环境，那么就不能生成这种 html 文件，

```
├── index.html
├── list
│   └── index.html
```

而是生成，

```
├── index.html
└── list.html
```

配置方式是在 .umirc.js 里，

```js
export default {
  exportStatic: {
    htmlSuffix: true,
  },
}
```

umi build 会生成，

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
