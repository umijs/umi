# @umijs/bundler-webpack

## Notes

- ts 编译从 ts-loader 换成 babel-loader，据说会快，待验证
- 自动识别 css modules
- theme 暂不支持字符串，只支持对象

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
