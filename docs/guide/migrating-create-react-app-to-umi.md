---
translateHelp: true
---

# 迁移 create-react-app 到 umi

> 本文档仅作为如何将 create-react-app 迁移到 umi 的基础指引。真实项目的迁移，你可能还需要阅读我们的文档，了解更多关于[插件](/zh-CN/plugins/preset-react)和[配置](/zh-CN/config)的相关信息。

其实将一个 create-react-app 项目迁移到 umi 是一件比较容易的事情。主要需要注意几个默认行为的差异。接下来，我们通过以下步骤，将 create-react-app 的初始项目迁移到 umi。

## 依赖处理

在 `package.json` 中修改依赖并修改项目启动命令，更多 umi cli 的信息，可以查看[我们的文档](/zh-CN/docs/cl)。

```diff
{
  "scripts": {
-    "start": "react-scripts start",
+    "start": "umi dev",
-    "build": "react-scripts build",
+    "build": "umi build",
-    "test": "react-scripts test",
+    "test": "umi-test"
-    "eject": "react-scripts eject"
  },
  "dependencies": {
-    "react-scripts": "3.4.2"
+    "umi": "^3.2.14"
  },
+ "devDependencies": {
+    "@umijs/test": "^3.2.14"
+ }
}
```

## 修改根组件

create-react-app 的入口是 `src/index`，在 umi 中并没有真实的暴露程序的主入口，但是我们可以在 [layouts](/zh-CN/docs/convention-routing#全局-layout) 中执行同样的操作。

将 `src/index` 中的逻辑转移到 `src/layouts/index` 中，操作完成你的代码应该看起来像：

```js
import React from 'react';
import './index.css';

export default ({ children }) => (
  <React.StrictMode>{children}</React.StrictMode>
);
```

## 转移页面文件

将页面组件转移到 [`src/pages`](/zh-CN/docs/convention-routing) 目录下面。

> 这里我们期望通过路由 `/` 访问 App 文件，因此我们如下修改文件名，并修改内部引用。

![image](https://user-images.githubusercontent.com/11746742/89971217-3d969680-dc8d-11ea-8d4e-c60b1e9431ba.png)

## [HTML 模版](/zh-CN/docs/html-template)

将 `public/index.html` 中的内容，转移到 `src/pages/document.ejs`。

create-react-app 中通过 `%PUBLIC_URL%` 取得部署路径，而 umi 中需要通过 [`context`](/zh-CN/docs/html-template#配置模板) 取值。

```diff
- <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
+ <link rel="icon" href="<%= context.config.publicPath +'favicon.ico'%>" />
```

## 修改 eslint 配置

将 package.json 中的 eslint 配置，转移到 `.eslintrc.js`。在 umi 项目中我们推荐你使用 `@umijs/fabric`。当然，你可以使用你熟悉的任意配置。

```diff
{
  "devDependencies": {
+    "@umijs/fabric": "^2.2.2",
  }
-  "eslintConfig": {
-    "extends": "react-app"
-  }
}
```

```js
module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
};
```

## 测试相关

### 增加测试配置引用

新建配置文件 `jest.config.js`，编写如下配置：

```js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
```

### 使用 `umi-test` 替代 `react-scripts test`

相关修改可以查看上文中提到的**依赖处理**，如果你刚才没有留意，你可以返回去查看。

执行 `umi-test`：

```bash
$ umi-test
 PASS  src/pages/index.test.js (11.765s)
  ✓ renders learn react link (31ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        12.594s
Ran all test suites.
✨  Done in 13.83s.
```

## 启动项目

执行 `umi dev`，项目将会在 `http://localhost:8000/` 上启动，如果你习惯使用 `3000` 端口，你可以通过[环境变量](/zh-CN/docs/env-variables)来设置。现在项目看起来应该与迁移之前的效果一致。

> 完整的迁移操作，可以查看这一次[提交](https://github.com/xiaohuoni/cra-2-umi/commit/66c87974f36cdb7d40629c056b1b1cdc4ebc8950)。
