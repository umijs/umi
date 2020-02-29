# @umijs/plugin-dva

整合 dva 数据流。

## 启用方式

配置开启。

## 介绍

包含以下功能，

### 内置 dva

默认版本是 `^2.6.0-beta.20`，如果项目中有依赖，会优先使用项目中依赖的版本。

### import from umi

常用方法可从 umi 直接 import。

比如：

```js
import { connect } from 'umi';
```

### 约定式的 model 组织方式

比如以下目录，

```bash
+ src
  + models
    - a.js
    - b.js
  + pages
    + user
      + models
        - user.js
        - role.js
```

上面看到的所有 JS 文件，如果有 `export default` dva model 对象，会被自动注册。

### 内置

### 文件名即 namespace

可以省去 model 导出的 `namespace` key。

### 内置 dva-loading

直接 `connect` `loading` 属性使用即可。

### 配置开启 dva-immer

通过配置 `dva.immer` 开启。

## 配置

比如：

```js
export default {
  dva: {
    immer: true,
    hmr: false,
  },
}
```

### immer

* Type: `boolean`
* Default: `false`

表示是否启用 immer 以方便修改 reducer。

### hmr

* Type: `boolean`
* Default: `false`

表示是否启用 dva model 的热更新。
