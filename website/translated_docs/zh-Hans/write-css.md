---
id: write-css
title: 写 CSS
---

写 CSS 的方案有很多选择，比如：

* css modules
* css in js
* ...

但如果是 SPA 应用，需确保多个页面之间的样式不会冲突，因为目前所有样式会被打包到一起。

umi 内置支持 css modules 以及 less，项目目录下的所有 `.css` 和 `.less` 文件会被处理为 css modules，下面介绍的是 css modules 的方式。

## 为组件添加样式

组件样式通常和组件 JS 同名，比如组件是 index.js，我们可以新建 index.css。

新建 `pages/index.css`，内容如下：

```css
.normal {
  color: red;
  margin: 20px 0;
}
```

然后编辑 `pages/index.js`，

```js
import Link from 'umi/link';
import styles from './index.css';

export default () => <div className={styles.normal}>
  Index Page
  <br />
  <Link to="/list"><button>go to /list</button></Link>
</div>
```

## 添加全局样式

有些样式我们希望全局生效，比如针对 antd 的样式覆盖，全局配置字体、行高、链接等。

新增 `global.css` 为页头页尾添加样式，内容如下：

```
header {
  background: #aaa;
  font-size: 20px;
}
footer {
  border-top: 1px solid #ccc;
  padding-top: 8px;
  color: #aaa;
}
```

`global.css` 或 `global.less` 是全局样式的约定文件，这个文件存在即会自动引入。

最终效果如下：

<img src="https://gw.alipayobjects.com/zos/rmsportal/PEzsPNTSsztxKWoyApTa.png" width="450" height="414" style="margin-left:0;" />

## 参考

* http://www.ruanyifeng.com/blog/2016/06/css_modules.html
* https://github.com/css-modules/css-modules
