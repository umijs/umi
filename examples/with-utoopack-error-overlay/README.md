# Utoopack Error Overlay

This example verifies the utoopack browser error overlay.

```bash
pnpm dev
pnpm trigger:error
pnpm fix:error
```

Run `pnpm trigger:error` after the dev server is ready. The Less error should
appear in the browser through the utoopack overlay. Run `pnpm fix:error` to
restore the page.
