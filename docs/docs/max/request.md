import { Message } from 'umi';

# Requests

`@umijs/max` comes with built-in plugins. It provides a unified network request and error handling solution based on [axios](https://axios-http.com/) and [ahooks](https://ahooks-v2.surge.sh)'s `useRequest`.

```js
import { request, useRequest } from 'umi';

request;
useRequest;
```

## Configuration

### Build-time Configuration
```js
export default {
  request: {
    dataField: 'data'
  },
};
```

Build-time configuration can set the `dataField` for useRequest. The default value is `data`. The primary purpose of this configuration is to allow useRequest to consume data directly. If you want to access the original backend data when consuming data, you need to configure `dataField` as `''` here.

For example, if your backend returns data in the following format:

```js
{
  success: true,
  data: 123,
  code: 1,
}
```

Then useRequest can directly consume `data`. Its value will be 123, rather than `{ success, data, code }`.

### Runtime Configuration

In `src/app.ts`, you can configure the `request` item to provide consistent personalized request settings for your project.

```ts
import type { RequestConfig } from 'umi';

export const request: RequestConfig = {
  timeout: 1000,
  // other axios options you want
  errorConfig: {
    errorHandler() {
    },
    errorThrower() {
    }
  },
  requestInterceptors: [],
  responseInterceptors: []
};
```

Except for `errorConfig`, `requestInterceptors`, and `responseInterceptors`, other configurations are directly passed through to axios's request configuration. The rules configured here will apply to all `request` and `useRequest` methods.

Below, we'll discuss the runtime configuration options for the `plugin-request`. At the end of this section, we'll provide a complete runtime configuration example and provide a detailed explanation of its functionality.

#### errorConfig
If you want to establish a unified error handling solution for your requests, you can configure it here.

The `errorThrower` takes the data returned by your backend and should throw an error that you define. You can process the backend data accordingly.

Our `request` will catch errors thrown by the `errorThrower` and execute your `errorHandler` function. This function receives two parameters: the caught error and the `opts` of the request.

The `errorHandler` and `errorThrower` need to be used together. A complete example is provided at the end of the documentation.

If you find this error handling method too cumbersome, you can directly implement your own error handling in interceptors.

<Message emoji="🚨" >
`errorThrower` is implemented using `responseInterceptors`, and it is triggered when `data.success` is `false`.
</Message>

#### requestInterceptors
Add request interceptors for the `request` method.

Pass an array where each element is an interceptor. They will be registered on the axios instance in order. The format of interceptors is the same as axios request interceptors. They should accept the request config as a parameter and return it.

We recommend using `RequestConfig` to write your interceptors properly.

e.g.
```ts
const request: RequestConfig = {
  requestInterceptors: [
    // Write a function directly as an interceptor
    (url, options) =>
      {
        // do something
        return { url, options }
      },
    // A tuple where the first element is the request interceptor and the second is an error handler
    [(url, options) => {return { url, options }}, (error) => {return Promise.reject(error)}],
    // Array, omitting the error handler
    [(url, options) => {return { url, options }}]
  ]

}
```

Additionally, for better compatibility with umi-request, we allow the umi-request interceptor syntax here, even though it may not pass TypeScript's syntax check.

#### responseInterceptors
Add response interceptors for the `request` method.

Pass an array where each element is an interceptor. They will be registered on the axios instance in order. The format of interceptors is the same as axios response interceptors. They should accept axios's response as a parameter and return it.

We recommend using `RequestConfig` to write your interceptors properly.

e.g.
```ts
const request: RequestConfig = {
  responseInterceptors: [
    // Write a function directly as an interceptor
    (response) =>
      {
        // You no longer need to asynchronously process the response body, you can directly read it from `data`, and some fields can be found in `config`
        const { data = {} as any, config } = response;
        // do something
        return response
      },
    // A tuple where the first element is the response interceptor and the second is an error handler
    [(response) => {return response}, (error) => {return Promise.reject(error)}],
    // Array, omitting the error handler
    [(response) => {return response}]
  ]

}
```

**Note: We will register interceptors in the order of your array, but their execution order follows axios's behavior – request interceptors added later will be executed first, while response interceptors added later will be executed last.**

## API
### useRequest
The plugin includes [@ahooksjs/useRequest](https://ahooks-v2.js.org/hooks/async). You can easily consume data in components using this hook. Here's an example:

```typescript
import { useRequest } from 'umi';

export default function Page() {
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

In the above code, `data` is not the data returned by your backend, but the internal `data` of the hook (due to the default `dataField` set in build-time configuration).

Please note that ahooks has been updated to version 3.0. However, we've continued using ahooks 2.0 to make upgrading `umi@3` projects to `umi@4` easier.

### request
You can use the built-in request method by importing `request` from `'@@/plugin-request'`.

`request` accepts `options` in addition to passing through all axios config. We've also added several additional properties: `skipErrorHandler`, `getResponse`, `requestInterceptors`, and `responseInterceptors`.

Here's an example:

```typescript
request('/api/user', {
  params: { name: 1 },
  timeout: 2000,
  // other axios options
  skipErrorHandler: true,
  getResponse: false,
  requestInterceptors: [],
  responseInterceptors: [],
});
```

You can set `skipErrorHandler` to `true` if you want to skip error handling for a specific request.

By default, `request` returns the data from your backend. If you want to get

 the complete axios response structure, you can pass `{ getResponse: true }`.

The syntax for `requestInterceptors` and `responseInterceptors` is the same as the interceptors in runtime configuration. These interceptors are registered for a single request only. Also, interceptors registered here will be executed after the interceptors from the runtime configuration.

**Note: When you use an `errorHandler`, response interceptors registered here will be ineffective because the errorHandler will throw an error.**

### RequestConfig
This is the interface definition that helps you properly configure the runtime configuration.

```typescript
import type { RequestConfig } from 'umi';

export const request: RequestConfig = {};
```

Note that you need to use `type` when importing it.

## Transition from umi@3 to umi@4
During the transition from `umi@3` to `umi@4`, we've deprecated umi-request and adopted axios as the default request solution. This change has resulted in some differences in functionality.

### Changes to Runtime Configuration
Compared to `umi@3`, the runtime configuration in `umi@4` has undergone significant changes:

```diff
export const request: RequestConfig = {
  errorConfig: {
++  errorHandler: () => {},
++  errorThrower: () => {}
--  errorPage: '',
--  adaptor: () => {},
  };
--middlewares: [],
++requestInterceptors: [],
++responseInterceptors: [],
  ... // Differences between umi-request and axios.
};
```

- umi-request configurations have become axios configurations.
- The `middlewares` middleware has been removed. You can use axios [interceptors](https://axios-http.com/docs/interceptors) to achieve the same functionality.
- The `errorConfig` has removed previous configurations and added `errorHandler` and `errorThrower` for unified error handling settings.

To replace middleware, for a middleware used in `umi@3`, content before the `next()` function should be placed in `requestInterceptors`, and content after `next()` should be placed in `responseInterceptors`.

```ts
// Middleware
async function middleware(ctx, next) {
  const { url, options } = req;
  if (url.indexOf('/api') !== 0) {
    ctx.req.url = `/api/v1/${url}`;
  }
  await next();
  if (!ctx.res.success) {
    // do something
  }
}

// Interceptors
{
  requestInterceptors: [
    (config) => {
      if (config.url.indexOf('/api') !== 0) {
        config.url = `/api/v1/${url}`;
      }
      return config;
    }
  ],
  responseInterceptors: [
    (response) => {
      if (!response.data.success) {
        // do something
      }
    }
  ]
}
```

### Changes to the `request` Method Parameters
The configuration options for [umi-request](https://github.com/umijs/umi-request#request-options) and [axios](https://axios-http.com/docs/req_config) are slightly different. You can compare their respective documentation for details.

Sure, here's the translation of the additional content you provided:

```markdown
### Serialization of GET Request Parameters

[Umi@3](https://github.com/umijs/umi-request/blob/master/src/middleware/simpleGet.js) serializes arrays with the same key. In Umi@4, requests are based on axios and use parentheses `[]` to serialize arrays by default.

```tsx
// Umi@3
import { useRequest } from 'umi';
// a: [1,2,3] => a=1&a=2&a=3

// Umi@4
import { useRequest } from '@umijs/max';
// a: [1,2,3] => a[]=1&a[]=2&a[]=3
```

If you want to maintain the Umi@3 serialization format, you can do it like this:

```ts
// src/app.[ts|tsx]

/** @doc https://github.com/sindresorhus/query-string#arrayformat-1 */
+ import queryString from 'query-string';

export const request: RequestConfig = {
+  paramsSerializer(params) {
+    return queryString.stringify(params);
+  },
   ...
}
```

## Example of Runtime Configuration
Here's a complete example of runtime configuration to help you better customize the request settings for your project.

```ts
import { RequestConfig } from './request';

// Error handling solution: error types
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// Response data format agreed upon with the backend
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

// Runtime configuration
export const request: RequestConfig = {
  // Uniform request settings
  timeout: 1000,
  headers: {'X-Requested-With': 'XMLHttpRequest'},

  // Error handling: Umi@3 error handling solution.
  errorConfig: {
    // Error thrower
    errorThrower: (res: ResponseStructure) => {
      const { success, data, errorCode, errorMessage, showType } = res;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // Throw a custom error
      }
    },
    // Error receiver and handler
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // Our errorThrower-generated error.
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warn(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios error
        // The request was successfully sent and the server responded with a status code, but the status code is outside the 2xx range
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // The request was successfully sent, but no response was received
        // \`error.request\` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in Node.js
        message.error('None response! Please retry.');
      } else {
        // Something went wrong while sending the request
        message.error('Request error, please retry.');
      }
    },

  },

  // Request interceptors
  requestInterceptors: [
    (config) => {
    // Intercept request configuration for individualized processing.
      const url = config.url.concat('?token = 123');
      return { ...config, url};
    }
  ],

  // Response interceptors
  responseInterceptors: [
    (response) => {
       // Intercept response data for individualized processing
       const { data } = response;
       if(!data.success){
         message.error('Request failed!');
       }
       return response;
    }
  ]
};
```

The error handling solution in the example above comes from `umi@3`'s built-in error handling. In this version, we removed it to allow users more freedom in customizing error handling solutions. If you still want to use it, you can paste this runtime configuration into your project.

You can also implement your own error handling by writing response interceptors, **not limited to errorConfig**.
```
