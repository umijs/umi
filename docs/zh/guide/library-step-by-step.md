# 开发一个组件库

## 准备环境

> 如果你想快速开始，也可以直接使用我们的[脚手架](https://github.com/umijs/create-umi)

初始化项目

```bash
# 创建目录
$ mkdir umi-library-demo && cd umi-library-demo

# 初始化
$ yarn init -y

# 安装依赖
$ yarn add umi umi-plugin-library --save-dev
```

添加配置文件 `.umirc.js`

```js
export default {
    plugins: [
        'umi-plugin-library'
    ]
}
```

给 `package.json` 添加 script：

```diff
+ "scripts": {
+    "doc:dev": "umi doc dev"
+ },
```

这时，你已经可以通过以下命令跑起来：

```bash
$ yarn run doc:dev
```

浏览器访问 `http://127.0.0.1:8001/`，即可看到我们的组件开发环境。

## 开发组件

规划目录结构，入口为 `src/index.js`，`Foo`为我们的第一个组件

```bash
.
├── .umirc.js				# 配置
├── package.json
└── src
    ├── Foo					# 组件
    │   └── index.js
    └── index.js			# 入口
```

`Foo` 组件代码如下：

```js
// src/Foo/index.js
import * as React from 'react';

export default function(props) {
  return (
    <button
      style={{
        fontSize: props.size === 'large' ? 40 : 20,
      }}
    >
      { props.children }
    </button>
  );
}
```

接下来跑一下我们的组件，在 `src/Foo` 目录下创建 `index.mdx`，基于 `mdx`，你可以使用 `markdown` 加 `jsx` 语法来组织文档。

```markdown
---
name: Foo
route: /
---

import { Playground } from 'docz';
import Foo from './';

# Foo Component

## Normal Foo

<Foo>Hi</Foo>

## Large Foo with playground

<Playground>
    <Foo size="large">Hi</Foo>
</Playground>
```

再看下我们的开发环境，可以看到组件效果
![屏幕快照 2019-02-06 23.26.51](https://gitcdn.link/repo/clock157/cdn/master/images/blog_library_1.png)

## 组件测试

为了保证组件质量，我们需要引入组件测试，测试方案可以直接使用 [umi-test](https://github.com/umijs/umi/tree/master/packages/umi-test)

```bash
$ yarn add umi-test --save-dev
```

在 `src/Foo` 目录新建测试文件 `index.test.js`

```js
import { shallow } from 'enzyme';
import Foo from './index.js';

describe('<Foo />', () => {
    it('render Foo', () => {
        const wrapper = shallow(<Foo size="large">hello, umi</Foo>);
        expect(wrapper.prop('style').fontSize).toEqual(40);
        expect(wrapper.children().text()).toEqual('hello, umi');
    });
});
```

然后在 `package.json` 的 `scripts` 添加测试命令

```diff
  "scripts": {
    "doc:dev": "umi doc dev",
+   "test": "umi-test"
  },
```

执行测试命令

```bash
$ yarn run test
```

执行结果，测试通过！

```bash
 PASS  src/Foo/index.test.js
  <Foo />
    ✓ render Foo (39ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        11.701s
Ran all test suites.
✨  Done in 15.82s.
```

## 组件打包

组件开发测试完成后，需要打包成不同的产物以适应不同的场景。默认使用 `rollup` 打包生成三个格式的包：

- `cjs`: CommonJs，能被 Node 和 打包工具如 webpack 使用。
- `esm`: ES Module，支持静态分析可以 tree shaking。
- `umd`: Universal Module Definition 通用包，既能像 `cjs` 一样被使用，也可以发布到 cdn，通过 script 的方式被浏览器使用，如果没有这个需求可以通过 `umd: false` 关闭，规避大多的打包问题。

修改 `package.json`

```diff
-  "main": "index.js",
+  "main": "dist/index.js",
+  "module": "dist/index.esm.js",
+  "unpkg": "dist/index.umd.js",
   "scripts": {
    "doc:dev": "umi doc dev",
+   "dev": "umi lib build --watch",
+   "build": "umi lib build",
    "test": "umi-test"
  },
```

使用命令

```bash
# 监控文件变化并打包
$ yarn run dev

# 打包
$ yarn run build
```

打包结果

```bash
yarn run v1.12.3
$ umi lib build
✔  success   [umi-library-demo] cjs: dist/index.js
✔  success   [umi-library-demo] esm: dist/index.esm.js
✔  success   [umi-library-demo] umd: dist/index.umd.development.js
✔  success   [umi-library-demo] umd: dist/index.umd.js
✨  Done in 33.38s.
```

## 验证产物

为了验证我们的产物是否可用，我们可以基于 umi 创建一个小 demo 使用一下，在项目下创建目录 `example`，目录结构：

```bash
example/
└── pages
    └── demo-foo
        └── index.js
```

我们创建了 `demo-foo` 这个页面，并使用 `Foo` 组件，其 `index.js` 代码：

```js
import { Foo } from '../../../dist';

export default function() {
    return (
        <Foo size="large">hello, world</Foo>
    );
}
```

我们跑一下

```bash
$ cd example
$ umi dev

# 如果没有 umi 这个命令，请安装
$ yarn global add umi
```

启动好以后，console 会提示访问地址，打开后访问页面 `/demo-foo`，就可以看到效果：
![组件效果](https://user-images.githubusercontent.com/4002237/52470667-cf6da100-2bc9-11e9-910c-a29e43d1eca2.png)

## 发布组件

组件开发好，发布到 npm registry 就可以被大家使用，也可以发布到私有 registry 内部使用。如果没有 npm 账号需要先注册，然后登陆 `yarn login`。

修改 `package.json`，添加发布 script，发布前执行测试用例，并且包里只含 dist 目录：

```diff
+ "files": ["dist"],
  "scripts": {
+   "pub": "yarn run test && yarn publish",
    "test": "umi-test"
  },
```

执行命令

```bash
$ yarn run pub
```

发布成功后，你就可以在 npm 看到 [umi-library-demo](https://www.npmjs.com/package/umi-library-demo)

对于其他用户，就可以使用以下命令来安装使用这个包。

```bash
# 使用 yarn
$ yarn add umi-library-demo --save

#使用 npm
$ npm install umi-library-demo --save
```

## 发布文档

在我们的组件开发完毕，文档相应写完后我们需要打包和部署文档，以便使用者查阅。

首先修改 `package.json`，添加 script：

```diff
  "scripts": {
    "doc:dev": "umi doc dev",
+   "doc:build": "umi doc build",
+   "doc:deploy": "umi doc deploy",
  },
```

接下来执行命令：

```bash
# 打包文档
$ yarn run doc:build

# 部署文档，速度取决于网速
$ yarn run doc:deploy
```

文档会部署到 `github.io`，url 规则是 `https://{username}.github.io/{repo}`，以这个项目为例，文档地址为：

[https://clock157.github.io/umi-library-demo/](https://clock157.github.io/umi-library-demo/)

## 结语

[示例完整代码](https://github.com/clock157/umi-library-demo)

至此，发布一个组件库的流程：搭建、开发、测试、打包、验证、发布、文档整个流程就走通了，在实际的开发过程中，你可能会遇到更多的问题，或者你对这篇教程有不理解的地方，都可以反馈我们。
