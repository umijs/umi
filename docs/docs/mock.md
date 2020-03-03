---
translateHelp: true
---

# Mock Data

Mock data is an indispensable part of the front-end development process and a key link to separate front-end and back-end development. By pre-determining the interface with the server in advance, simulating the request data and even the logic, the front-end development can be made independent and not blocked by the server-side development.

## 约定式 Mock 文件

Umi treats all files in the `src/mock` folder as mock files.

Example:

```bash
.
└── src
    ├── mock
    │   ├── api.ts
    │   └── users.ts
    └── pages
        └── index.tsx
```

`src/mock` under `api.ts` and `users.ts` will be resolved as mock files.

## Writing Mock Files

The file content for `src/mock/api.ts` is as follows:

```js
export default {
  // Get Object Array of users
  'GET /api/users': { users: [1, 2] },

  // GET single user object
  '/api/users/1': { id: 1 },

  // Create new user
  'POST /api/users/create': (req, res) => {
    // allow Cross Origin request (any)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('ok');
  },
}
```

Accessing `/api/users` will return `{ users: [1,2] }`

## Configure Mock

TODO

## How to close Mock?

Via configuration:

```js
export default {
  mock: false,
};
```

It can also be temporarily closed through environment variables

```bash
$ MOCK=none umi dev
```

## Introducing Mock.js

[Mock.js](http://mockjs.com/) is a commonly used third-party library to assist in generating simulation data. With it, we can improve our mock data capabilities.

Example:

```js
import mockjs from 'mockjs';

export default {
  // use mockjs to mock response
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 50, 'type|0-2': 1 }],
  }),
};
```
