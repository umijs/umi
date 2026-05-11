# with-utoopack-istanbul

This example shows `@umijs/bundler-utoopack` running a Babel plugin from Umi's
`extraBabelPlugins` config.

```ts
export default defineConfig({
  utoopack: {
    babelLoader: true,
  },
  extraBabelPlugins: ['babel-plugin-istanbul'],
});
```

Run:

```bash
pnpm --filter @example/with-utoopack-istanbul build
```

The generated `dist` chunks should contain Istanbul coverage markers such as
`__coverage__`, `statementMap`, `fnMap`, and `branchMap`.
