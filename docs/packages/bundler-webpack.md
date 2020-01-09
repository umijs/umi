# @umijs/bundler-webpack

## Notes

1. file-loader 暂不能升 5，因为 [@svgr/webpack/src/index.js#L39](https://github.com/gregberge/svgr/blob/7f258ab/packages/webpack/src/index.js#L39) 中匹配了 `module.exports`，而 file-loader@5 中产出的是 `export default`
2. ts 编译从 ts-loader 换成 babel-loader，据说会快，待验证
3. 自动识别 css modules

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
