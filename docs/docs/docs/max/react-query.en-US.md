---
order: 11
toc: content
translated_at: '2024-03-17T08:46:49.932Z'
---

# react-query

@umijs/max comes with the [react-query](https://tanstack.com/query/) request strategy (which is the same as @tanstack/react-query).

## How to enable

If using @umijs/max, enable by configuring.

```ts
export default {
  reactQuery: {},
}
```

If using umi, first install the `@umijs/plugins` dependency, then enable through configuration.

```bash
$ pnpm i @umijs/plugins -D
```

```ts
export default {
  plugins: ['@umijs/plugins/dist/react-query'],
  reactQuery: {},
}
```

## Features

The plugin does a few things for you,

1. Enable react query's devtool in dev mode, which can be disabled with `reactQuery: { devtool: false }`, and the option is configured in app.ts through `export const reactQuery = { devtool }`.

2. Register a global QueryClient, which can be disabled with `reactQuery: { queryClient: false }`, and the option is configured in app.ts through `export const reactQuery = { queryClient }`.

3. Most of react-query's exports can be imported and used from `umi` or `@umijs/max`.

## Configuration

The following configurations can be done in `reactQuery`.

- `devtool`: boolean, whether to enable the official react query devtool, default `true`
- `queryClient`: boolean, whether to register a global QueryClient and QueryClientProvider, default `true`

For example:

```ts
export default {
  reactQuery: {
    devtool: false,
    queryClient: false,
  },
}
```

Note: The above two configurations need to be configured in `app.ts` at runtime.

## Runtime Configuration

Includes the following configurations.

- `devtool`: object
- `queryClient`: object

For example:

```ts
const API_SERVER = '/path/to/api/server';
export const reactQuery = {
  devtool: { 
    initialIsOpen: true,
  },
  queryClient: {
    defaultOptions: {
      queries: {
        queryFn: async ({ queryKey }) => {
          const res = await fetch(`${API_SERVER}/${queryKey.join('/')}`);
          if (res.status !== 200) {
            throw new Error(res.statusText);
          }
          return res.json();
        }
      }
    }
  },
};
```
