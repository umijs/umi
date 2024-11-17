---
order: 5
toc: content
translated_at: '2024-03-17T10:26:57.083Z'
---

# Mock

Umi provides an out-of-the-box Mock feature, which enables the setup of Mock data in a convenient and simple manner.

:::info{title=💡}
What is Mock data: After the front-end and back-end have agreed on the API interface, the front end can use Mock data to simulate the data that the API should return locally. This allows front-end and back-end development to proceed simultaneously, without being blocked by the ongoing development of the backend API.
:::

## Directory Conventions

Umi conventionally treats all files under the `/mock` directory as [Mock files](#mock-files), like this directory structure:

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

Thus, `todos.ts`, `items.ts`, and `users.ts` in the `/mock` directory will be processed by Umi as [Mock files](#mock-files).

## Mock Files

Mock files export an object by default, where each key of the object corresponds to a Mock interface, and the value is the data that should be returned by this interface, like in this Mock file:

```ts
// ./mock/users.ts

export default {

  // The return value can be an array
  'GET /api/users': [
    { id: 1, name: 'foo' },
    { id: 2, name: 'bar' }
  ],

  // The return value can also be an object
  'GET /api/users/1': { id: 1, name: 'foo' },

}
```

This declares two Mock interfaces. Through `GET /api/users`, you can get an array with two user data. Through `GET /api/users/1`, you can get simulated data for a user.

### Request Methods

When the HTTP request method is GET, you can omit the method part and only need the path, like:

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

You can also use different request methods, such as `POST`, `PUT`, `DELETE`:

```ts
// ./mock/users.ts

export default {

  'POST /api/users': { result: 'true' },

  'PUT /api/users/1': { id: 1, name: 'new-foo' },

}
```

### Custom Functions

In addition to directly declaring static return values, you can also use functions to declare how to compute the return values, like:

```ts
export default {

  'POST /api/users/create': (req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('ok');
  }

}
```

For the APIs of `req` and `res`, refer to the [Express@4 official documentation](https://expressjs.com/en/api.html) for further understanding.

### defineMock

Furthermore, you can use the `defineMock` type helper function to provide code hints for writing mock objects, like:
```ts
import { defineMock } from "umi";

export default defineMock({
  "/api/users": [
    { id: 1, name: "foo" },
    { id: 2, name: "bar" },
  ],
  "/api/users/1": { id: 1, name: "foo" },
  "GET /api/users/2": (req, res) => {
    res.status(200).json({ id: 2, name: "bar" });
  },
});
```
`defineMock` simply provides type hints; the input and output are completely identical.
## Disabling Mock

Mock functionality is enabled by default in Umi. If it's not needed, it can be disabled from the config file:

```ts
// .umirc.ts

export default {
  mock: false,
};
```

Or by using an environmental variable:

```bash
MOCK=none umi dev
```

## Integrating Mock.js

In Mock, we often use [Mock.js](http://mockjs.com/) to help us conveniently generate random simulated data. If you are using Umi's Mock functionality, it's recommended to pair it with this library to enhance the realism of the simulated data:

```ts
import mockjs from 'mockjs';

export default {
  // Using third-party libraries like mockjs
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 50, 'type|0-2': 1 }],
  }),
};
```

## Other Configurations

For a complete list of other configuration options for Mock functionality, please see the [configuration](../api/config#mock) section of the documentation.
