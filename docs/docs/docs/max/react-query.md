---
order: 11
toc: content
---
# react-query

@umijs/max 内置了 [react-query](https://tanstack.com/query/)（和 @tanstack/react-query 是同一个）请求方案。

## 启用方式

如果是 @umijs/max，配置开启。

```ts
export default {
  reactQuery: {},
}
```

如果是 umi，先安装 `@umijs/plugins` 依赖，再通过配置开启。

```bash
$ pnpm i @umijs/plugins -D
```

```ts
export default {
  plugins: ['@umijs/plugins/dist/react-query'],
  reactQuery: {},
}
```

## 特性

插件帮你做了几件事，

1、dev 模式下开启 react query 的 devtool，可通过 `reactQuery: { devtool: false }` 关闭，选项在 app.ts 里通过 `export const reactQuery = { devtool }` 配置。

2、注册全局的 QueryClient，可通过 `reactQuery: { queryClient: false }` 关闭，选项在 app.ts 里通过 `export const reactQuery = { queryClient }` 配置。

3、大部分 react-query 的导出可以从 `umi` 或 `@umijs/max` 里 import 使用。

## 配置项

可以在 `reactQuery` 中做以下配置。

- `devtool`: boolean，是否开启 react query 官方 devtool 工具，默认 `true`
- `queryClient`: boolean, 是否注册全局的 QueryClient 和 QueryClientProvier，默认 `true`

比如：

```ts
export default {
  reactQuery: {
    devtool: false,
    queryClient: false,
  },
}
```

注：以上两个配置的运行时配置需在 `app.ts` 里进行配置。

## 运行时配置项

包含以下配置。

- `devtool`：object
- `queryClient`: object

比如：

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

