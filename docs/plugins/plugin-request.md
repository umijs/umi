---
translateHelp: true
---

# @umijs/plugin-request


`@umijs/plugin-request` is based on the ʻuseRequest` of [umi-request](https://github.com/umijs/umi-request) and [ahooks](http://ahooks.js.org/hooks) Provides a unified network request and error handling program.

## How to enable

Enabled by default.

## Introduction

Error handling is a problem that all projects will encounter. We have agreed on an interface format specification as follows:

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

If the back-end interface specifications are not met, you can configure ʻerrorConfig.adaptor` to adapt. When `success` returns `false`, we will follow `showType` and ʻerrorMessage` to make a unified error prompt and throw an exception.

The format of the thrown exception is:

```typescript
interface RequestError extends Error {
  data?: any; // Here is the original data returned by the backend
  info?: ErrorInfoStructure;
}
```

In addition, you can judge whether it is an error thrown by `success` as `false` by whether ʻError.name` is `BizError`.

## Configuration

### Build-time configuration

The currently supported build-time configurations are as follows:

```typescript
export default {
  request: {
    dataField: 'data',
  },
};
```

#### dataField

* Type: `string`

`dataField` corresponds to the data field in the unified format of the interface. For example, if the unified specification of the interface is `{ success: boolean, data: any}`, then there is no need to configure, so that when you consume it through ʻuseRequest`, a default will be generated `formatResult`, directly returns the data in `data` for easy use. If your backend interface does not comply with this specification, you can configure `dataField` yourself. When configured as `''` (empty string), no processing is performed.

### Runtime configuration

In `src/app.ts`, you can configure some runtime configuration items to achieve some custom requirements. The sample configuration is as follows:

```typescript
import { RequestConfig } from 'umi';

export const request: RequestConfig = {
  timeout: 1000,
  errorConfig: {},
  middlewares: [],
  requestInterceptors: [],
  responseInterceptors: [],
};
```

The configuration returns an object. Except for ʻerrorConfig` and `middlewares`, all other configurations are directly transparently transmitted [umi-request](https://github.com/umijs/umi-request) global configuration.

#### errorConfig.adaptor

When the back-end interface does not meet the specification, you need to use this configuration to convert the back-end interface data into this format. This configuration is only used for error handling and will not affect the data format that is finally delivered to the page.

The sample configuration is as follows:

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

When `showType` is `9`, it will jump to the `/exception` page by default, and you can modify the path through this configuration.

#### middlewares

umi-request provides [middleware mechanism](https://github.com/umijs/umi-request#middleware), which was previously introduced through `request.use(middleware)`, now it can be introduced through `request.middlewares` Configure it.

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

#### requestInterceptors

This configuration receives an array, and each item in the array is a request interceptor. It is equivalent to the `request.interceptors.request.use()` of umi-request. See the [Interceptor Document](https://github.com/umijs/umi-request#interceptor) of umi-request for details.

#### responseInterceptors

This configuration receives an array, and each item in the array is a response interceptor. It is equivalent to the `request.interceptors.response.use()` of umi-request. For details, see [Interceptor Document](https://github.com/umijs/umi-request#interceptor) of umi-request.

## API

### useRequest

The plug-in has a built-in [@ahooksjs/use-request](https://ahooks.js.org/zh-CN/hooks/async), and you can use this Hook in the component to consume data easily and conveniently. Examples are as follows:

```typescript
import { useRequest } from 'umi';

export default () => {
  const { data, error, loading } = useRequest(() => {
    return services.getUserList('/api/test');
  });
  if (loading) {
    return <div>loading...</div>;
  }
  if (error) {
    return <div>{error.message}</div>;
  }
  return <div>{data.name}</div>;
};
```

For more configuration, you can refer to the document of [@ahooksjs/use-request](https://ahooks.js.org/zh-CN/hooks/async). Compared with `@ahooksjs/use-request` itself, ʻimport {useRequest} from'umi';` There are three differences as follows:

-Built-in `formatResult: res => res?.data` according to the interface request specification allows you to use data more conveniently, of course, you can also configure `formatResult` yourself to override this built-in logic.
-Unify the error handling logic in accordance with the interface error specification.

It should be noted that the global configuration of useRequest, previously ʻimport {useAPIProvider} from'@umijs/use-request'`, is now revised to ʻimport {useRequestProvider} from'umi'`;

You can also check the Zhihu column article ["useRequest- Ant Central Taiwan Standard Request Hooks"] (https://zhuanlan.zhihu.com/p/106796295) to understand useRequest.

### request

With ʻimport {request} from'umi';` you can use the built-in request method. `request` receives two parameters, the first parameter is ʻurl`, the second parameter is the requested ʻoptions`. Refer to [umi-request](https://github.com/umijs/umi-request) for the specific format of ʻoptions`.

Most of the usage of `request` is equivalent to ʻumi-request`, one difference is that ʻoptions` extends a configuration `skipErrorHandler`, this configuration is `true` to skip the default error handling, and is used in the project Special interface.

Examples are as follows:

```typescript
request('/api/user', {
  params: {
    name: 1,
  },
  skipErrorHandler: true,
})
```

### RequestConfig

This is a TypeScript definition, which can help you better configure runtime configuration.

```typescript
import { RequestConfig } from 'umi';

export const request: RequestConfig = {};
```

### ErrorShowType

`import { ErrorShowType } from 'umi';` This is a TypeScript definition that defines the types of showType supported in the agreed format.

```typescript
export enum ErrorShowType {
  SILENT = 0, // No error prompt
  WARN_MESSAGE = 1, // Warning message prompt
  ERROR_MESSAGE = 2, // Error message prompt
  NOTIFICATION = 4, // notification prompt
  REDIRECT = 9, // page jump
}
```
