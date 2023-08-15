# Code Splitting Guide

Umi 4 by default performs page-based splitting and lazy loading (similar to `dynamicImport` in Umi 3), allowing customization of loading animations through [`loading.tsx`](../docs/guides/directory-structure#loadingtsxjsx).

### Using Splitting Strategies

Umi 4 comes with various built-in code splitting strategies ( [codeSplitting](../docs/api/config#codesplitting) ) that can be enabled through configuration:

```ts
// .umirc.ts
export default {
  codeSplitting: {
    jsStrategy: 'granularChunks'
  }
}
```

This will automatically perform package splitting based on certain optimization strategies. For more detailed manual splitting, please refer to the following section.

### Manual Splitting

When your application's size increases, you can further perform manual splitting:

```ts
import { lazy, Suspense } from 'react'

// './Page' component will be automatically split out
const Page = lazy(() => import('./Page'))

export default function() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <Page />
    </Suspense>
  )
}
```

In most cases, you would manually split components that reference larger third-party libraries to achieve on-demand loading.

### Analyzing Build Composition

By specifying the [ANALYZE](../docs/guides/env-variables#analyze) environment variable, you can analyze the composition of your build, allowing you to modify code and make further decisions based on the analysis results.