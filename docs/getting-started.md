---
id: getting-started
title: 快速上手
---

Umi 读作**五米**，是基于 React 的高性能、跨平台且体验良好的框架。

## 安装命令行

```bash
$ npm i umi -g

# 检查版本号
$ umi -v
umi@1.0.0-beta.37
```

## 使用命令行

创建应用并进入。

```bash
$ mkdir myapp
$ cd myapp
```

启动 umi dev 服务器。

```bash
$ umi dev
```

在 `pages` 目录新建编辑 page 组件。

```bash
$ echo 'export default () => <div>Index Page</div>' > pages/index.js
```

在浏览器中打开 [http://localhost:8000/](http://localhost:8000/)，你会看到 `Index Page` 。

构建应用。

```bash
$ umi build
```

构建产物会生成在 `dist` 目录。
