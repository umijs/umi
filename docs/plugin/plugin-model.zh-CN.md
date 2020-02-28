---
title: 插件 @umijs/plugin-model
translateHelp: true
---

# @umijs/plugin-model

简易数据流，通常用于中台项目的全局共享数据。

## 约定

我们约定在 `src/model` 目录下的文件为项目定义的 model 文件。每个文件需要默认导出一个 function，该 function 定义了一个 Hook，不符合规范的文件我们会过滤掉。

文件名则对应最终 model 的 name，你可以通过插件提供的 API 来消费 model 中的数据。

## 配置

该插件无配置项。

## API

### useModel

`useModel` 是一个 Hook，提供消费 Model 的能力，使用示例如下：

```js
import { useModel } from 'umi';

export default () => {
  const { user, fetchUser } = useModel('user');
  return <>hello</>
};
```
