---
translateHelp: true
---

# @umijs/plugin-antd-mobile

整合 antd-mobile 组件库。

## 启用方式

配置开启。

## 介绍

包含以下功能，

1. 内置 [antd-mobile](https://mobile.ant.design/)，目前内置版本是 `^5.0.0`
2. 内置 [antd-mobile-v2](https://antd-mobile-v2.surge.sh/)，目前内置版本是 `^2.3.4`
3. 基于 [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) 做按需编译

插件默认兼容 antd-mobile@5 和 antd-mobile-v2 同时使用。用户可以通过在项目中显示的安装相对应的版本，来控制项目中使用到的组件。

## 配置

### hd

开启 hd 模式，会使用 antd-mobile/2x 中的组件。（该配置对仅使用 antd-mobile@2 模式下无效，操作方式详见下方 FAQ）

- Type: `object`
- Default: `null`

## FAQ

### 如何使用 antd-mobile 的其他版本？

在项目中显式安装 antd-mobile 依赖。

### 原始项目中使用了 antd-mobile@2 的组件，如何升级？

把项目中所有对 antd-mobile 的引入都替换为 antd-mobile-v2，例如：

```
import {Button} from 'antd-mobile'
// ⬇️
import {Button} from 'antd-mobile-v2'
```

运行（测试、构建）你的项目，确认项目一切正常之后，引入 `antd-mobile` 使用 antd-mobile@5 的组件，例如：

```
// 这时候用的是 antd-mobile@5
import {Button} from 'antd-mobile'
```

### 老旧项目不想使用 antd-mobile@5 应该怎么做？

在项目中显式的安装 antd-mobile@2 ，例如：

```
// package.json
"dependencies": {
  "antd-mobile": "^2.3.4",
}
```
