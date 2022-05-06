# 配置文件格式约定

为了方便 Umi 通过 CLI 来修改项目的配置，项目配置文件需要采用下面两种方式来书写。

## 导出默认配置对象

推荐这样的方式：

```ts
// ✅
export default {
  dva: {},
}
```

而不是这样的方式：

```ts
// ❌
const config = { dva: {} }
export default config
```

## 默认导出配置函数结果

推荐这样的方式：
```ts
// ✅
import { defineConfig } from 'umi';

export default defineConfig({
  dva: {}
})
```

而不是这样的方式：
```ts
// ❌
import { defineConfig } from 'umi';

const config = { dva: {} }
export default defineConfig(config)
```

也不是这样的方式：

```ts
// ❌
import { defineConfig } from 'umi';

const config = defineConfig({ dva: {}})
export default config;
```
