---
translateHelp: true
---

# Mock Data


Mock 数据是前端开发过程中必不可少的一环，是分离前后端开发的关键链路。通过预先跟服务器端约定好的接口，模拟请求数据甚至逻辑，能够让前端开发独立自主，不会被服务端的开发所阻塞。

## 约定式 Mock 文件

Umi 约定 `/mock` 文件夹下所有文件为 mock 文件。

比如：

```bash
.
├── mock
    ├── api.ts
    └── users.ts
└── src
    └── pages
        └── index.tsx
```

`/mock` 下的 `api.ts` 和 `users.ts` 会被解析为 mock 文件。

## 编写 Mock 文件

如果 `/mock/api.ts` 的内容如下，

```js
export default {
  // 支持值为 Object 和 Array
  'GET /api/users': { users: [1, 2] },

  // GET 可忽略
  '/api/users/1': { id: 1 },

  // 支持自定义函数，API 参考 express@4
  'POST /api/users/create': (req, res) => {
    // 添加跨域请求头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('ok');
  },
}
```

然后访问 `/api/users` 就能得到 `{ users: [1,2] }` 的响应，其他以此类推。

## 配置 Mock

详见[配置#mock](/config#mock)。

## 如何关闭 Mock？

可以通过配置关闭，

```js
export default {
  mock: false,
};
```

也可以通过环境变量临时关闭，

```bash
$ MOCK=none umi dev
```

## 引入 Mock.js

[Mock.js](http://mockjs.com/) 是常用的辅助生成模拟数据的三方库，借助他可以提升我们的 mock 数据能力。

比如：

```js
import mockjs from 'mockjs';

export default {
  // 使用 mockjs 等三方库
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 50, 'type|0-2': 1 }],
  }),
};
```
