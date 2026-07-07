---
order: 6
toc: content
---

# 请求

`@umijs/max` 内置了插件方案。它基于 [axios](https://axios-http.com/) 和 [ahooks](https://ahooks-v2.surge.sh) 的 `useRequest` 提供了一套统一的网络请求和错误处理方案。

```js
import { request, useRequest } from 'umi';

request;
useRequest;
```

## 配置
### 构建时配置
```js
export default {
  request: {
    dataField: 'data'
  },
};
```

构建时配置可以为 useRequest 配置 `dataField` ，该配置的默认值是 `data`。该配置的主要目的是方便 useRequest 直接消费数据。如果你想要在消费数据时拿到后端的原始数据，需要在这里配置 `dataField` 为 `''` 。

比如你的后端返回的数据格式如下。

```js
{
  success: true,
  data: 123,
  code: 1,
}
```

那么 useRequest 就可以直接消费 `data`。其值为 123，而不是 `{ success, data, code }` 。

### 运行时配置

在 `src/app.ts` 中你可以通过配置 request 项，来为你的项目进行统一的个性化的请求设定。

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

除了 `errorConfig`, `requestInterceptors`, `responseInterceptors` 以外其它配置都直接透传 [axios](https://axios-http.com/docs/req_config) 的 request 配置。**在这里配置的规则将应用于所有的** `request` 和 `useRequest` **方法**。

下面分别介绍 `plugin-request` 的运行时配置项。本节的末尾，我们会给出一个完整的运行时配置示例，并且对它的功能进行一个详细的描述。

#### errorConfig
如果你想要为自己的请求设定统一的错误处理方案，可以在这里进行配置。

其中 `errorThrower` 接收你后端返回的数据并且需要抛出一个你自己设定的 error， 你可以在这里根据后端的数据进行一定的处理。

我们的 `request` 会 catch `errorThrower` 抛出的错误，并且执行你的 `errorHandler` 方法，该方法接收两个参数，第一个参数是 catch 到的 error，第二个参数则是 request 的 opts。

这里面的 `errorHandler` 和 `errorThrower` 需要配套使用。文档的末尾有一个完整的例子。

如果你觉得这种方式进行错误处理过于繁琐，可以直接在拦截器中实现自己的错误处理。

:::info{title=🚨}
`errorThrower` 是利用 `responseInterceptors` 实现的，它的触发条件是: 当 `data.success` 为 `false` 时。
:::

#### requestInterceptors
为 request 方法添加请求阶段的拦截器。

传入一个数组，每个元素都是一个拦截器，它们会被按顺序依次注册到 axios 实例上。拦截器的写法同 axios request interceptor 一致，它需要接收 request config 作为参数，并且将它返回。

我们建议你使用 `RequestConfig`，它能帮助你规范地书写你的拦截器。

e.g.
```ts
const request: RequestConfig = {
  requestInterceptors: [
    // 直接写一个 function，作为拦截器
    (url, options) =>
      {
        // do something
        return { url, options }
      },
    // 一个二元组，第一个元素是 request 拦截器，第二个元素是错误处理
    [(url, options) => {return { url, options }}, (error) => {return Promise.reject(error)}],
    // 数组，省略错误处理
    [(url, options) => {return { url, options }}]
  ]

}
```

另外，为了更好的兼容 umi-request，我们允许 umi-request 的拦截器写法，尽管它不能够通过 typescript 的语法检查。

#### responseInterceptors
为 request 方法添加响应阶段的拦截器。

传入一个数组，每个元素都是一个拦截器，它们会被按顺序依次注册到 axios 实例上。拦截器的写法同 axios response interceptor一致。接收 axios 的 response 作为参数，并且将它返回。

我们建议你使用 `RequestConfig`，它能帮助你规范地书写你的拦截器。

e.g.
```ts
const request: RequestConfig = {
  responseInterceptors: [
    // 直接写一个 function，作为拦截器
    (response) =>
      {
        // 不再需要异步处理读取返回体内容，可直接在data中读出，部分字段可在 config 中找到
        const { data = {} as any, config } = response;
        // do something
        return response
      },
    // 一个二元组，第一个元素是 request 拦截器，第二个元素是错误处理
    [(response) => {return response}, (error) => {return Promise.reject(error)}],
    // 数组，省略错误处理
    [(response) => {return response}]
  ]

}
```

**注意： 我们会按照你的数组顺序依次注册拦截器，但是其执行顺序参考 axios，request 是后添加的在前，response 是后添加的在后**

## API
### useRequest
插件内置了 [@ahooksjs/useRequest](https://ahooks-v2.js.org/hooks/async) ，你可以在组件内通过该 Hook 简单便捷的消费数据。示例如下：
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
上面代码中 data 并不是你后端返回的数据，而是其内部的 data，（因为构建时配置默认是 'data')

需要注意的是，ahooks 已经更新到3.0，而我们为了让 `umi@3` 的项目升级起来不那么困难，继续沿用了 ahooks2.0


### request
通过 `import { request } from '@@/plugin-request'` 你可以使用内置的请求方法。

`request` 接收的 `options`除了透传 [axios](https://axios-http.com/docs/req_config) 的所有 config 之外，我们还额外添加了几个属性 `skipErrorHandler`，`getResponse`，`requestInterceptors` 和 `responseInterceptors` 。

示例如下：
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

当你的某个请求想要跳过错误处理时，可以通过将`skipErrorHandler`设为 `true` 来实现

request 默认返回的是你后端的数据，如果你想要拿到 axios 完整的 response 结构，可以通过传入 `{ getResponse: true }` 来实现。

`requestInterceptors` 和 `responseInterceptors` 的写法同运行时配置中的拦截器写法相同，它们为 request 注册拦截器。区别在于这里注册的拦截器是 "一次性" 的。另外，这里写的拦截器会在运行时配置中的拦截器之后被注册。

**注意： 当你使用了 errorHandler 时，在这里注册的 response 拦截器会失效，因为在 errorHandler 就会 throw error**

### RequestConfig
这是一个接口的定义，可以帮助你更好地配置运行时配置。
```typescript
import type { RequestConfig } from 'umi';

export const request:RequestConfig = {};
```
注意，在导入时要加 type

## 取消请求
使用 fetch API 方式 -- `AbortController` 取消请求。

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

## umi@3 到 umi@4
在 `umi@3` 到 `umi@4` 的升级中，我们弃用了 umi-request ，选用了 axios 作为默认的请求方案。在这个更换中，我们的功能也发生了一些变化。

### 运行时配置的变动
相比于 `umi@3`， `umi@4` 的运行时配置发生了较大的变化。
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
      ... // umi-request 和 axios 的区别。
    };
```

- umi-request 的配置项变成了 axios 的配置项
- 去除了 middlewares 中间件。你可以使用 axios 的 [拦截器](https://axios-http.com/docs/interceptors) 来实现相同的功能。
- errorConfig 删除了原来的所有配置，新增了 errorHandler 和 errorThrower 来进行统一错误处理的设定。

中间件的替换方式。对于一个 `umi@3` 的中间件，`next()` 方法之前的需要放在 `requestInterceptors` 中，`next()` 方法之后的内容则需要放在 `responseInterceptors` 中。

```ts

// 中间件
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

// 拦截器
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

### request 方法的参数变动
[umi-request](https://github.com/umijs/umi-request#request-options) 和 [axios](https://axios-http.com/docs/req_config) 的配置项有着一定的区别。具体可以查看其各自的文档进行比较。

### GET 请求参数序列化

[Umi@3](https://github.com/umijs/umi-request/blob/master/src/middleware/simpleGet.js) 默认会用相同的 Key 来序列化数组。Umi@4 请求基于 axios，默认是带括号 `[]` 的形式序列化。

```tsx
// Umi@3
import { useRequest } from 'umi';
// a: [1,2,3] => a=1&a=2&a=3

// Umi@4
import { useRequest } from '@umijs/max';
// a: [1,2,3] => a[]=1&a[]=2&a[]=3
```

如果希望保持 Umi@3 这种形式，可以这样做：

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

## 运行时配置示例
这里给出一个完整的运行时配置示例，以帮助你能够更好的去为自己的项目设定个性化的请求方案。

```ts
import { RequestConfig } from './request';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

// 运行时配置
export const request: RequestConfig = {
  // 统一的请求设定
  timeout: 1000,
  headers: {'X-Requested-With': 'XMLHttpRequest'},

  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res: ResponseStructure) => {
      const { success, data, errorCode, errorMessage, showType } = res;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
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
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },

  },

  // 请求拦截器
  requestInterceptors: [
    (config) => {
    // 拦截请求配置，进行个性化处理。
      const url = config.url.concat('?token = 123');
      return { ...config, url};
    }
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
       // 拦截响应数据，进行个性化处理
       const { data } = response;
       if(!data.success){
         message.error('请求失败！');
       }
       return response;
    }
  ]
};
```

上面的例子中的错误处理方案来自于 `umi@3` 的内置错误处理。在这个版本中，我们把它删除了，以方便用户更加自由地定制错误处理方案。如果你仍然想要使用它，可以将这段运行时配置粘贴到你的项目中。

你也可以通过写响应拦截器的方式来进行自己的错误处理，**不一定局限于 errorConfig**。
