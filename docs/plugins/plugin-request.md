# @umijs/plugin-request


`@umijs/plugin-request` is based on [umi-request](https://github.com/umijs/umi-request) and [@umijs/hooks](https://github.com/umijs/hooks) `useRequest` provides a unified network request and error handling scheme.

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

If the backend interface specifications are not met, you can configure it by configuring `errorConfig.adaptor`. When `success` returns `false`, we will do a unified error prompt according to `showType` and` errorMessage` and throw an exception.

The format of the thrown exception is:

```typescript
interface RequestError extends Error {
  data?: any; // Here is the raw data returned by the backend
  info?: ErrorInfoStructure;
}
```

In addition, you can check if `Error.name` is` BizError` to determine if the error was thrown by `success` as` false`.

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

`dataField` corresponds to the data field in the unified interface format. For example, if the unified specification of the interface is `{ success: boolean, data: any }`, then no configuration is required, so that when you consume through `useRequest`, a default `FormatResult`, which directly returns the data in `data` for easy use. If your back-end interface does not conform to this specification, you can configure `dataField` yourself. When configured as `''` (empty string), no processing is performed.

### Runtime configuration

In `src/app.ts` you can configure some runtime configuration items to achieve some custom requirements. An example configuration is as follows:

```typescript
import { RequestConfig } from 'umi';

export const request: RequestConfig = {
  timeout: 1000,
  errorConfig: {},
  middlewares: [],
};
```

The configuration returns an object. Except for `errorConfig` and` middlewares`, other configurations are directly transparent to the global configuration of [umi-request](https://github.com/umijs/umi-request).

#### errorConfig.adaptor

When the back-end interface does not meet the specification, you need to convert the back-end interface data to this format through this configuration. This configuration is only used for error handling and does not affect the data format that is ultimately passed to the page.

An example configuration is as follows:

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

When `showType` is `9`, it will jump to `/exception` page by default. You can modify this path through this configuration.

#### middlewares

umi-request provides [Middleware Mechanism](https://github.com/umijs/umi-request#middleware), which was previously introduced through `request.use(middleware)`, and can now be accessed via `request.middlewares` Configure it.

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

This plug-in has [@umijs/use-request](https://hooks.umijs.org/en-US/async) built-in, and you can easily and conveniently consume data through this Hook in the component. Examples are:

```typescript
import { useRequest } from '@aipay/bigfish';
import services from '@/service/oneapidemo';
import { PageLoading } from '@alipay/tech-ui';

export default () => {
  const { data, error, loading } = useRequest(() => {
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

For more configuration, you can refer to the documentation of [@ umijs/use-request](https://hooks.umijs.org/zh-CN/async). Compared to `@ umijs/use-request` itself, `import { useRequest } from 'umi';` There are two differences:

- According to the interface request specification, `formatResult: res => res?.Data` is built in, so that you can use data more conveniently. Of course, you can also configure `formatResult` to override this built-in logic.
- Unified the error handling logic according to the interface error specification.

You can also check the Zhihu column ["useRequest - Ant Central Taiwan Standard Request Hooks"](https://zhuanlan.zhihu.com/p/106796295) for useRequest.

### request

With `import { request } from 'umi';` you can use the built-in request method. `request` takes two parameters, the first parameter is `url`, and the second parameter is the requested `options`. `options` specific format reference [umi-request](https://github.com/umijs/umi-request).

Most of the use of `request` is equivalent to `umi-request`. One difference is that `options` extends a configuration `skipErrorHandler`, which is set to `true` to skip the default error handling, which is used in some parts of the project Special interface.

Examples are:

```typescript
request('/api/user', {
  params: {
    name: 1,
  },
  skipErrorHandler: true,
})
```

### RequestConfig

This is a TypeScript definition that helps you better configure runtime configuration.

```typescript
import { RequestConfig } from 'umi';

export const request: RequestConfig = {};
```

### ErrorShowType

`import { ErrorShowType } from 'umi';` This is a TypeScript definition that defines the types of showType supported in the agreed format.

```typescript
export enum ErrorShowType {
  SILENT = 0, // No error
  WARN_MESSAGE = 1, // Warning message
  ERROR_MESSAGE = 2, // Error message prompt
  NOTIFICATION = 4, // Notification tips
  REDIRECT = 9, // Page jump
}
```
