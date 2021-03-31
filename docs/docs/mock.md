---
translateHelp: true
---

# Mock Data

Mock Data is essential to decouple the front-end development from backend development. By following the predefined backend contract, Mock Data can simulate the backend data and logic, which makes the front-end development unaffected by the progress of backend development. 

## Convention-based Mock Files

By convention, all files under `/mock` are treated as mock files by Umi.

For example：

```bash
.
├── mock
    ├── api.ts
    └── users.ts
└── src
    └── pages
        └── index.tsx
```

In this case, `api.ts` and `users.ts` will be picked up as mock files。

## Sample Mock File

Given the mock file `/mock/api.ts` with following content，

```js
export default {
  // support Object and Array as return data
  'GET /api/users': { users: [1, 2] },

  // GET can be omitted
  '/api/users/1': { id: 1 },

  // support customized functions，please refer to express@4 for more details of the API
  'POST /api/users/create': (req, res) => {
    // add cors header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('ok');
  },
}
```

when requesting `/api/users`, `{ users: [1,2] }` will be returned.

## Mock Configuration

Refer to [Config#mock](/config#mock) for more details。

## How to disable Mock？

Disable Mock with configuration，

```js
export default {
  mock: false,
};
```

Disable Mock using environment variable，

```bash
$ MOCK=none umi dev
```

## Use Mock.js

[Mock.js](http://mockjs.com/) a great 3rd-party library for mocking data，which has more capabilities.

Sample code：

```js
import mockjs from 'mockjs';

export default {
  // use mockjs
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 50, 'type|0-2': 1 }],
  }),
};
```
