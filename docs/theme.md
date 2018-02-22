---
id: theme
title: 定制主题
---

我们支持通过 [modifyVars](http://lesscss.org/usage/#using-less-in-the-browser-modify-variables) 的方式来覆盖变量。

## 通过 theme 属性定制主题

新建 .webpackrc，.webpackrc 文件用于配置 webpack，内容如下：

```json
{
  "theme": {
    "primary-color": "#7546c9"
  }
}
```

本地开发服务器会自动重启，

<img src="https://gw.alipayobjects.com/zos/rmsportal/YMdGEpszmHZcUfcYBRWO.png" width="450" height="414" style="margin-left:0;" />

然后，效果如下：

<img src="https://gw.alipayobjects.com/zos/rmsportal/qGncpVZOUmhbcxbvihRW.png" width="450" height="414" style="margin-left:0;" />

## 覆盖样式

你可以在 `global.css` 或 `global.less` 里覆盖 antd 的样式，比如：

```css
.ant-btn {
  border-radius: 0 !important;
}
```

## 参考

* https://ant.design/docs/react/customize-theme-cn
* [antd 的默认样式变量](https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less)
* [antd-mobile 的默认样式变量](https://github.com/ant-design/ant-design-mobile/blob/master/components/style/themes/default.less)
