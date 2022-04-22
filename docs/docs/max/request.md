[umi@4 plugin-request 文档.md](https://github.com/umijs/umi-next/files/7749383/umi%404.plugin-request.md)

---

`umi@4 plugin-request` 基于 [axios](https://axios-http.com/) 和 [ahooks](https://ahooks-v2.surge.sh) 的 useRequest 提供了一套统一的网络请求和错误处理方案。<br />​<br />
## 启用方式
配置启用

## 介绍
`plugin-request` 提供了一套统一的网络请求和错误处理方案。可以通过 `import { useRequest, request } from '@@/plugin-request'` 来直接引入，其中 [useRequest](https://ahooks-v2.surge.sh/hooks/async) 是由 ahooks 提供的 hook（这里为了同 umi3 适配，沿用了2.0版本），需要在 React 的 Functional Component 中使用；request 方法是对 axios 的 axios.request 方法的一层封装，其接收两个参数，第一个参数为 url, 第二个参数是 axios 的配置对象。<br />​

## 配置
### 构建时配置
```typescript
export default {
  request: {
    dataField: 'data'
  },
};
```
构建时配置可以为 useRequest 配置 `dataField` ，该配置的默认值是 `data`。该配置的主要目的是方便 useRequest 直接消费数据。如果你想要在消费数据时拿到后端的原始数据，需要在这里配置 `dataField` 为 `''` 

比如你的后端返回的数据格式如下。
```ts
{
  success: true,
  data: 123,
  code: 1,
}
```
那么 useRequest 就可以直接消费 data，而不是 `{ success, data, cdoe }` 


### 运行时配置
在 `src/app.ts` 中你可以配置一些运行时的配置项来实现部分的自定义需求。示例配置及配置接口如下：
```typescript
import { RequestConfig } from '@@/plugin-request';

export const request: RequestConfig = {
  timeout: 1000,
  // other options you want
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
除了 `errorConfig`, `requestInterceptors`, `responseInterceptors` 以外其它配置都直接透传 [axios](https://axios-http.com/docs/req_config) 的 request 配置。**在这里配置的规则将应用于所有的** `request` 和 `useRequest`  **方法.** 

#### errorConfig
如果你想要为自己的请求设定统一的错误处理方案，可以在这里进行配置。其中 `errorThrower` 接收你后端返回的数据并且抛出一个自己的 error， 你可以在这里根据后端的数据进行一定的处理。我们的 `request` 会 catch `errorThrower` 抛出的错误，并且执行你的 `errorHandler` 方法，该方法接收两个参数，第一个参数是 catch 到的 error，第二个参数则是 request 的 opts。

我们提供了一套 errorConfig 的例子。这套例子就是 umi3 的内置错误处理机制，对于那些使用了 umi3 错误处理的用户，可以直接把这份运行时配置拷贝到你的项目中。

```ts
import { RequestConfig } from './request';

enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: number;
}

export const request: RequestConfig = {
  errorConfig: {
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothong
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
        message.error('Response status:', error.response.status);
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
    errorThrower: (res: ResponseStructure) => {
      const { success, data, errorCode, errorMessage, showType } = res;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error;
      }
    },
  },
};

```

#### requestInterceptors
为 request 方法添加 request 阶段的拦截器。传入一个数组，每个元素都是一个拦截器，它们会被按顺序依次注册到 axios 实例上。拦截器的写法同 axios。我们建议你使用 `RequestConfig`，它能帮助你规范地书写你的拦截器。

e.g.
```ts
const request: RequestConfig = {
  requestInterceptors: [
    // 直接写一个 function，作为拦截器
    (config) => 
      {
        // do something
        return config 
      },
    // 一个二元组，第一个元素是 request 拦截器，第二个元素是错误处理
    [(config) => {return config}, (error) => {return Promise.reject(error)}]
    // 数组，省略错误处理
    [(config) => {return config}]
  ]
  
}
```

#### responseInterceptors
为 request 方法添加 response 阶段的拦截器。传入一个数组，每个元素都是一个拦截器，它们会被按顺序依次注册到 axios 实例上。拦截器的写法同 axios。我们建议你使用 `RequestConfig`，它能帮助你规范地书写你的拦截器。

e.g.
```ts
const request: RequestConfig = {
  responseInterceptors: [
    // 直接写一个 function，作为拦截器
    (response) => 
      {
        // do something
        return response 
      },
    // 一个二元组，第一个元素是 request 拦截器，第二个元素是错误处理
    [(response) => {return response}, (error) => {return Promise.reject(error)}]
    // 数组，省略错误处理
    [(response) => {return response}]
  ]
  
}
```

**注意： 我们会按照你的数组顺序依次注册拦截器，但是其执行顺序参考 axios，request 是后添加的在前，response 是后添加的在后**

## API
### `useRequest`
插件内置了 [@ahooksjs/useRequest](https://ahooks-v2.surge.sh/hooks/async) ，你可以在组件内通过该 Hook 简单便捷的消费数据。示例如下：
```typescript
import { useRequest } from '@@/plugin-request';

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
上面代码中 data 并不是你后端返回的数据，而是其内部的 data，（因为构建时配置默认是 'data') 

需要注意的是，ahooks 已经更新到3.0，而我们为了让 umi3 的项目升级起来不那么困难，继续沿用了 ahooks2.0


### `request`
通过 `import { request } from '@@/plugin-request` 你可以使用内置的请求方法。 
`request` 接收的 `options`除了透传 [axios](https://axios-http.com/docs/req_config) 的所有 config 之外，我们还额外添加了几个属性 `skipErrorHandler`，`getResponse`，`requestIntercetors` 和 `responseInterceptors` ，当你的某个请求想要跳过错误处理时，可以通过将该值设为 `true` 来实现。<br />示例如下：
```typescript
request('/api/user', {
  params: { name : 1 },
  skipErrorHandler: true,
  getResponse: false,
  timeout: 2000
}
```

request 默认返回的是你后端的数据，如果你想要拿到 axios 完整的 response 结构，可以通过传入 `{ getResponse: true }` 来实现。

`requestInterceptors` 和 `reponseInterceptors` 的用法同运行时配置相同，为 request 注册拦截器。一个区别在于这里注册的拦截器是"一次性"的。它们会在运行时配置中的拦截器之后被注册。

**注意： 当你使用了 errorHandler 时，在这里注册的 response 拦截器会失效，因为在 errorHandler 就会 throw error**

### `RequestConfig`
这是一个接口的定义，可以帮助你更好地配置运行时配置。
```typescript
import type { RequestConfig } from '@@/plugin-request';

export const request:RequestConfig = {};
```
注意，在导入时要加 type
### `IErrorHandler`
这是对于运行时配置中 `errorConfig.errorHandler` 的接口定义。
```typescript
interface IErrorHandler {
  (error: any, opts ): void;
}
```

## Umi@3 到 Umi@4
在 Umi@3 到 Umi@4 的升级中，我们弃用了 umi-request ，选用了 axios 作为默认的请求方案。在这个更换中，我们的功能也发生了一些变化。

### 运行时配置的变动
相比于 Umi@3， Umi@4 的运行时配置发生了较大的变化。
```git
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

### request 方法的参数变动
[umi-request](https://github.com/umijs/umi-request#request-options) 和 [axios](https://axios-http.com/docs/req_config) 的配置项有着一定的区别。具体可以查看其各自的文档进行比较。

