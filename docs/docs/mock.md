---
translateHelp: true
---

# Mock Data


Mock data is an indispensable part of the front-end development process and a key link to separate the front-end and back-end development. Through pre-appointed interfaces with the server to simulate request data and even logic, front-end development can be independent and will not be blocked by server-side development.

## Conventional Mock File

Umi agrees that all files in the `/mock` folder are mock files.

such as:

```bash
.
├── mock
    ├── api.ts
    └── users.ts
└── src
    └── pages
        └── index.tsx
```

ʻapi.ts` and ʻusers.ts` under `/mock` will be parsed as mock files.

## Write mock file

If the content of `/mock/api.ts` is as follows,

```js
export default {
  // Supported values ​​are Object and Array
  'GET /api/users': {users: [1, 2] },

  // GET can be ignored
  '/api/users/1': {id: 1 },

  // Support custom functions, API reference express@4
  'POST /api/users/create': (req, res) => {
    // Add cross-domain request header
    res.setHeader('Access-Control-Allow-Origin','*');
    res.end('ok');
  },
}
```

Then visit `/api/users` to get the response of `{ users: [1,2] }`, and so on.

## Configure Mock

See [Configuration#mock](/config#mock) for details.

## How to turn off Mock?

Can be closed by configuration,

```js
export default {
  mock: false,
};
```

It can also be temporarily closed through environment variables,

```bash
$ MOCK=none umi dev
```

## Introduce Mock.js

[Mock.js](http://mockjs.com/) is a commonly used third-party library to assist in generating simulation data. With the help of it, we can improve our mock data capabilities.

such as:

```js
import mockjs from 'mockjs';

export default {
  // 使用 mockjs 等三方库
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 50, 'type|0-2': 1 }],
  }),
};
```
