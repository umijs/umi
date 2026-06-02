# with-utoopack-externals

This example verifies that webpack-style glob externals are accepted by Umi and
normalized for `@umijs/bundler-utoopack`.

```ts
export default defineConfig({
  utoopack: {},
  externals: {
    'lodash/*': 'lodash',
    'lodash/fp/*': 'lodash',
  },
});
```

Run:

```bash
pnpm --filter @example/with-utoopack-externals build
```

The generated bundle should externalize the lodash deep imports instead of
bundling their implementation.
