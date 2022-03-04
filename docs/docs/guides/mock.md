import {Message} from 'umi';

# Mock

Umi 提供了开箱即用的 Mock 功能，能够用方便简单的方式来完成 Mock 数据的设置。

<Message emoji="💡">
什么是 Mock 数据：在前后端约定好 API 接口以后，前端可以使用 Mock 数据来在本地模拟出 API 应该要返回的数据，这样一来前后端开发就可以同时进行，不会因为后端 API
还在开发而导致前端的工作被阻塞。
</Message>

## 目录约定

Umi 约定 `/mock` 目录下的所有文件为 [Mock 文件](#mock-文件)，例如这样的目录结构：

```text
.
├── mock
    ├── todos.ts
    ├── items.ts
    └── users.ts
└── src
    └── pages
        └── index.tsx
```

则 `/mock` 目录中的 `todos.ts`, `items.ts` 和 `users.ts` 就会被 Umi 视为 [Mock 文件](#mock-文件) 来处理。

## Mock 文件

Mock 文件默认导出一个对象，而对象的每个 Key 对应了一个 Mock 接口，值则是这个接口所对应的返回数据，例如这样的 Mock 文件：

```ts
// ./mock/users.ts

export default {

  // 返回值可以是数组形式
  'GET /api/users': [
    { id: 1, name: 'foo' },
    { id: 2, name: 'bar' }
  ],

  // 返回值也可以是对象形式
  'GET /api/users/1': { id: 1, name: 'foo' },

}
```

就声明了两个 Mock 接口，透过 `GET /api/users` 可以拿到一个带有两个用户数据的数组，透过 `GET /api/users/1` 可以拿到某个用户的模拟数据。

### 请求方法

当 Http 的请求方法是 GET 时，可以省略方法部分，只需要路径即可，例如：

```ts
// ./mock/users.ts

export default {

  '/api/users': [
    { id: 1, name: 'foo' },
    { id: 2, name: 'bar' }
  ],

  '/api/users/1': { id: 1, name: 'foo' },

}
```

也可以用不同的请求方法，例如 `POST`，`PUT`，`DELETE`：

```ts
// ./mock/users.ts

export default {

  'POST /api/users': { result: 'true' },

  'PUT /api/users/1': { id: 1, name: 'new-foo' },

}
```

### 自定义函数

除了直接静态声明返回值，也可以用函数的方式来声明如何计算返回值，例如：

```ts
export default {

  'POST /api/users/create': (req, res) => {
    // 添加跨域请求头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('ok');
  }

}
```

关于 `req` 和 `res` 的 API 可参考 [Express@4 官方文档](https://expressjs.com/en/api.html) 来进一步了解。

## 关闭 Mock

Umi 默认开启 Mock 功能，如果不需要的话可以从配置文件关闭：

```ts
// .umirc.ts

export default {
  mock: false,
};
```

或是用环境变量的方式关闭：

```bash
MOCK=none umi dev
```

## 引入 Mock.js

在 Mock 中我们经常使用 [Mock.js](http://mockjs.com/) 来帮我们方便的生成随机的模拟数据，如果你使用了 Umi 的 Mock
功能，建议你搭配这个库来提升模拟数据的真实性：

```ts
import mockjs from 'mockjs';

export default {
  // 使用 mockjs 等三方库
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 50, 'type|0-2': 1 }],
  }),
};
```

## 其他配置

关于 Mock 功能完整的的其他配置项，请在文档的 [配置](../api/config#mock) 章节中查看。
