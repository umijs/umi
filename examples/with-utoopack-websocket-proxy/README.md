# Utoopack WebSocket proxy

From the repository root, build the local Utoopack adapter once:

```bash
pnpm --filter @umijs/bundler-utoopack build
```

Start the WebSocket backend:

```bash
pnpm --filter @example/with-utoopack-websocket-proxy backend
```

In another terminal, start the Umi example:

```bash
pnpm --filter @example/with-utoopack-websocket-proxy dev
```

Open <http://127.0.0.1:8000>. The page should show `connected` and
`connected through the Umi proxy`. The backend terminal should report exactly
one connection to `/ws`.
