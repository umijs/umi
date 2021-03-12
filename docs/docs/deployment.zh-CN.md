# 部署

## 默认方案

Umi 默认对新手友好，所以默认不做按需加载处理，`umi build` 后输出 `index.html`、`umi.js` 和 `umi.css` 三个文件。

## 不输出 html 文件

某些场景 html 文件交给后端输出，前端构建并不需要输出 html 文件，可配置环境变量 `HTML=none` 实现。

```bash
$ HTML=none umi build
```

## 部署 html 到非根目录

经常有同学问这个问题：

> 为什么我本地开发是好的，部署后就没反应了，而且没有报错？

**没有报错！** 这是应用部署在非根路径的典型现象。为啥会有这个问题？因为路由没有匹配上，比如你把应用部署在 `/xxx/` 下，然后访问 `/xxx/hello`，而代码里匹配的是 `/hello`，那就匹配不上了，而又没有定义 fallback 的路由，比如 404，那就会显示空白页。

怎么解决？

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

## 按需加载

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
  publicPath: 'http://yourcdn/path/to/static/',
};
```

## 使用 runtime 的 publicPath

对于需要在 html 里管理 publicPath 的场景，比如在 html 里判断环境做不同的输出，可通过配置 [runtimePublicPath](/zh-CN/config/#runtimepublicpath) 为解决。

```js
export default {
  runtimePublicPath: true,
};
```

然后在 html 里输出：

```html
<script>
  window.publicPath = <%= YOUR PUBLIC_PATH %>
</script>
```

## 静态化

在一些场景中，无法做服务端的 html fallback，即让每个路由都输出 index.html 的内容，那么就要做静态化。

比如上面的例子，我们在 .umirc.js 里配置：

```js
export default {
  exportStatic: {},
};
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
};
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

## 静态化后输出到任意路径

```js
export default {
  exportStatic: {
    htmlSuffix: true,
    dynamicRoot: true,
  },
};
```
