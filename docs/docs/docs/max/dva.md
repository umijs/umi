---
order: 13
toc: content
---
# dva

## 为什么需要状态管理

React 的组件只是通过 jsx 以及样式按照 state 构建最终的 UI，真正将页面动态化的实际上是 state 的变化实现的。对于简单的前端应用，在组件中通过组件自身的 state 加上父组件通过 props 状态的传递就能够满足应用数据管理的需求。但是当应用膨胀到一定程度后就会导致组件内维护的状态非常的复杂，加上组件之间状态的传递，很容易导致数据管理混乱。很小的修改都可能导致难以预料的副作用。

所以我们需要纯净的 UI 组件，除了渲染逻辑，不再杂糅其他（比如网络请求）。这样我们就要想办法把与渲染无关的业务逻辑抽离出来，形成独立的层（在 Umi 中就是 `src/models` 文件夹中所管理的 model ）去管理。让所有组件降级为`无状态组件`，仅仅依赖 props 渲染。这样 UI 层面就不需关心渲染无关的逻辑，专注做 UI 渲染。（注：这里说的组件主要是指 page 下面的页面组件，对于 component 下的组件本身就应该是比较通用的组件，更应该仅仅依赖 props 渲染，它们也不应该有 model，数据应该通过在页面组件中通过 props 传递过去）。

## 简单的数据共享

对于简单的应用，不需要复杂的数据流，只需要一些简单的数据共享。我们推荐使用 [中台最佳实践简易数据流](./data-flow) 。

## Umi 如何管理状态

如下图所示，Umi 内置了 [Dva](https://dvajs.com) 提供了一套状态管理方案：

![undefined](https://gw.alipayobjects.com/zos/skylark/48f9ff5f-ab11-4896-9fb6-65cdd83340de/2018/png/dcb7073b-fc0c-4e2c-aa39-93ac249d715c.png)

数据统一在 `src/models` 中的 model 管理，组件内尽可能的不去维护数据，而是通过 connect 去关联 model 中的数据。页面有操作的时候则触发一个 action 去请求后端接口以及修改 model 中的数据，将业务逻辑分离到一个环形的闭环中，使得数据在其中单向流动。让应用更好维护。这样的思想最初来源于 Facebook 的 [flux](http://facebook.github.io/flux/)。接下来我们来具体看看如何在 Umi 中实现这样的逻辑。

### 配置 dva

首先你需要配置 `dva: {}` 打开 Umi 内置的 dva 插件。

### 添加 model

Umi 会默认将 `src/models` 下的 model 定义自动挂载，你只需要在 model 文件夹中新建文件即可新增一个 model 用来管理组件状态。

在 2.0 后，为了更好的支持移动端的 H5 项目的按需加载和大型项目的 model 组织，对于某个 page 文件夹下面的 model 我们也会默认挂载，具体结构可以参考[目录结构说明](../guides/directory-structure)。但是需要注意的是 model 的 namespace 是全局的，你仍然需要保证你的 namesapce 唯一（默认是文件名）。对于大部分的项目，我们推荐统一放到 model 中进行管理即可，不需要使用该功能。

model 的写法参考如下示例：

```js
import { queryUsers, queryUser } from '../../services/user';

export default {
  state: {
    user: {},
  },

  effects: {
    *queryUser({ payload }, { call, put }) {
      const { data } = yield call(queryUser, payload);
      yield put({ type: 'queryUserSuccess', payload: data });
    },
  },

  reducers: {
    queryUserSuccess(state, { payload }) {
      return {
        ...state,
        user: payload,
      };
    },
  },

  test(state) {
    console.log('test');
    return state;
  },
};
```

### 把组件和 model connect 在一起

新建完成 model 之后你就可以在组件中通过 ES6 的 [Decorator](http://es6.ruanyifeng.com/#docs/decorator) 方便的把 model 和组件 connect 到一起。然后你就可以在组件中通过`this.props.[modelName]`的方式来访问 model 中的数据了。（在对应的 model 中，默认 namespace 即为文件名）

组件如下示例：

```javascript
import React, { Component } from 'react';
import { connect } from 'umi';

@connect(({ user }) => ({
  user,
}))
class UserInfo extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div>{this.props.user.name}</div>;
  }
}

export default UserInfo;
```

### 在组件中 dispatch 事件

connect 方法同时也会添加 `dispatch` 到 `this.props` 上，你可以在用户触发某个事件的时候调用它来触发 model 中的 effects 或者 reducer 来修改 model 中的数据。如下所示：

```javascript
import React, { Component } from 'react';
import { connect } from 'umi';

@connect(({ user }) => ({
  user,
}))
class UserInfo extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div
        onClick={() => {
          this.props.dispatch({
            type: 'user/test',
          });
        }}
      >
        {this.props.user.name}
      </div>
    );
  }
}

export default UserInfo;
```

### 修改数据

dispatch 一个 action 之后会按照 action 中的 type 找到定义在 model 中的一个 effect 或者 reducer。

如果是 effect，那么可以去请求后端数据，然后再触发一个 reducer 来修改数据。通过 reducer 修改数据之后组件便会按照最新的数据更新，至此，一次数据的流动就结束了。

## 文档

### model 定义

一个 model 中可以定义如下几个部分：

- namespace # model 的命名空间，唯一标识一个 model，如果与文件名相同可以省略不写
- state # model 中的数据
- effects # 异步 action，用来发送异步请求
- reducers # 同步 action，用来修改 state

### connect

`connect` 的是用来将 model 和组件关联在一起的，它会将相关数据和 `dispatch` 添加到组件的 `props` 中。如下所示：

```jsx
import React, { Component } from 'react';
import { connect } from 'umi';

const mapModelToProps = allModels => {
  return {
    test: 'hello world',
    // props you want connect to Component
  };
};

@connect(mapModelToProps)
class UserInfo extends Component {
  render() {
    return <div>{this.props.test}</div>;
  }
}

export default UserInfo;
```

推荐通过注解的方式调用 connect，它等同于 `export default connect(mapModelToProps)(UserInfo);`。connect 接收一个参数，是一个方法，在该方法中你接收到所有的 model 信息，需要返回要添加到 props 上的对象。在上面的例子中你就可以通过 `this.props.test` 得到 `hello world` 的字符串了。

### dispatch

在使用 `connect` 将组件和 model 关联在一起的同时框架也会添加一个 `this.props.dispatch` 的方法，通过该方法你可以触发一个 action 到 model 中。如下所示：

```jsx
render () {
  return <div onClick={() => {
   this.props.dispacth({
    type: 'modelnamespace/actionname',
    sometestdata: 'xxx',
    othertestata: {},
  }).then(() => {
    // it will return a promise
    // action success
  });
  }}>test</div>
}
```

通过 `this.props.dispatch` 触发的 action 分为 effect 和 reducer 两类，下面是对他们的更多细节说明。

### Reducer

reducer 是一个函数，用来处理修改数据的逻辑（同步，不能请求后端）。接受 state 和 action，返回老的或新的 state 。即：`(state, action) => state`。

#### 增删改

以 todos 为例。

```javascript
exports default {
  namespace: 'todos',
  state: [],
  reducers: {
    add(state, { payload: todo }) {
      return state.concat(todo);
    },
    remove(state, { payload: id }) {
      return state.filter(todo => todo.id !== id);
    },
    update(state, { payload: updatedTodo }) {
      return state.map(todo => {
        if (todo.id === updatedTodo.id) {
          return { ...todo, ...updatedTodo };
        } else {
          return todo;
        }
      });
    },
  },
};
```

#### 嵌套数据的增删改

建议最多一层嵌套，以保持 state 的扁平化，深层嵌套会让 reducer 很难写和难以维护。

```javascript
app.model({
  namespace: 'app',
  state: {
    todos: [],
    loading: false,
  },
  reducers: {
    add(state, { payload: todo }) {
      const todos = state.todos.concat(todo);
      return { ...state, todos };
    },
  },
});
```

下面是深层嵌套的例子，应尽量避免。

```javascript
app.model({
  namespace: 'app',
  state: {
    a: {
      b: {
        todos: [],
        loading: false,
      },
    },
  },
  reducers: {
    add(state, { payload: todo }) {
      const todos = state.a.b.todos.concat(todo);
      const b = { ...state.a.b, todos };
      const a = { ...state.a, b };
      return { ...state, a };
    },
  },
});
```

### Effect

effects 是定义在 model 中的。它也是一种类型的 action，主要用于和后端的异步通讯。通过 effects 请求后端发送和接收必要的数据之后可以通过 put 方法再次发送一个 reducer 来修改数据。

effect 通过 ES6 中 [Generator 函数](http://es6.ruanyifeng.com/#docs/generator) 来支持通过顺序的代码实现异步的请求，示例如下：

```javascript
export default {
  namespace: 'todos',
  effects: {
    *addRemote({ payload: todo }, { put, call }) {
      yield call(addTodo, todo);
      yield put({ type: 'add', payload: todo });
    },
  },
};
```

effects 中定义的 action 都必须是通过 `*` 定义的 Generator 函数，然后在函数中通过关键字 `yield` 来触发异步逻辑。

#### Effects

##### put

用于触发 action 。

```javascript
yield put({ type: 'todos/add', payload: 'Learn Dva' });
```

##### call

用于调用异步逻辑，支持 promise 。

```javascript
const result = yield call(fetch, '/todos');
```

##### select

用于从 state 里获取数据。

```javascript
const todos = yield select(state => state.todos);
```

### loading

框架会默认添加一个命名空间为 loading 的 model，该 model 包含 effects 异步加载 loading 的相关信息，它的 state 格式如下：

```js
{
  global: Boolean, // 是否真正有异步请求发送中
  models: {
    [modelnamespace]: Boolean, // 具体每个 model 的加载情况
  },
  effects: {
    [modelnamespace/effectname]: Boolean, // 具体每个 effect 的加载情况
  },
}
```

你可以使用该 model 实现在组件中添加 loading 动画。

## 调试

### redux

dva 的底层是基于 redux，所以你可以安装 redux 的[开发者工具](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=zh-CN)用来查看 model 中的数据和变化的记录。

![reduxdevtool](https://lh3.googleusercontent.com/wfhSnnYEQc3TCXbRTpTloa-XZesgDt0xAogzGoLF1BUCU04aYhdwAjueJYTtDxfRiqjUfC539g=w640-h400-e365)

## 参考文章

- [dva 官网](https://dvajs.com/)
