# TypeScript

Umi 默认开启 TypeScript，如果使用官方脚手架创建项目，内置的文件就是使用 Typescript。

如果想要使用 Javascript 进行开发，可以直接将项目中用到的 `.(ts|tsx)` 文件改为 `.(js|jsx)` 文件，并使用 Javascript 语法进行开发。

## 配置中的 Typescript 提示

如果想要在配置时也有 Typescript 的语法提示，可以在配置的地方包一层 `defineConfig`, 这样配置的时候就可以有语法提示了：

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
