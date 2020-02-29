# @umijs/bundler-webpack

## Notes

- node_modules 也走 babel 编译
- ts 编译从 ts-loader 换成 babel-loader，据说会快，待验证
- 自动识别 css modules
- theme 暂不支持字符串，只支持对象
- postcss 默认启用 stage-3 特性
- js 压缩只提供 terser-webpack-plugin 的方式，因为 node_modules 走了 babel 编译，不会出现 es6 代码
- [BREAK CHANGE] less 配置 `lessLoaderOptions` 变更为 `lessLoader`
- [BREAK CHANGE] css 配置 `cssLoaderOptions` 变更为 `cssLoader`

## 自动识别 css modules

### 使用

a.css

```css
.a {
  color: red;
}
```

b.css

```css
.b {
  color: red;
}
```

a.js

```js
import styles from './a.css';
import './b.css';
```

打包 a.js，输出 css，

```
.a___6ESeB { color: red; }
.b { color: red }
```

### 方案

- https://github.com/umijs/umi/issues/1417
