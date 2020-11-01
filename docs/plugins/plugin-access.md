---
translateHelp: true
---

# @umijs/plugin-access


## How to enable

Enabled when there is `src/access.ts`.

## Introduction

We agreed that `src/access.ts` is our permission definition file, which needs to export a method by default, and the exported method will be executed when the project is initialized. This method needs to return an object, and each value of the object defines a permission. As follows:

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

Among them, ʻinitialState` is the data provided by the initialization state plugin `@umijs/plugin-initial-state`, you can use this data to initialize your user permissions.

## Configuration

### Extended routing configuration

With the Layout plug-in, you can easily implement permission control for certain page numbers. As shown below, users can access this page only if they have the canReadPageA (defined in `src/access.ts`) permission. Otherwise, the permission error page built in the Layout plugin will be rendered by default.

```typescript
// config/route.ts
export const routes =  [
  {
    path: '/pageA',
    component: 'PageA',
    access: 'canReadPageA', // Permission defines one of the return values key
  }
]
```

#### access

* Type: `string`

The corresponding authority name.

## API

### useAccess

We provide a Hooks to obtain permission related information in the component, as shown below:

```javascript
import React from 'react';
import { useAccess } from 'umi';

const PageA = props => {
  const { foo } = props;
  const access = useAccess();
 
  if (access.canReadFoo) {
    // 如果可以读取 Foo，则...
  }
 
  return <>TODO</>;
};

export default PageA;
```

Cooperating with ʻAccess` component can easily realize the access control of the elements in the page.

### Access

You can use the React hook ʻuseAccess` provided by the plug-in and the component `<Access />` in the business component to control the permissions of the application.
The attributes supported by the component ʻAccess` are as follows:

#### accessible

* Type: `boolean`

Whether there is permission or not, it is usually obtained by ʻuseAccess` and then passed in.

#### fallback

* Type: `React.ReactNode`

Display when there is no permission. By default, no content is displayed without permission.

### children

* Type: `React.ReactNode`

Display when authorized.

The complete example is as follows:

```javascript
import React from 'react';
import { useAccess, Access } from 'umi';

const PageA = props => {
  const { foo } = props;
  const access = useAccess(); // access Members: canReadFoo, canUpdateFoo, canDeleteFoo
 
  if (access.canReadFoo) {
    // If Foo can be read, then...
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

The return value of ʻuseAccess()` ʻaccess` is the set of permissions defined in the third step, which can be used to control the code execution flow in the component. The `<Access>` component has two attributes of ʻaccessible` and `fallback`. When ʻaccessible` is `true`, child components will be rendered, and when ʻaccessible` is `false`, `ReactNode corresponding to the `fallback` attribute will be rendered.
