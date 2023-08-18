---
order: 9
toc: content
---
# TypeScript

Umi 默认开启 TypeScript，如果是使用官方脚手架创建项目，内置的文件是以 `xx.(ts|tsx)` 为主的。

## 配置中的 TypeScript 提示

如果想要在配置时拥有 TypeScript 语法提示，可以在配置的地方包一层 `defineConfig()`：

```ts
// .umirc.ts

import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
});
```

![defineConfig](https://img.alicdn.com/imgextra/i4/O1CN01WqZ2Ma1ZqiNbTefi6_!!6000000003246-2-tps-1240-1000.png)
