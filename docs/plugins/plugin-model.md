# @umijs/plugin-model


Simple data flow, which is commonly used for global shared data for mid-Taiwan projects.

## How to enable

Enabled when there are hooks models in the `src/models` directory.

## Introduction

We agree that the files in the `src/models` directory are the model files defined by the project. Each file needs to export a function by default, which defines a Hook, and we will filter out files that do not conform to the specification.

The file name corresponds to the name of the final model. You can consume the data in the model through the API provided by the plugin.

## Configuration

This plugin has no configuration items.

## API

### useModel

`useModel` is a Hook that provides the ability to consume a Model. The usage example is as follows:

```js
import { useModel } from 'umi';

export default () => {
  const { user, fetchUser } = useModel('user');
  return <>hello</>
};
```
