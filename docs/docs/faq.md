---
translateHelp: true
---

# FAQ


> Coming soon... 

## Umi 3 只能用 TypeScript 写吗？

不是。文档中的 `.ts` 替换为 `.js` 同样有效，因为不想每次都带上 `.(j|t)sx?`。

## import from umi 没有定义怎么办？

比如：

```js
import { history } from 'umi';
```

可能报 `xxx has no exported member 'history'`。

这时需要确保两件事，

1. tsconfig.json 中有配置 `@@` 的路径，比如 `"@@/*": ["src/.umi/*"]`，参考 [tsconfig.json 模板](https://github.com/umijs/umi/blob/master/packages/create-umi-app/templates/AppGenerator/tsconfig.json)
2. 确保 `src/.umi/core/umiExports.ts` 有相关内容，如果没有，可通过 `umi build`、`umi dev` 或 `umi g tmp` 任一命令生成
