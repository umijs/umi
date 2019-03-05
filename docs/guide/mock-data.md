# Mock Data

Mock data is indispensable in front-end development process and it is the key link to separate the front-end from the back-end. Through the pre-agreed interface with the server-side, simulation request data and even logic, can make the front-end development independent, will not be blocked by the development of the server-side.

## Using the mock feature of umi

Umi agreed that the files under the mock folder or _mock.js in page(s) folder are mock files, files export interface definitions, support for real-time refresh based on 'require' dynamic analysis, support for ES6 syntax, and with friendly error messages, see [mock-data](https://umijs.org/guide/mock-data.html) for more detail.

```js
export default {
  // supported values are Object and Array
  'GET /api/users': { users: [1, 2] },

  // GET and POST can be omitted
  '/api/users/1': { id: 1 },

  // support for custom functions, APIs refer to express@4
  'POST /api/users/create': (req, res) => { res.end('OK'); },
};
```

When a client(browser) sends a request, such as `GET /api/users`, the locally launched `umi dev` will match the request path and method with this configuration file, if it find a match, the request will be processed through configuration, just like the sample, you can directly return the data, or process and redirect it to another server through a function.

For example, define the following mapping rules as below:

```
'GET /api/currentUser': {
  name: 'momo.zxy',
  avatar: imgMap.user,
  userid: '00000001',
  notifyCount: 12,
},
```

Request local interface `/api/users`:

Request header

<img src="https://gw.alipayobjects.com/zos/rmsportal/ZdlcFoYonSGDupWnktZn.png" width="400" />

Response data

<img src="https://gw.alipayobjects.com/zos/rmsportal/OLHIXePGHkkFoaZVQAts.png" width="600" />

### Introduce Mock.js

[Mock.js](http://mockjs.com/) is a commonly used third-party library to help generate mock data. Of course, you can use any library you like working with roadhog to build data simulation functions.

```js
import mockjs from 'mockjs';

export default {
  // Use third-party library such as mockjs
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 50, 'type|0-2': 1 }],
  }),
};
```

### Add a cross-domain request header

Just set the header of `response`:

```
'POST /api/users/create': (req, res) => {
  ...
  res.setHeader('Access-Control-Allow-Origin', '*');
  ...
},
```

## Properly split your mock file

For the entire system, the request interface is complex and numerous, in order to handle a large number of mock request scenarios, we usually abstract each data model into a file, and put them all in the `mock` folder. And then they will be automatically introduced.

<img src="https://gw.alipayobjects.com/zos/rmsportal/wbeiDacBkchXrTafasBy.png" width="200" />

## How to simulate delay

In order to simulate the network data request more realistically, it is necessary to simulate network delay time in most cases.

### Add setTimeout manually to simulate delay

You can rewrite the proxy method of the request and add the processing of simulation delay to it, like:

```js
'POST /api/forms': (req, res) => {
  setTimeout(() => {
    res.send('Ok');
  }, 1000);
},
```

### Use plugins to simulate delay

Although the method above is simple, it may be troublesome when you need to add delays for all request, it can be simplified by a third-party plugin，such as [roadhog-api-doc#delay](https://github.com/nikogu/roadhog-api-doc/blob/master/lib/utils.js#L5).

```js
import { delay } from 'roadhog-api-doc';

const proxy = {
  'GET /api/project/notice': getNotice,
  'GET /api/activities': getActivities,
  'GET /api/rule': getRule,
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 50, 'type|0-2': 1 }]
  }),
  'GET /api/fake_list': getFakeList,
  'GET /api/fake_chart_data': getFakeChartData,
  'GET /api/profile/basic': getProfileBasicData,
  'GET /api/profile/advanced': getProfileAdvancedData,
  'POST /api/register': (req, res) => {
    res.send({ status: 'ok' });
  },
  'GET /api/notices': getNotices,
};

// Calling the delay function, unified processing
export default delay(proxy, 1000);
```

## Dynamic mock data

If you want to generate dynamic mock data on every request, you should use functions.

For example:

```js
// undynamic
'/api/random': Mock.mock({
  // random once only
  'number|1-100': 100,
}),
```

```js
// dynamic
'/api/random': (req, res) => {
  res.send(Mock.mock({
    // random every request
    'number|1-100': 100,
  }))
},
```

## Joint debugging

After finishing the local development, if the interface of server-side meets the previous convention, you only need to open the local proxy or redirect the proxy to the target server to access the real server data, which is very convenient.
