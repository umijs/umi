---
order: 9
toc: content
translated_at: '2024-03-17T09:59:29.526Z'
---

# TypeScript

Umi enables TypeScript by default. If the project is created using the official scaffolding, the built-in files are mainly in the format of `xx.(ts|tsx)`.

## TypeScript Hints in Configuration

If you want to have TypeScript syntax hints during configuration, you can wrap the configuration with `defineConfig()`:

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
