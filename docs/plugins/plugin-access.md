# @umijs/plugin-access

## How to enable

Enabled when file `src/access.ts` exists.

## Introduction

The `src/access.ts` file have to export default method. The exported method will be executed when the project is initialized. This method needs to return an object. Each value of the object defines a permission.

Eg.:

```typescript
// src/access.ts
export default function (initialState) {
  const { userId, role } = initialState;

  return {
    canReadFoo: true,
    canUpdateFoo: role === 'admin',
    canDeleteFoo: (foo) => {
      return foo.ownerId === userId;
    },
  };
}
```

You can use `initialState` data provided by `@umijs/plugin-initial-state` plugin to initialize user permissions.

## Configuration

### Extended routing configuration

With the `@umijs/plugin-layout` plug-in, you can easily implement permission control for certain pages. As shown below, users can access this page only if they have the `canReadPageA` permission (defined in `src/access.ts`). Otherwise, the error page which is built in the `@umijs/plugin-layout` plugin will be rendered by default.

The `access` key in route object is `string` containing corresponding permission name.

```typescript
// config/route.ts
export const routes = [
  {
    path: '/pageA',
    component: 'PageA',
    access: 'canReadPageA',
  },
];
```

## Export

- `useAccess` hook
- `<Access>` component.

### useAccess hook

Use `useAccess` hook to obtain permission set defined in the 'src/access.ts`. Example usage:

```typescript
// pages/pageA.ts
import React from 'react';
import { useAccess } from 'umi';

const PageA = (props) => {
  const { foo } = props;
  const access = useAccess();

  if (access.canReadFoo) {
    // user has permission canReadFoo
  }

  return <div>...</div>;
};

export default PageA;
```

### Access component

Provided `<Access>` component can be used to control access to elements in the application.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| accessible | If truthy, `children` will be rendered, otherwise `fallback` will be rendered. | boolean | false |
| children | Node, which is rendered, when `accessible` has truthy value. | ReactNode | - |
| fallback | Node, which is rendered, when `accessible` has falsy value. | ReactNode | - |

By default, no content will be rendered.

The complete example:

```typescript
import React from 'react';
import { useAccess, Access } from 'umi';

const PageA = (props) => {
  const { foo } = props;
  const access = useAccess();

  if (access.canReadFoo) {
    // user has permission canReadFoo
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
