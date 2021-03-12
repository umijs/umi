# FAQ

## General

### Umi 3 只能用 TypeScript 写吗？

不是。文档中的 `.ts` 替换为 `.js` 同样有效，因为不想每次都带上 `.(j|t)sx?`。

### 使用 React 17

在 `package.json` 中升级 React 依赖，同时安装 TypeScript 4.1 及以上

```diff
	"dependencies": {
-   "react": "^16.0.0",
+   "react": "^17.0.0",
-   "react-dom": "^16.0.0",
+   "react-dom": "^17.0.0",
  },
  "devDependencies": {
+   "typescript": "^4.1.0"
  }
```

去掉 `import React from 'react'` 模块引入

```diff
- import React from 'react';

function App() {
  return <h1>Hello World</h1>;
}
```

同时 `tsconfig.json` 修改 `jsx` 配置：

```diff
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "importHelpers": true,
-   "jsx": "react",
+   "jsx": "react-jsx",
    "esModuleInterop": true,
    "sourceMap": true,
    "baseUrl": "./",
    "strict": true,
    "paths": {
      "@/*": ["src/*"],
      "@@/*": ["src/.umi/*"]
    },
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "mock/**/*",
    "src/**/*",
    "config/**/*",
    ".umirc.ts",
    "typings.d.ts"
  ]
}
```

### import from umi 没有定义怎么办？

比如：

```js
import { history } from 'umi';
```

可能报 `xxx has no exported member 'history'`。

这时需要确保两件事，

1. tsconfig.json 中有配置 `@@` 的路径，比如 `"@@/*": ["src/.umi/*"]`，参考 [tsconfig.json 模板](https://github.com/umijs/umi/blob/master/packages/create-umi-app/templates/AppGenerator/tsconfig.json)
2. 确保 `src/.umi/core/umiExports.ts` 有相关内容，如果没有，可通过 `umi build`、`umi dev` 或 `umi g tmp` 任一命令生成

### 如何动态修改 title ？

可以通过 [plugin-helmet](/plugins/plugin-helmet) 插件动态修改 title 。

### layout 路由如何传值给子路由

推荐用 context 或者数据流方案，如果用 cloneElement 传值需要传两级，因为第一级是 Switch，然后才是 Route。

```js
React.Children.map(children, (child) => {
  return React.cloneElement(
    child,
    null,
    React.Children.map(child.props.children, (child) => {
      return React.cloneElement(child, { test: 'test' });
    }),
  );
});
```

参考：

- https://github.com/umijs/umi/pull/1282#issue-224134432

## 报错

### `umi` 不是内部或外部命令

e.g.

<img src="https://gw.alipayobjects.com/zos/rmsportal/fatmbcGwSOwDntHjmrtG.png" />

需配置 NODE_PATH 环境变量，如使用 yarn，可通过执行 `yarn global bin` 拿到 bin 路径。

### 配了 `dynamicImport.loading` 后外层报错不生效怎么办？

组件报错有两种形式：

1)

```js
a(); // 出错
export default () => <>..</>;
```

2)

```js
export default () => {
  a(); // 出错
  return <>..</>;
};
```

第二种不管怎么样都能正常抛错，第一种在开启 dynamicImport 并配置了 loading 时可能会不生效。

比如 loading 指向的文件内容为：

```js
export default () => <>loading...</>;
```

那么出错时也会只显示 loading... 。

#### 解决

loading 处理出错场景，比如：

```js
export default class extends React.PureComponent {
  render() {
    if (process.env.NODE_ENV === 'development' && this.props.error) {
      console.error(this.props.error.stack);
      return <div>{this.props.error.stack}</div>;
    }
    return <div>loading...</div>;
  }
}
```

### ie 报错和压缩问题解决思路

感觉现在 ie 下的错误，都是因为这个问题引起的。

#### 典型错误

![image](https://user-images.githubusercontent.com/11746742/62197556-a37dec00-b3b2-11e9-8f72-999058e9b305.png)

#### 解决思路

##### 第一步、确认你的需求

主要是**是否需要兼容旧版本不支持 es6 的浏览器**，

- 如果需要兼容，跳到第二步
- 如果不需要兼容，配置 `minimizer` 为 `terserjs`

##### 第二步

检查 `targets` 配置，确认是否有包含旧版本浏览器比如，

```js
{
  targets: { ie: 10 },
}
```

尝试构建，如果没有问题，则不用再执行下一步。

##### 第三步、记录错误文件和行号

比如前面的，

- 文件：vendors.async.js
- 行号：193
- 出错 token：`>`

##### 第四步、不压缩构建，查找出错源

```bash
# 如果你用 umi
$ COMPRESS=none umi build

# 如果你用 bigfish
$ COMPRESS=none bigfish build
```

找 `vendors.async.js` 的 193 行，看下是哪个包出错的，记录包名和版本号。

##### 第五步、修改本地`node_modules/es5-imcompatible-versions/package.json` 文件，写入刚刚出错的包名和版本号。

```js
"antd-table-infinity": {
        "^1.1.2": {
          "version": "^1.1.2",
          "reason": "https://github.com/Leonard-Li777/antd-table-infinity/blob/master/src/components/Table/InfinityTable/index.jsx#L7"
        }
      }
```

##### 第六步、保存文件，重新 build，确认错误已修复

##### 第七步、给 [es5-imcompatible-versions](https://github.com/umijs/es5-imcompatible-versions) 提 PR

###### 不会提交 PR 的同学，请按下面步骤操作

1、在[编辑](https://github.com/umijs/es5-imcompatible-versions/edit/master/package.json)里面，把你刚才的修改，在这里也修改一下。 2、修改完，页面拉到最下方。创建一个分支（可能会是自动创建分支的情况，如果没得选择，这里不理会就好）点击绿色按钮 `Propose file change` ![image](https://user-images.githubusercontent.com/11746742/62198380-189df100-b3b4-11e9-8684-8e5fc9d2e929.png) 3、在跳转后的页面，点击绿色按钮 `Create pull request` ![image](https://user-images.githubusercontent.com/11746742/62198516-5ac73280-b3b4-11e9-9130-aaee6defdb03.png)

##### 第八步、将跳转后的链接，发到群里面。等待合并

如：`https://github.com/umijs/es5-imcompatible-versions/pull/36`

#### 参考

- [https://github.com/sorrycc/blog/issues/68](https://github.com/sorrycc/blog/issues/68)
- [https://github.com/umijs/es5-imcompatible-versions](https://github.com/umijs/es5-imcompatible-versions)

### The dependency was not found

![The dependency was not found](https://user-images.githubusercontent.com/11746742/87644864-49229a80-c77f-11ea-909d-8e3d2bb5d7c2.png)

一般是网络不好装包错误导致的，可以删除 `*.lock` 和 `node_modules` 重新执行 `yarn`，如果多次尝试都无法解决。可以在项目目录下执行 `git clean -dfx`，再重装，一般可以解决。

如果同一个项目你同事可以运行，你运行出错。一般都是缓存或者安装包过程出错问题。可以尝试删除几个缓存目录，比如删除 `src/.umi/cache` 后重试。

## webpack

### 如何配置额外的 loader ?

比如 svg 我希望不走 base64，而是全部产生 svg 文件，可以这样配：

```js
export default {
  // 添加 url-loader 的 exclude
  urlLoaderExcludes: [/.svg$/],
  // 添加 loader
  chainWebpack(config) {
    config.module
      .rule('svg-with-file')
      .test(/.svg$/)
      .use('svg-with-file-loader')
      .loader('file-loader');
  },
};
```

## CSS

### 为啥我 import 的 css 文件不生效？

umi 默认是开启 css modules 的，请按照 css modules 的方式进行书写。

参考：

- [css-modules/css-modules](https://github.com/css-modules/css-modules)
- [CSS Modules 用法教程](http://www.ruanyifeng.com/blog/2016/06/css_modules.html)

### 如何禁用 css modules ？

修改 `.umirc.js`:

```json
{
  "disableCSSModules": true
}
```

但没有特殊的理由时，不建议关闭 css modules。

### 如何使用 sass ？

先安装额外的依赖，

```bash
$ npm i node-sass sass-loader --save
```

然后修改 `.umirc.js`:

```json
{
  "sass": {}
}
```

#### 开启按需加载后如何把 css 打包成一个文件？

配置 splitChunks，比如：

```js
export default {
  dynamicImport: {},
  chainWebpack(config) {
    config.optimization.splitChunks({
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.(css|less)$/,
          chunks: 'async',
          minChunks: 1,
          minSize: 0,
        },
      },
    });
  },
};
```

打包后会输出：

```
File sizes after gzip:

  126.85 KB  dist/umi.js
  535 B      dist/p__users.async.js
  533 B      dist/p__index.async.js
  337 B      dist/styles.async.js
  96 B       dist/styles.chunk.css
```

示例：

- [sorrycc-123.zip](https://github.com/umijs/umi/files/2556654/sorrycc-123.zip)

参考：

- https://github.com/webpack-contrib/mini-css-extract-plugin#extracting-all-css-in-a-single-file
- https://github.com/umijs/umi/blob/master/packages/umi-plugin-react/test/chunks/.umirc.js#L1

### 如何禁用掉每次刷新路由时出现的 loading... 状态？

给 dynamicImport 引入一个空组件比如 `Loading.tsx` ，内容如下：

```typescript
// components/Loading.tsx

import React from 'react';

export default () => <></>;
```

```typescript
export default {
  dynamicImport: {
    loading: '@/components/Loading',
  },
};
```

## Test

### 如何断点调试

确保 node 在 8.10 以上，然后执行：

```bash
$ node --inspect-brk ./node_modules/.bin/umi test
```

然后在浏览器里打开 chrome://inspect/#devices 进行 inspect 和断点。

## 请求

### proxy 代理不成功,没有代理到实际地址

![image](https://user-images.githubusercontent.com/22974879/48049412-8debe500-e1d9-11e8-8f36-0c3aa89c50b0.png)

代理只是服务请求代理，这个地址是不会变的。原理可以简单的理解为，在本地启了一个服务，你先请求了本地的服务，本地的服务转发了你的请求到实际服务器。所以你在浏览器上看到的请求地址还是http://localhost:8000/xxx 。以服务端是否收到请求为准

https://github.com/ant-design/ant-design-pro/issues/2779

## 部署

### build 后访问路由刷新后 404？

几个方案供选择：

- 改用 hashHistory，在 `.umirc.js` 里配 `history: 'hash'`
- 静态化，在 `.umirc.js` 里配 `exportStatic: true`
- 服务端配置路由 fallback 到 index.html

### build 之后图片丢失？

可能是图片没有正确引用，可以参考一下代码，正确引入图片。

```js
import React from 'react';
import logo from './logo.png'; // 告诉WebPACK这个JS文件使用这个图像

console.log(logo); // logo.84287d09.png

function Header() {
  // 导入图片
  return <img src={logo} alt="Logo" />;
}

export default Header;
```

在 css 中使用，注意不要使用绝对路径

```css
.Logo {
  background-image: url(./logo.png);
}
```

> 注意：图片大小小于 10 k 时会走 base64。即不会被拷贝到 public 文件夹下，而是以 base64 的资源存在。

### 部署在静态文件服务时，如搭配 cordova 使用，页面空白，提示找不到文件？

可以尝试配置 `publicPath: './',`

### Cannot assign to read only property 'exports' of object '#&lt;Object&gt;'

出现这个报错，一般是在一个文件里混用了 `import` 和 `module.exports`

推荐统一改成 ES Module 标准导入、导出形式：

```diff
import { A } from './a';

- module.exports = A;
+ export default A;
```

如果需要改动的文件比较多，可以 `npm i @babel/plugin-transform-modules-commonjs -D`，然后在 umi 配置文件中加上 `extraBabelPlugins: ['@babel/plugin-transform-modules-commonjs']`。
