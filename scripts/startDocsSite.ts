import 'zx/globals';
(async () => {
  await $`pnpm --filter ./packages/plugin-docs build:extra`;
  await $`umi dev`;
})();
