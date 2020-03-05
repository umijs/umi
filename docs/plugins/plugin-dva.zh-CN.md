# @umijs/plugin-dva

整合 dva 数据流。

## 启用方式

配置开启。

## 介绍

包含以下功能，

* **内置 dva**，默认版本是 `^2.6.0-beta.20`，如果项目中有依赖，会优先使用项目中依赖的版本。
* **约定是到 model 组织方式**，不用手动注册 model
* **文件名即 namespace**，model 内如果没有声明 namespace，会以文件名作为 namespace
* **内置 dva-loading**，直接 connect `loading` 字段使用即可
* **支持 immer**，通过配置 `immer` 开启

### 约定式的 model 组织方式

符合以下规则到文件会被认为是 model 文件，

* `src/models` 下的文件
* `src/pages` 下，子目录中 models 目录下的文件
* `src/pages` 下，所有 model.ts 文件

比如：

```bash
+ src
  + models/a.ts
  + pages
    + foo/models/b.ts
    + bar/model.ts
```

其中 `a.ts`，`b.ts` 和 `model.ts` 如果其内容是有效 dva model 写法，则会被认为是 model 文件。

### dva model 校验

默认，上一小节的找到的文件，会做一次校验，校验通过后，才会被添加到最终到 dva model 列表。

一些示例，

```typescript
// 通过
export default { namespace: 'foo' };
export default { reducers: 'foo' };

// 通过
const model = { namespace: 'foo' };
export default model;

// 通过，支持 dva-model-extend
import dvaModelExtend from 'dva-model-extend';
export default dvaModelExtend(baseModel, {
  namespace: 'foo',
});

// 通过
export default <Model>{ namespace: 'foo' };

// 不通过
export default { foo: 'bar' };
```

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

### skipModelValidate

* Type: `boolean`
* Default: `false`

是否跳过 model 验证。

### extraModels

* Type: `string[]`
* Default: `[]`

配置额外到 dva model。

### immer

* Type: `boolean`
* Default: `false`

表示是否启用 immer 以方便修改 reducer。

### hmr

* Type: `boolean`
* Default: `false`

表示是否启用 dva model 的热更新。

## umi 接口

常用方法可从 umi 直接 import。

比如：

```js
import { connect } from 'umi';
```

接口包含，

### connect

绑定数据到组件。

### getDvaApp

获取 dva 实例，即之前的 `window.g_app`。

### useDispatch

hooks 的方式获取 dispatch，dva 为 2.6.x 时有效。

### useSelector

hooks 的方式获取部分数据，dva 为 2.6.x 时有效。

### useStore

hooks 的方式获取 store，dva 为 2.6.x 时有效。

## 命令

### umi dva list model

查看项目中包含了哪些 model。

```bash
$ umi dva list model
```

## FAQ

### import { connect 等 API } from umi 无效？

检查：

1. dva 配置有没有开启，该插件是配置开启的
2. 有没有有效的 dva model，可通过执行 `umi dva list model` 检查，或者执行 `umi g tmp` 后查看 `src/.umi/plugin-dva/dva.ts` 中检查 model 注册情况 

以及 tsconfig.json 等定义问题，参考 [FAQ#import from umi 没有定义怎么办？](../docs/faq#import-from-umi-没有定义怎么办？)

### 我的 model 写法很动态，不能被识别出来怎么办？

配置 `dva: { skipModelValidate: true }` 关闭 dva 的 model 校验。
