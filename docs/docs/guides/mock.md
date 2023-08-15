import { Message } from 'umi';

# Mock

Umi provides built-in Mock functionality that allows you to easily set up mock data using a convenient and straightforward approach.

<Message emoji="💡">
What is Mock Data: After defining API interfaces between the frontend and backend, the frontend can use mock data to simulate the data that the API should return. This enables frontend and backend development to proceed simultaneously without blocking each other.
</Message>

## Directory Convention

Umi conventionally treats all files under the `/mock` directory as [Mock Files](#mock-files). For example, with the following directory structure:

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

The files `todos.ts`, `items.ts`, and `users.ts` within the `/mock` directory will be recognized by Umi as [Mock Files](#mock-files) to be processed.

## Mock Files

Mock files should default export an object, where each key corresponds to a mock API endpoint, and the value represents the data to be returned for that endpoint. For example, in this mock file:

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

This defines two mock API endpoints. Accessing `GET /api/users` will return an array containing two user data objects, while accessing `GET /api/users/1` will return mock data for a specific user.

### Request Methods

For HTTP GET requests, you can omit the method part and only provide the path. For example:

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

Instead of directly declaring static return values, you can use functions to determine how to calculate the return values. For example:

```ts
export default {

  'POST /api/users/create': (req, res) => {
    // Add cross-origin request header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('ok');
  }

}
```

You can refer to the [Express@4 official documentation](https://expressjs.com/en/api.html) to learn more about the API for `req` and `res`.

### defineMock

Additionally, you can use the `defineMock` type helper function to provide code hints for writing mock objects, like so:

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

`defineMock` only provides type hints; the input and output are identical.
## Disabling Mock

Umi enables Mock functionality by default. If you don't need it, you can disable it through the configuration file:

```ts
// .umirc.ts

export default {
  mock: false,
};
```

Alternatively, you can disable it using environment variables:

```bash
MOCK=none umi dev
```

## Integrating Mock.js

In Mock, we often use [Mock.js](http://mockjs.com/) to generate random simulated data conveniently. If you're using Umi's Mock functionality, it's recommended to use this library to enhance the authenticity of your mock data:

```ts
import mockjs from 'mockjs';

export default {
  // Use third-party libraries like mockjs
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 50, 'type|0-2': 1 }],
  }),
};
```

## Other Configurations

For the complete list of other configurations related to Mock functionality, refer to the [Configuration](../api/config#mock) section in the documentation.