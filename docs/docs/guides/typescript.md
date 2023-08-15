# TypeScript

Umi enables TypeScript by default. If you use the official scaffolding to create a project, the built-in files will be in TypeScript.

If you want to develop using JavaScript, you can simply rename the `.(ts|tsx)` files in your project to `.(js|jsx)` files and use JavaScript syntax for development.

## TypeScript Typing in Configuration

If you want TypeScript syntax highlighting and autocompletion in your configuration files as well, you can wrap your configuration in a `defineConfig` function. This will enable TypeScript typing in your configuration:

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
