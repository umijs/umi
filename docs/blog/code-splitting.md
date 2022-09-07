# 代码拆分指南

Umi 4 默认 按页拆包、按需加载（这近似等同于 Umi 3 中的 `dynamicImport`），通过 [`loading.tsx`](../docs/guides/directory-structure#loadingtsxjsx) 来自定义加载动画。

### 手动拆分

当你的产物体积变大时，可进一步手动拆包：

```ts
import { lazy, Suspense } from 'react'

// './Page' 该组件将被自动拆出去
const Page = lazy(() => import('./Page'))

export default function() {
  return (
    <Suspense fallback={<div>loading...</div}>
      <Page />
    </Suspense>
  )
}
```

通常情况下，我们会手动拆分引用了较大第三方库的组件，实现按需加载。

### 分析产物构成

通过指定 [ANALYZE](../docs/guides/env-variables#analyze) 环境变量可以分析产物构成，根据分析结果来修改代码和进一步决策。
