---
id: write-css
title: 写 CSS
---

umi 的样式是通过 css modules 的方式组织的。

## 为组件添加样式

推荐的方式是新建一个和组件同名的 css 文件，比如组件是 index.js，我们可以新建 index.css 。

在 CSS 文件中定义 class，可以不考虑和其他文件的冲突问题。

```css
.normal {
  color: red;
}
```

然后在 index.js 里引入，并通过变量的方式声明样式。

```diff
+ import styles from './index.css';
...
- <div>
+ <div className={styles.normal}>
```

## 参考

* [http://www.ruanyifeng.com/blog/2016/06/css_modules.html](http://www.ruanyifeng.com/blog/2016/06/css_modules.html)

