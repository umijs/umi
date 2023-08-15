# dva

## Why State Management is Needed

React components construct the final UI based on the state using JSX and styles. The dynamic behavior of the page is achieved through changes in the state. For simple frontend applications, managing application data with the component's own state along with state passing through props from parent components might suffice. However, as the application grows, maintaining complex state within components, along with state passing between components, can lead to data management issues. Even small modifications can result in unforeseen side effects.

Thus, we need pure UI components. Apart from rendering logic, they shouldn't include other concerns (like network requests). Therefore, we need to extract business logic unrelated to rendering and form independent layers (such as the `src/models` folder managed by Umi) to manage it. This approach reduces components to "stateless components," relying solely on props for rendering. As a result, the UI layer doesn't need to deal with non-rendering logic, focusing solely on UI rendering. (Note: The term "component" mainly refers to page components under the `src/pages` directory. For components under the `src/components` directory, they should be general-purpose components, relying solely on props for rendering. They shouldn't have models, and data should be passed through props from page components.)

## Simple Data Sharing

For simple applications that don't require complex data flows, we recommend using the [best practice for simple data flow in the middle-end](./data-flow).

## How Umi Manages State

As shown in the diagram below, Umi includes [Dva](https://dvajs.com) as an integrated state management solution:

![Dva Diagram](https://gw.alipayobjects.com/zos/skylark/48f9ff5f-ab11-4896-9fb6-65cdd83340de/2018/png/dcb7073b-fc0c-4e2c-aa39-93ac249d715c.png)

Data is managed centrally in models defined in the `src/models` directory. Components ideally don't need to manage data; instead, they can use the `connect` function to access data from the model. When actions are triggered on pages, they request backend APIs and modify the data in the model, creating a circular and closed data flow. This approach is inspired by Facebook's [Flux](http://facebook.github.io/flux/) architecture. Let's see how to implement this logic in Umi.

### Configuring Dva

First, you need to configure `dva: {}` to enable Umi's built-in Dva plugin.

### Adding Models

Umi automatically mounts models defined under `src/models`. You only need to create files in the `models` folder to add new models for managing component states.

Starting from Umi 2.0, to better support on-demand loading in mobile H5 projects and organize models for large projects, models under a specific page folder will also be automatically mounted. You can refer to the [directory structure guide](../guides/directory-structure) for the specific structure. However, note that the namespace of the model is global, so you still need to ensure that your namespace is unique (by default, it's the same as the filename). For most projects, we recommend managing models centrally in the `models` folder, and you don't need to use this feature.

Here's an example of a model:

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

### Connecting Components and Models

After creating a model, you can use ES6 decorators to conveniently connect the model to a component. Then, you can access data from the model through `this.props.[modelName]` (where modelName corresponds to the model's namespace, by default, it's the filename).

Here's an example component:

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

The `connect` function adds the `dispatch` method to `this.props`, which you can use to trigger actions in the model. For instance:

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

After dispatching an action, the corresponding effect or reducer defined in the model will be executed based on the action's type.

If it's an effect, you can make backend requests and then trigger a reducer to modify data in the model. After data is modified through a reducer, the component updates based on the latest data. This completes the unidirectional data flow.

## Documentation

### Model Definition

A model can have the following parts:

- `namespace`: The model's namespace, a unique identifier for the model. It's often the same as the filename and can be omitted if they match.
- `state`: The data within the model.
- `effects`: Asynchronous actions used to communicate with the backend.
- `reducers`: Synchronous actions used to modify the state.

### Connect

The `connect` function establishes the connection between a model and a component. It adds relevant data and the `dispatch` method to the component's props. Here's an example:

```jsx
import React, { Component } from 'react';
import { connect } from 'umi';

const mapModelToProps = allModels => {
  return {
    test: 'hello world',
    // props you want to connect to the Component
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

It is recommended to call connect via annotation, which is equivalent to `export default connect(mapModelToProps)(UserInfo);`. connect receives a parameter, which is a method in which you receive all model information and need to return the object to be added to props. In the above example, you can get the string of `hello world` through `this.props.test`.

### Dispatch

The `connect` function not only connects the model to the component but also adds the `this.props.dispatch` method. This method allows you to trigger an action in the model. For example:

```jsx
render() {
  return <div onClick={() => {
   this.props.dispatch({
    type: 'modelnamespace/actionname',
    sometestdata: 'xxx',
    othertestdata: {},
  }).then(() => {
    // it will return a promise
    // action success
  });
  }}>test</div>
}
```

Actions triggered using `this.props.dispatch` can be effects or reducers. Let's explore more about them.

### Reducer

A reducer is a function responsible for modifying data (synchronously, without backend requests). It takes `state` and `action` as arguments and returns the modified state: `(state, action) => state`.

#### Adding, Removing, and Updating

Consider the example of managing todos:

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

#### Modifying Nested Data

It's recommended to have at most one level of nesting to keep the state flat. Deep nesting can lead to complex reducer logic and maintenance challenges.

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

The following example involves deep nesting, which should be avoided as much as possible:

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

Effects are defined within models and represent a type of action primarily used for asynchronous communication with the backend. After triggering an effect and handling asynchronous logic, you can use the `put` method to trigger a reducer and modify the model's data.

Effects use ES6 generator functions to facilitate asynchronous logic. Here's an example:

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

Actions defined in the `effects` section must be generator functions declared with `*`, where asynchronous logic is handled using the `yield` keyword.

#### Effects

##### put

Used to trigger an action.

```javascript
yield put({ type: 'todos/add', payload: 'Learn Dva' });
```

##### call

Used to invoke asynchronous logic, supports promises.

```javascript
const result = yield call(fetch, '/todos');
```

##### select

Used to fetch data from the state.

```javascript
const todos = yield select(state => state.todos);
```

### Loading

Umi automatically adds a global `loading` namespace model that contains information about loading states related to effects. Its state structure is as follows:

```js
{
  global: Boolean, // Whether any asynchronous requests are being sent
  models: {
    [modelnamespace]: Boolean, // Loading status for specific models
  },
  effects: {
    [modelnamespace/effectname]: Boolean, // Loading status for specific effects
  },
}
```

You can use this model to implement loading animations in your components.

## Debugging

### Redux

Since dva is built on top of Redux, you can install the [Redux DevTools extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) to inspect model data and record state changes.

![Redux DevTools](https://lh3.googleusercontent.com/wfhSnnYEQc3TCXbRTpTloa-XZesgDt0xAogzGoLF1BUCU04aYhdwAjueJYTtDxfRiqjUfC539g=w640-h400-e365)

## References

- [Dva Official Website](https://dvajs.com/)
