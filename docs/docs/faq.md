# FAQ


> Coming soon... 

## Umi 3 只能用 TypeScript 写吗？

No. Replacing `.ts` with `.js` in the document is also valid, because you don't want to bring `.(j|t)sx?` every time.

## What to do if import from umi is not defined？

such as:

```js
import { history } from 'umi';
```

May report `xxx has no exported member 'history'`.

Two things need to be ensured,

1. tsconfig.json has the path to configure `@@`, such as `" @@/*": ["src/.umi/*"]`, refer to [tsconfig.json template](https://github.com/umijs/umi/blob/master/packages/create-umi-app/templates/AppGenerator/tsconfig.json)
2. Make sure `src/.umi/core/umiExports.ts` has relevant content. If not, you can generate it by using any command `umi build`, `umi dev`, or `umi g tmp`.
