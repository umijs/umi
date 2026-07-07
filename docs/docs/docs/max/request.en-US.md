---
order: 6
toc: content
translated_at: '2024-03-17T08:46:03.932Z'
---

# Request

`@umijs/max` has built-in plugin solution. It offers a unified network request and error handling solution based on [axios](https://axios-http.com/) and ahooks' `useRequest` from [ahooks](https://ahooks-v2.surge.sh).

```js
import { request, useRequest } from 'umi';

request;
useRequest;
```

## Configuration
### Build-time configuration
```js
export default {
  request: {
    dataField: 'data'
  },
};
```

Build-time configuration allows configuring `dataField` for useRequest, with its default being `data`. This setting primarily facilitates direct data consumption by useRequest. If you wish to access the raw data returned by the backend when consuming data, configure `dataField` to `''` here.

For example, if your backend returns data in the following format.

```js
{
  success: true,
  data: 123,
  code: 1,
}
```

Then useRequest can directly consume the `data`, which would be 123, instead of `{ success, data, code }`.

### Runtime configuration

In `src/app.ts`, you can customize the request settings for your project by configuring the request item.

```ts
import type { RequestConfig } from 'umi';

export const request: RequestConfig = {
  timeout: 1000,
  // other axios options you want
  errorConfig: {
    errorHandler(){
    },
    errorThrower(){
    }
  },
  requestInterceptors: [],
  responseInterceptors: []
};
```

Besides `errorConfig`, `requestInterceptors`, and `responseInterceptors`, other configurations are directly passed through to [axios](https://axios-http.com/docs/req_config)'s request configuration. **The rules configured here apply to all** `request` and `useRequest` **methods**.

The runtime configuration options of `plugin-request` are introduced below. At the end of this section, we will provide a complete runtime configuration example, describing its functionality in detail.

#### errorConfig
If you want to set a unified error handling scheme for your requests, you can configure it here.

`errorThrower` takes the data returned by your backend and needs to throw an error you define. You can process the backend data here as needed.

Our `request` will catch the error thrown by `errorThrower` and execute your `errorHandler` method, which accepts two arguments. The first argument is the caught error, and the second argument is the request's opts.

`errorHandler` and `errorThrower` need to be used together. A complete example is provided at the end of the document.

If you find this way of error handling too complicated, you can directly implement your error handling in the interceptors.

:::info{title=🚨}
`errorThrower` is implemented using `responseInterceptors`, triggered when `data.success` is `false`.
:::

#### requestInterceptors
Add request phase interceptors to the request method.

Pass in an array where each element is an interceptor. They will be registered on the axios instance in order. The syntax for writing interceptors is consistent with axios request interceptor. It needs to take the request config as an argument and return it.

We recommend using `RequestConfig`, which helps you write your interceptors in a standardized manner.

e.g.
```ts
const request: RequestConfig = {
  requestInterceptors: [
    // directly write a function as an interceptor
    (url, options) =>
      {
        // do something
        return { url, options }
      },
    // a tuple, the first element is the request interceptor, the second is the error handler
    [(url, options) => {return { url, options }}, (error) => {return Promise.reject(error)}],
    // array, omitting error handler
    [(url, options) => {return { url, options }}]
  ]

}
```

Furthermore, to better accommodate umi-request, we allow umi-request interceptor syntax, even though it might not pass TypeScript's syntax check.

#### responseInterceptors
Add response phase interceptors to the request method.

Pass in an array where each element is an interceptor. They will be registered on the axios instance in order. The syntax for writing interceptors is consistent with axios response interceptor. It takes the axios response as an argument and returns it.

We recommend using `RequestConfig`, which helps you write your interceptors in a standardized manner.

e.g.
```ts
const request: RequestConfig = {
  responseInterceptors: [
    // directly write a function as an interceptor
    (response) =>
      {
        // No need for asynchronous processing to read response body content, can directly read from data, some fields can be found in the config
        const { data = {} as any, config } = response;
        // do something
        return response
      },
    // a tuple, the first element is the request interceptor, the second is the error handler
    [(response) => {return response}, (error) => {return Promise.reject(error)}],
    // array, omitting error handler
    [(response) => {return response}]
  ]

}
```

**Note: We will register interceptors according to your array sequence, but their execution order follows axios's convention, with request interceptors added later executing first, and response interceptors added later executing last**

## API
### useRequest
The plugin has built-in [@ahooksjs/useRequest](https://ahooks-v2.js.org/hooks/async), allowing you to consume data simply and conveniently within components. The example is as follows:
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
In the above code, `data` is not the data returned by your backend, but its internal `data`, (because the default build-time configuration is 'data')

It should be noted that ahooks has been updated to 3.0, but for making it less difficult for `umi@3` projects to upgrade, we continued to use ahooks 2.0


### request
By `import { request } from '@@/plugin-request'`, you can use the built-in request method.

`request` accepts `options` in addition to passing through all of [axios](https://axios-http.com/docs/req_config)'s config, we also added a few extra attributes `skipErrorHandler`, `getResponse`, `requestInterceptors` and `responseInterceptors`.

The example is as follows:
```typescript
request('/api/user', {
  params: { name : 1 },
  timeout: 2000,
  // other axios options
  skipErrorHandler: true,
  getResponse: false,
  requestInterceptors: [],
  responseInterceptors: [],
}
```

When you want a particular request to skip error handling, you can achieve this by setting `skipErrorHandler` to `true`.

request returns the data from your backend by default, if you wish to receive the complete response structure from axios, it can be achieved by passing `{ getResponse: true }`.

`requestInterceptors` and `responseInterceptors` are written in the same way as the interceptors in runtime configuration, but the difference is that the interceptors registered here are "one-off". Furthermore, the interceptors written here will be registered after those in the runtime configuration.

**Note: When you have used errorHandler, the response interceptors registered here will be ineffective, because errorHandler will throw error**

### RequestConfig
This is an interface definition that can help you better configure runtime settings.
```typescript
import type { RequestConfig } from 'umi';

export const request:RequestConfig = {};
```
Note that you should add type when importing

## Cancel request
Cancel the request using the fetch API method -- `AbortController`.

```tsx
import { request } from '@umijs/max';
import { Button } from 'antd';

const controller = new AbortController();

const HomePage: React.FC = () => {
  const fetchData = async () => {
    const res = await request('/api/getData', {
      method: 'GET',
      signal: controller.signal
    })
  }

  const cancelData = () => {
    controller.abort();
  }
  return (
    <>
      <Button onClick={fetchData}>send request</Button>
      <Button onClick={cancelData}>cancel request</Button>
    </>
  );
};

export default HomePage;
```

## umi@3 to umi@4
In the upgrade from `umi@3` to `umi@4`, we discontinued umi-request and chose axios as the default request solution. Some functionality changes occurred in this switch.

### Changes in runtime configuration
Compared to `umi@3`, `umi@4`'s runtime configuration has undergone significant changes.
```diff
    export const request: RequestConfig = {
      errorConfig: {
++      errorHandler: () => {},
++      errorThrower: () => {}
--      errorPage: '',
--      adaptor: ()=>{},
      };
--    middlewares: [],
++    requestInterceptors: [],
++    responseInterceptors: [],
      ... // Differences between umi-request and axios.
    };
```

- umi-request's configuration items have become axios's configuration items.
- Removed the middlewares middleware. You can use axios's [interceptors](https://axios-http.com/docs/interceptors) to achieve the same functionality.
- errorConfig removed all original settings, adding errorHandler and errorThrower for unified error handling settings.

Replacing middleware. For a `umi@3` middleware, content before the `next()` method should be placed in `requestInterceptors`, while content after the `next()` method should be placed in `responseInterceptors`.

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

// Interceptor
{
  requestInterceptors:[
    (config) => {
      if (config.url.indexOf('/api') !== 0) {
        config.url = `/api/v1/${url}`;
      }
      return config;
    }
  ],
  responseInterceptors: [
  (response) => {
    if(!response.data.success){
      // do something
    }
  }
  ]
}
```

### Changes in request method parameters
[umi-request](https://github.com/umijs/umi-request#request-options) and [axios](https://axios-http.com/docs/req_config) have some differences in configuration items. You can compare them by referring to their respective documentation.

### GET request parameter serialization

[Umi@3](https://github.com/umijs/umi-request/blob/master/src/middleware/simpleGet.js) uses the same Key to serialize arrays by default. Umi@4 requests based on axios, by default, serialize in the form with brackets `[]`.

```tsx
// Umi@3
import { useRequest } from 'umi';
// a: [1,2,3] => a=1&a=2&a=3

// Umi@4
import { useRequest } from '@umijs/max';
// a: [1,2,3] => a[]=1&a[]=2&a[]=3
```

If you wish to maintain the Umi@3 form, you can do so:

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

## Runtime configuration example
Here's a complete example of runtime configuration, to help you better customize the request scheme for your project.

```ts
import { RequestConfig } from './request';

// Error handling scheme: Error types
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// Response data structure agreed with the backend
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

// Runtime configuration
export const request: RequestConfig = {
  // Unified request settings
  timeout: 1000,
  headers: {'X-Requested-With': 'XMLHttpRequest'},

  // Error handling: umi@3's error handling scheme.
  errorConfig: {
    // Error throwing
    errorThrower: (res: ResponseStructure) => {
      const { success, data, errorCode, errorMessage, showType } = res;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // Throw custom error
      }
    },
    // Error catching and handling
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // The errors thrown by our errorThrower.
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
        // The request was made, and the server responded with a status code that falls out of the range of 2xx
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        // \`error.request\` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        message.error('None response! Please retry.');
      } else {
        // Something happened in setting up the request that triggered an error
        message.error('Request error, please retry.');
      }
    },

  },

  // Request interceptors
  requestInterceptors: [
    (config) => {
    // Intercept request configurations for personalized processing.
      const url = config.url.concat('?token = 123');
      return { ...config, url};
    }
  ],

  // Response interceptors
  responseInterceptors: [
    (response) => {
       // Intercept the response data for personalized processing
       const { data } = response;
       if(!data.success){
         message.error('Request failed!');
       }
       return response;
    }
  ]
};
```

The above example's error handling scheme is derived from `umi@3`'s built-in error handling. In this version, we removed it to allow users greater freedom in customizing their error handling schemes. If you still want to use it, you can paste this runtime configuration into your project.

You can also write your own error handling through response interceptors, **not limited to errorConfig**.
