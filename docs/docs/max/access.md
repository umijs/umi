# Permissions

## Activation Method

Enable configuration. Also, `src/access.ts` needs to provide permission configuration.

```ts
export default {
  access: {},
  // The access plugin depends on initial State so both need to be enabled simultaneously
  initialState: {},
};
```

## Introduction

We have designated `src/access.ts` as our permission definition file. This file needs to export a default function, and the exported function will be executed during project initialization. This function needs to return an object, where each value corresponds to a defined permission. Here's how it looks:

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

Here, `initialState` is the data provided by the initialization state plugin `initial-state`. You can use this data to initialize user permissions.

## Configuration

### Extended Route Configuration

In conjunction with the [layout](./layout-menu) plugin, you can easily implement permission control for certain pages. As shown below, only users with the `canReadPageA` permission (defined in `src/access.ts`) can access this page. Otherwise, the built-in permission error page from the Layout plugin will be rendered by default.

```ts
export const routes = [
  {
    path: '/pageA',
    component: 'PageA',
    access: 'canReadPageA', // The key corresponding to a value returned by the permission definition
  },
];
```

### Custom Permission Page Configuration

As mentioned earlier, by default, the built-in permission error page from the Layout plugin will be rendered. If you want to configure a custom permission page, you need to define it in `src/app.tsx`.

```tsx
export const layout: RunTimeLayoutConfig = () => {
  return {
    // Custom 403 page
    unAccessible: <div>'unAccessible'</div>,
    // Custom 404 page
    noFound: <div>'noFound'</div>,
  };
};
```

#### access

- Type: `string`

Corresponds to the permission name.

## API

### useAccess

We provide a hook for components to access permission-related information, as shown below:

```js
import React from 'react';
import { useAccess } from 'umi';

const PageA = (props) => {
  const { foo } = props;
  const access = useAccess();

  if (access.canReadFoo) {
    // If can read Foo, then...
  }

  return <>TODO</>;
};

export default PageA;
```

Combined with the `Access` component, you can easily control the permissions of elements within a page.

### Access

You can use the plugin-provided React hook `useAccess` and the `<Access />` component to control the permissions of your application. The `Access` component supports the following attributes:

#### accessible

- Type: `boolean`

Whether there is permission, typically obtained through `useAccess`.

#### fallback

- Type: `React.ReactNode`

What to display when there is no permission; by default, nothing is displayed.

### children

- Type: `React.ReactNode`

What to display when there is permission.

Here's a complete example:

```js
import React from 'react';
import { useAccess, Access } from 'umi';

const PageA = (props) => {
  const { foo } = props;
  const access = useAccess(); // access members: canReadFoo, canUpdateFoo, canDeleteFoo

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

- The return value `access` of `useAccess()` is the collection of permissions defined in `src/access.ts`, and you can use it to control the execution flow of your component's code.

- The `<Access>` component has two attributes: `accessible` and `fallback`. When `accessible` is `true`, the child component will be rendered. When `accessible` is `false`, the `ReactNode` corresponding to the `fallback` attribute will be rendered.
