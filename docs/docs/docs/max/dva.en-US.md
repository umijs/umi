---
order: 13
toc: content
translated_at: '2024-03-17T09:17:48.666Z'
---

# dva

## Why We Need State Management

React components are essentially built through JSX and styles according to the state to form the final UI. It is the change in state that actually dynamizes the page. For simple frontend applications, the application data management needs can be met by the component's own state plus the parent component passing state via props. However, when the application scales to a certain degree, it will lead to very complex states maintained within components. Coupled with the state transfer between components, data management can easily become chaotic. A minor modification can lead to unpredictable side effects.

Therefore, we need pure UI components that, apart from rendering logic, do not mix other logics (such as network requests). This requires us to find a way to extract business logic unrelated to rendering, forming an independent layer (which is managed by the model in the `src/models` folder in Umi) to manage. All components are downgraded to `stateless components` that solely depend on props for rendering. In this way, the UI layer no longer needs to worry about rendering unrelated logics and focuses on UI rendering. (Note: The components mentioned here mainly refer to the page components under page, whereas the components under component should be relatively universal components that should also rely solely on props for rendering, and they should not have a model. Data should be passed to them via props in the page components).

## Simple Data Sharing

For simple applications that do not require complex data flows, only some simple data sharing is needed. We recommend using [Middle Platform Best Practices Simple Data Flow](./data-flow).

## How Umi Manages State

As shown in the figure below, Umi has built in [Dva](https://dvajs.com) to provide a set of state management solutions:

![undefined](https://gw.alipayobjects.com/zos/skylark/48f9ff5f-ab11-4896-9fb6-65cdd83340de/2018/png/dcb7073b-fc0c-4e2c-aa39-93ac249d715c.png)

Data is uniformly managed in the models of `src/models`, components strive not to maintain data as much as possible, but to associate with the data in the model through connect. When there is an operation on the page, an action is triggered to request the backend interface and modify the data in the model, separating the business logic into a cyclic closed loop, allowing the data to flow unidirectionally within it, making the application easier to maintain. This idea originally came from Facebook's [flux](http://facebook.github.io/flux/). Let's take a closer look at how to implement such logic in Umi.

### Configuring dva

First, you need to configure `dva: {}` to activate the dva plugin built into Umi.

### Adding a model

Umi will automatically mount the model definition in `src/models` by default, you just need to create a new file in the model folder to add a model to manage component states.

After 2.0, to better support the demand loading of mobile H5 projects and the organization of models in large projects, we will also default mount the model under a certain page folder, you can refer to [Directory Structure Explanation](../guides/directory-structure) for specific structure. However, it is worth noting that the namespace of the model is global, and you still need to ensure your namespace is unique (the default is the file name). For most projects, we recommend managing them uniformly in the model, without using this function.

The model writing refers to the following example:

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

### Connecting the Component and Model

After creating the model, you can conveniently connect the model and component together in the component through the ES6 [Decorator](http://es6.ruanyifeng.com/#docs/decorator). Then you can access the data in the model through `this.props.[modelName]` in the component. (In the corresponding model, the default namespace is the file name)

Component example is as follows:

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

### Dispatching Events in Components

The connect method also adds `dispatch` to `this.props`, and you can call it to trigger the effects or reducer in the model to modify the data in the model when the user triggers a certain event. As shown below:

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

### Modifying Data

After dispatching an action, it will find an effect or reducer defined in the model according to the type in the action.

If it's an effect, it can request back-end data, and then trigger a reducer to modify the data. After the data is modified by the reducer, the component will update according to the latest data, thus completing a data flow.

## Documentation

### Model Definition

A model can define the following parts:

- namespace # The namespace of the model, uniquely identifying a model, can be omitted if it is the same as the file name
- state # Data in the model
- effects # Asynchronous actions, used to send asynchronous requests
- reducers # Synchronous actions, used to modify state

### Connect

`Connect` is used to associate a model and a component, adding related data and `dispatch` to the component's `props`. As shown below:

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

It is recommended to call connect through annotation, which is equivalent to `export default connect(mapModelToProps)(UserInfo);`. Connect accepts a parameter, a method, where you receive all the model information and need to return the object to be added to props. In the example above, you can get the string 'hello world' through `this.props.test`.

### Dispatch

At the same time as using `connect` to associate the component and the model, the framework will also add a `this.props.dispatch` method. With this method, you can trigger an action to the model. As shown below:

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

The actions triggered by `this.props.dispatch` are divided into two categories: effect and reducer. Below are more details on them.

### Reducer

Reducer is a function that handles the logic of modifying data (synchronously, cannot request back-end). It accepts state and action, returning the old or new state. That is: `(state, action) => state`.

#### Add, Delete, Modify

Taking todos as an example.

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

#### Add, Delete, Modify Nested Data

It is recommended to keep at most one layer of nesting to maintain state flatness. Deep nesting makes reducer hard to write and maintain.

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

Below is an example of deep nesting, which should be avoided as much as possible.

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

Effects are defined in the model. It is also a type of action, mainly used for asynchronous communication with the back-end. After requesting and receiving the necessary data from the back-end through effects, you can again send a reducer through the put method to modify the data.

Effect supports asynchronous request through ES6 [Generator function](http://es6.ruanyifeng.com/#docs/generator), see the example below:

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

Actions defined in effects must be Generator functions defined through `*`, and asynchronous logic is triggered through the keyword `yield` in the function.

#### Effects

##### put

Used to trigger an action.

```javascript
yield put({ type: 'todos/add', payload: 'Learn Dva' });
```

##### call

Used to call asynchronous logic, supporting promise.

```javascript
const result = yield call(fetch, '/todos');
```

##### select

Used to get data from state.

```javascript
const todos = yield select(state => state.todos);
```

### loading

The framework will by default add a model with the namespace loading, containing information related to loading of asynchronous effects in this model, its state format is as follows:

```js
{
  global: Boolean, // Whether there is really asynchronous request being sent
  models: {
    [modelnamespace]: Boolean, // The loading situation for each specific model
  },
  effects: {
    [modelnamespace/effectname]: Boolean, // The loading situation for each specific effect
  },
}
```

You can use this model to implement loading animations in components.

## Debugging

### redux

Since the underlying layer of dva is based on redux, you can install redux's [development tools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=zh-CN) to view the data and change records in the model.

![reduxdevtool](https://lh3.googleusercontent.com/wfhSnnYEQc3TCXbRTpTloa-XZesgDt0xAogzGoLF1BUCU04aYhdwAjueJYTtDxfRiqjUfC539g=w640-h400-e365)

## References

- [dva official website](https://dvajs.com/)
