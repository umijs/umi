# @umijs/plugin-access


## How to enable

Enable when `src/access.ts` is present.

## Introduction

We agreed on `src/access.ts` to define our permissions file. This file needs to export a method by default. The exported method will be executed when the project is initialized. This method needs to return an object, and each value of the object defines a permission. As follows:

```javascript
// src/access.ts
export default function(initialState) {
  const { userId, role } = initialState;
 
  return {
    canReadFoo: true,
    canUpdateFoo: role === 'admin',
    canDeleteFoo: foo => {
      return foo.ownerId === userId;
    },
  };
}
```

The `initialState` is the data provided by the initial state plugin` @umijs/plugin-initial-state`. You can use this data to initialize your user permissions.

## Configuration

### Extended routing configuration

With the Layout plugin, you can easily implement permission control for certain page numbers. As shown below, users can access the page only if they have the canReadPageA (defined in `src/access.ts`) permission. Otherwise, the permission error page built into the Layout plugin will be rendered by default.

```typescript
// config/route.ts
export const routes =  [
  {
    path: '/pageA',
    component: 'PageA',
    access: 'canReadPageA', // A key for the permission definition return value
  }
]
```

#### access

* Type: `string`

Corresponding permission name.

## API

### useAccess

We provide a Hooks to get permission related information in the component as follows:

```javascript
import React from 'react';
import { useAccess } from 'umi';

const PageA = props => {
  const { foo } = props;
  const access = useAccess();
 
  if (access.canReadFoo) {
    // If Foo can be read, then ...
  }
 
  return <>TODO</>;
};

export default PageA;
```

With the `Access` component, the permission control of the elements in the page can be implemented very easily.

### Access

You can use the React hook `useAccess` provided by the plug-in and the component `<Access /> `in the business component to control the permissions of the application.
The component `Access` supports the following attributes:

#### accessible

* Type: `boolean`

Whether there is permission, usually through `useAccess`.

#### fallback

* Type: `React.ReactNode`

Displayed when there is no permission. By default, no content is displayed.

### children

* Type: `React.ReactNode`

Displayed when authorized.

The complete example is as follows:

```javascript
import React from 'react';
import { useAccess, Access } from 'umi';

const PageA = props => {
  const { foo } = props;
  const access = useAccess(); // members of access: canReadFoo, canUpdateFoo, canDeleteFoo
 
  if (access.canReadFoo) {
    // If Foo can be read, then ...
  }
 
  return (
    <div>
      <Access
        accessible={access.canReadFoo}
        fallback={<div>Can not read foo content.</div>}
      >
        Foo content.
      </Access>
      <Access
        accessible={access.canUpdateFoo}
        fallback={<div>Can not update foo.</div>}
      >
        Update foo.
      </Access>
      <Access
        accessible={access.canDeleteFoo(foo)}
        fallback={<div>Can not delete foo.</div>}
      >
        Delete foo.
      </Access>
    </div>
  );
};
```

The return value of `useAccess()` is the access set defined in step 3. You can use it to control the code execution flow in the component. The `<Access>` component has two attributes: `accessible` and `fallback`. When `accessible` is `true`, the child component is rendered. When `accessible` is `false`, the `ReactNode` corresponding to the `fallback`property.
