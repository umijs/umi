---
translateHelp: true
---

# @umijs/plugin-request


`@umijs/plugin-request` 基于 [umi-request](https://github.com/umijs/umi-request) 和 [@umijs/hooks](https://github.com/umijs/hooks) 的 `useRequest` 提供了一套统一的网络请求和错误处理方案。

## 启用方式

默认启用。

## 介绍

错误处理是所有项目都会遇到的问题，我们约定了一个接口格式规范如下：

```typescript
interface ErrorInfoStructure {
  success: boolean; // if request is success
  data?: any; // response data
  errorCode?: string; // code for errorType
  errorMessage?: string; // message display to user 
  showType?: number; // error display type： 0 silent; 1 message.warn; 2 message.error; 4 notification; 9 page
  traceId?: string; // Convenient for back-end Troubleshooting: unique request ID
  host?: string; // onvenient for backend Troubleshooting: host of current access server
}
```

后端接口规范不满足的情况下你可以通过配置 `errorConfig.adaptor` 来做适配。当 `success` 返回是 `false` 的情况我们会按照 `showType` 和 `errorMessage` 来做统一的错误提示，同时抛出一个异常。

抛出的异常的格式为：

```typescript
interface RequestError extends Error {
  data?: any; // 这里是后端返回的原始数据
  info?: ErrorInfoStructure;
}
```

另外你可以通过 `Error.name` 是否是 `BizError` 来判断是否是因为 `success` 为 `false` 抛出的错误。

## 配置

### 构建时配置

当前支持的构建时配置如下：

```typescript
export default {
  request: {
    dataField: 'data',
  },
};
```

#### dataField

* Type: `string`

`dataField` 对应接口统一格式中的数据字段，比如接口如果统一的规范是 `{ success: boolean, data: any}` ，那么就不需要配置，这样你通过 `useRequest` 消费的时候会生成一个默认的 `formatResult`，直接返回 `data` 中的数据，方便使用。如果你的后端接口不符合这个规范，可以自行配置 `dataField` 。配置为 `''` （空字符串）的时候不做处理。

### 运行时配置

在 `src/app.ts` 中你可以配置一些运行时的配置项来实现部分自定义需求。示例配置如下：

```typescript
import { RequestConfig } from 'umi';

export const request: RequestConfig = {
  timeout: 1000,
  errorConfig: {},
  middlewares: [],
};
```

该配置返回一个对象。除了 `errorConfig` 和 `middlewares` 以外其它配置都是直接透传 [umi-request](https://github.com/umijs/umi-request) 的全局配置。

#### errorConfig.adaptor

当后端接口不满足该规范的时候你需要通过该配置把后端接口数据转换为该格式，该配置只是用于错误处理，不会影响最终传递给页面的数据格式。

示例配置如下：

```typescript
import { RequestConfig } from 'umi';

export const request: RequestConfig = {
  errorConfig: {
    adaptor: (resData) => {
      return {
        ...resData,
        success: resData.ok,
        errorMessage: resData.message,
      };
    },
  },
};
```

#### errorConfig.errorPage

当 `showType` 为 `9` 时，默认会跳转到 `/exception` 页面，你可以通过该配置来修改该路径。

#### middlewares

umi-request 提供[中间件机制](https://github.com/umijs/umi-request#middleware)，之前是通过 `request.use(middleware)` 的方式引入，现在可以通过 `request.middlewares` 进行配置。

```typescript
export const request = {
  middlewares: [
    async function middlewareA(ctx, next) {
      console.log('A before');
      await next();
      console.log('A after');
    },
    async function middlewareB(ctx, next) {
      console.log('B before');
      await next();
      console.log('B after');
    }
  ]
}
```

## API

### useRequest

该插件内置了 [@umijs/use-request](https://hooks.umijs.org/zh-CN/async)，你可以在组件内通过该 Hook 简单便捷的消费数据。示例如下：

```typescript
import { useRequest } from '@aipay/bigfish';
import services from '@/service/oneapidemo';
import { PageLoading } from '@alipay/tech-ui';

export default () => {
  const { data, error, loading } = useAPI(() => {
    return services.getUserList({
      type: 'testtype',
    }, {
      // request options
    });
  });
  if (loading) {
    return <PageLoading />;
  }
  if (error) {
    return <div>{error.message}</div>;
  }
  return <div>{data.name}</div>;
};
```

更多配置你可以参考  [@umijs/use-request](https://hooks.umijs.org/zh-CN/async) 的文档，相比  `@umijs/use-request` 本身， `import { useRequest } from 'umi';` 有如下两点差异：

- 按照接口请求规范内置了 `formatResult: res => res?.data` 让你可以更方便的使用数据，当然你也可以自己配置 `formatResult` 来覆盖内置的这个逻辑。
- 按照接口错误规范统一了错误处理逻辑。

你也可以查看知乎专栏文章[《useRequest- 蚂蚁中台标准请求 Hooks》](https://zhuanlan.zhihu.com/p/106796295)了解 useRequest。

### request

通过 `import { request } from 'umi';` 你可以使用内置的请求方法。 `request` 接收两个参数，第一个参数是 `url`，第二个参数是请求的 `options`。`options` 具体格式参考 [umi-request](https://github.com/umijs/umi-request)。

`request` 的大部分用法等同于 `umi-request`，一个不同的是 `options` 扩展了一个配置 `skipErrorHandler`，该配置为 `true` 是会跳过默认的错误处理，用于项目中部分特殊的接口。

示例如下：

```typescript
request('/api/user', {
  params: {
    name: 1,
  },
  skipErrorHandler: true,
})
```

### RequestConfig

这是一个 TypeScript 定义，它可以帮助你更好的配置运行时配置。

```typescript
import { RequestConfig } from 'umi';

export const request: RequestConfig = {};
```

### ErrorShowType

`import { ErrorShowType } from 'umi';` 这是一个 TypeScript 定义，定义了约定的格式中支持的 showType 的类型。

```typescript
export enum ErrorShowType {
  SILENT = 0, // 不提示错误
  WARN_MESSAGE = 1, // 警告信息提示
  ERROR_MESSAGE = 2, // 错误信息提示
  NOTIFICATION = 4, // 通知提示
  REDIRECT = 9, // 页面跳转
}
```
