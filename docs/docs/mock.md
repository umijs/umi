---
translateHelp: true
---

# Mock Data


Mock data is an indispensable part of the front-end development process and a key link to separate front-end and back-end development. By pre-determining the interface with the server in advance, simulating the request data and even the logic, the front-end development can be made independent and not blocked by the server-side development.

## Conventional Mock Files

Umi agrees that all files in the `/mock` folder are mock files.

such as:

```bash
.
└── src
    ├── mock
    │   ├── api.ts
    │   └── users.ts
    └── pages
        └── index.tsx
```

`api.ts` and` users.ts` under `src/mock` will be parsed into mock files.

## Writing mock files

If the contents of `src/mock/api.ts` are as follows,

```js
export default {
  // Supported values ​​are Object and Array
  'GET /api/users': { users: [1, 2] },

  // GET can be ignored
  '/api/users/1': { id: 1 },

  // Support custom functions, API reference express@4
  'POST /api/users/create': (req, res) => {
    // Add cross domain request header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('ok');
  },
}
```

Then visit `/api/users` to get the response of `{ users: [1, 2] }`, and so on.

## Configure Mock

See details [configuration#mock](TODO)。

## How to disable Mock？

Can be disabled via configuration,

```js
export default {
  mock: false,
};
```

It can also be temporarily closed through environment variables,

```bash
$ MOCK=none umi dev
```

## Introducing Mock.js

[Mock.js](http://mockjs.com/) is a commonly used third-party library to assist in the generation of simulation data, with which we can improve our ability to mock data.

such as:

```js
import mockjs from 'mockjs';

export default {
  // Using a three-party library such as mockjs
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 50, 'type|0-2': 1 }],
  }),
};
```
