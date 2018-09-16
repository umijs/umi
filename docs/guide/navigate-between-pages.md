# Navigate between pages

::: warning
This article has not been translated yet. Wan't to help us out? Click the `Edit this page on GitHub` at the end of the page.
:::

In umi, there are two ways to jump between pages: declarative and imperative.

## Declarative

Based on `umi/link`, it is usually used as a React component.

```bash
import Link from 'umi/link';

export default () => (
   <Link to="/list">Go to list page</Link>
);
```

## Command

Based on `umi/router`, it is usually called in event processing.

```js
import router from 'umi/router';

function goToListPage() {
  router.push('/list');
}
```

For more command-style jump methods, see [api#umi/router](/api/#umi-router).
