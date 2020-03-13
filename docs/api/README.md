---
nav:
  title: API
toc: menu
translateHelp: true
---

# API


## Basic API

### dynamic

Load components dynamically.

```js
import { dynamic } from 'umi';

const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

export default dynamic({
  loader: async function() {
    await delay(/* 1s */1000);
    return () => <div>I will render after 1s</div>;
  },
});
```

### history

Can be used to get the current routing information,

```js
import { history } from 'umi';

// number of entities in the history stack
console.log(history.length);

// The current history jump action, there are three types of PUSH, REPLACE and POP
console.log(history.action);

// location object containing pathname, search, and hash
console.log(history.location.pathname);
console.log(history.location.search);
console.log(history.location.hash);
```

Can be used for routing jumps,

```js
import { history } from 'umi';

// Jump to the specified route
history.push('/list');

// Jump to the specified route with parameters
history.push('/list?a=b');
history.push({
  pathname: '/list',
  query: {
    a: 'b',
  },
});

// Jump to previous route
history.goBack();
```

Can also be used for routing listening,

```js
import { history } from 'umi';

const unlisten = history.listen((location, action) => {
  console.log(location.pathname);
});
unlisten();
```

### plugin

> It is mainly used in plug-ins, and is generally not used in project code.

The runtime plug-in interface is a set of plug-in systems running in the browser built into Umi.

such as:

```js
import { plugin, ApplyPluginsType } from 'umi';

// Register plugin
plugin.register({
  apply: { dva: { foo: 1 } },
  path: 'foo',
});
plugin.register({
  apply: { dva: { bar: 1 } },
  path: 'bar',
});

// Execute plugin
// Get {foo: 1, bar: 1}
plugin.applyPlugins({
  key: 'dva',
  type: ApplyPluginsType.modify,
  initialValue: {},
  args: {},
  async: false,
});
```

Parameter attributes include:

* **key**, the key of the pit
* **type**, execution type, see [ApplyPluginsType](#ApplyPluginsType)
* **initialValue**, Initial value
* **args**, parameters
* **async**，whether to execute asynchronously and return a Promise

### ApplyPluginsType

> It is mainly used in plug-ins, and is generally not used in project code.

Runtime plugin execution type, enum type, contains three attributes:

* **compose**, used to combine and execute multiple functions, the function can determine the execution timing of the pre-order function
* **modify**, for modifying values
* **event**, used to execute events, there are no dependencies in the front

## Routing

### Link

### NavLink

### Prompt

### withRouter

### useRouter

### useHistory

### useLocation

### useParams

### useRouteMatch

## node 侧接口

> It is exposed through the main field of package.json and does not exist in the modules field.

### Service

The Umi kernel's Service method is used for testing or calling Umi low-level commands.

### utils

The utils method is used by the plugin and is the same underlying library as the api.utils in the plugin.

### defineConfig

Used to checksum prompt the user for the configuration type, see [Configuration#TypeScript Prompt](TODO) for details.

## Plugin type definition

### IApi

### IConfig
