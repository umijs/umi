# react-query

@umijs/max comes with the [react-query](https://tanstack.com/query/) (same as @tanstack/react-query) data fetching solution.

## Activation

For @umijs/max, enable it through configuration.

```ts
export default {
  reactQuery: {},
}
```

If you are using Umi, first install the `@umijs/plugins` dependency and then activate it through configuration.

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

The plugin handles several tasks for you:

1. It enables the react-query devtool in development mode. You can disable it using `reactQuery: { devtool: false }`, and configure this option in `app.ts` using `export const reactQuery = { devtool }`.

2. It registers a global QueryClient. You can disable it using `reactQuery: { queryClient: false }`, and configure this option in `app.ts` using `export const reactQuery = { queryClient }`.

3. Most of the react-query exports can be imported and used from `umi` or `@umijs/max`.

## Configuration Options

You can configure the following options within `reactQuery`:

- `devtool`: boolean, whether to enable the official react-query devtool. Default is `true`.
- `queryClient`: boolean, whether to register the global QueryClient and QueryClientProvier. Default is `true`.

For example:

```ts
export default {
  reactQuery: {
    devtool: false,
    queryClient: false,
  },
}
```

Note: The runtime configurations for these two options should be done in `app.ts`.

## Runtime Configuration Options

Includes the following configurations:

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

