
# @umijs/plugin-model

A simple state management solution based on `hooks` (can be replacement of `dva` in some cases).

We've already know that custom `hooks` is designed for sharing stateful logics between components(states are fully isolated). So what if we need a way to share both logic and state just like `dva`, `mobx` provided? `@umijs/plugin-model` is what you are seeking for.

## how to enable

While hooks model file exists in`src/models`.

## introduction

There is convention here, we scan hooks model files only in `src/models`. And only valid custom hooks module will be registered.

hooks model file name will be the `namespace` you are going to learn in [API/useModel](#usemodel) section.

No black magic, hooks model file is just normal custom hooks module. See below example:

**src/models/useAuthModel.js**

```js
import { useState, useCallback } from 'react'

export default function useAuthModel() {
  const [user, setUser] = useState(null)

  const signin = useCallback((account, password) => {
    // signin implementation
    // setUser(user from signin API)
  }, [])

  const signout = useCallback(() => {
    // signout implementation
    // setUser(null)
  }, [])

  return {
    user,
    signin,
    signout
  }
}
```

> `@umijs/plugin-model` will make states defined in hooks models as shared states automatically.


### use model in components

See [API/useModel](#usemodel)

## configuration

No configuration.

## API

### useModel

`useModel` is a custom hooks that provide developer the ability to consume hooks model：

```js
import { useModel } from 'umi';

export default () => {
  const { user, fetchUser } = useModel('user', model => ({ user: model.user, fetchUser: model.fetchUser }));
  return <>hello</>
};
```

`useModel` has two arguments, `namespace` and `updater`.

- `namespace` - file name of hooks model, for example, `useAuthModel` in above section.
- `updater` - optional. We will need it only if rerender on demand is required(performance related).
