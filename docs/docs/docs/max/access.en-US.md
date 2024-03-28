---
order: 7
toc: content
translated_at: '2024-03-17T09:49:43.250Z'
---

# Permissions

## How to Enable

Configuring activation. Requires `src/access.ts` to provide permission configuration.

```ts
export default {
  access: {},
  // access plugin depends on the initial State so it needs to be enabled at the same time
  initialState: {},
};
```

## Introduction

We have agreed that `src/access.ts` is our permission definition file, which needs to export a function by default. The method will be executed when the project is initialized. This method needs to return an object, where each value of the object corresponds to a defined permission. As shown below:

```js
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

Where `initialState` is the data provided by the initialization state plugin `initial-state`, you can use this data to initialize your user permissions.

## Configuration

### Extended Routing Configuration

With the [layout](./layout-menu) plugin, you can easily implement permission control for some pages. As shown below, users can access the page only if they have the canReadPageA permission (defined in `src/access.ts`). Otherwise, it will render the default permission error page built into the Layout plugin by default.

```ts
export const routes = [
  {
    path: '/pageA',
    component: 'PageA',
    access: 'canReadPageA', // Some key of the permission definition return value
  },
];
```

### Custom Permission Page Configuration

As mentioned above, to configure a custom permission page, you need to define it in `src/app.tsx`.

```tsx
export const layout: RunTimeLayoutConfig = () => {
  return {
    // Customize the 403 page
    unAccessible: <div>'unAccessible'</div>,
    // Customize the 404 page
    noFound: <div>'noFound'</div>,
  };
};
```

#### access

- Type: `string`

The corresponding permission name.

## API

### useAccess

We provide a hook for obtaining permission-related information in components, as shown below:

```js
import React from 'react';
import { useAccess } from 'umi';

const PageA = (props) => {
  const { foo } = props;
  the access = useAccess();

  if (access.canReadFoo) {
    // If can read Foo, then...
  }

  return <>TODO</>;
};

export default PageA;
```

Combined with the `Access` component, it's easy to control the permissions of elements within pages.

### Access

You can use the `useAccess` hook and the `<Access />` component provided by the plugin to control permissions in your application. The `Access` component supports the following properties:

#### accessible

- Type: `boolean`

Whether permission is granted, usually obtained through `useAccess` and passed in.

#### fallback

- Type: `React.ReactNode`

The display when there is no permission, by default no content is displayed without permission.

### children

- Type: `React.ReactNode`

What is displayed when permission is granted.

A complete example is as follows:

```js
import React from 'react';
import { useAccess, Access } from 'umi';

const PageA = (props) => {
  const { foo } = props;
  const access = useAccess(); // members of access: canReadFoo, canUpdateFoo, canDeleteFoo

  if (access.canReadFoo) {
    // If can read Foo, then...
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

- The return value `access` of `useAccess()` is the set of permissions defined in `src/access.ts`, which can be used to control the flow of code execution within components.

- The `<Access>` component has two properties: `accessible` and `fallback`. When `accessible` is `true`, it will render the child component; when `accessible` is `false`, it will render the `ReactNode` corresponding to the `fallback` property.
