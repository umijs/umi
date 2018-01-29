---
id: getting-started
title: 快速上手
---

## 安装

用 `npm` 安装 umi ：

```bash
$ npm i umi -g
```

或者用 `yarn` ：

```bash
$ yarn global add umi
```

然后可以 `umi -v` 检查版本号。

```bash
$ umi -v
umi@1.0.0
```

## 创建应用

> umi 暂时没有提供脚手架，之后可能会添加。

创建应用并进入。

```bash
$ mkdir myapp
$ cd myapp
```

## 启动 dev 服务器

```bash
$ umi dev

Compiled successfully!

You can now view Your App in the browser.

  Local:            http://localhost:8000/

Note that the development build is not optimized.
To create a production build, use npm run build.
```

## 创建第一个页面

在 `pages` 目录里新建首页。

```bash
$ echo 'export default () => <div>Index Page</div>' > pages/index.js
```

如果你是 Window 系统，可以手动新建 `pages/index.js`，并填入：

```js
export default () => <div>Index Page</div>;
```

然后在浏览器中打开 [http://localhost:8000/](http://localhost:8000/)，你会看到 `Index Page` 。

<img src="https://gw.alipayobjects.com/zos/rmsportal/vyNMAXgHZhEHNBisqUcY.png" width="450" height="414" style="margin-left:0;" />

## 构建应用

```bash
$ umi build

Compiled successfully.

File sizes after gzip:

  52.09 KB  static/umi.2b7e5e82.js
  186 B     static/__common-umi.6a75ebe1.async.js
```

构建产物会生成在 `dist` 目录。

```bash
$ tree ./dist

dist
├── index.html
└── static
    ├── __common-umi.6a75ebe1.async.js
    └── umi.2b7e5e82.js

1 directory, 3 files
```

## 部署

构建产出的 dist 目录是可直接运行的，我们用 [serve](https://github.com/zeit/serve) 让 dist 目录跑起来。

```bash
$ npm i serve -g
$ cd dist
$ serve

Serving!

- Local:            http://localhost:5000   
- On Your Network:  http://{Your IP}:5000

Copied local address to clipboard!
```
