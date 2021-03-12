# @umijs/plugin-access

## 启用方式

有 `src/access.ts` 时启用。

## 介绍

我们约定了 `src/access.ts` 为我们的权限定义文件，该文件需要默认导出一个方法，导出的方法会在项目初始化时被执行。该方法需要返回一个对象，对象的每一个值就对应定义了一条权限。如下所示：

```javascript
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

其中 `initialState` 是通过初始化状态插件 `@umijs/plugin-initial-state` 提供的数据，你可以使用该数据来初始化你的用户权限。

## 配置

### 扩展的路由配置

配合 Layout 插件你可以很简单的实现针对某些页面的权限控制。如下所示，只有拥有了 canReadPageA （在 `src/access.ts` 中定义）权限，用户才可以访问该页面。否则会默认渲染 Layout 插件内置的权限错误页面。

```typescript
// config/route.ts
export const routes = [
  {
    path: '/pageA',
    component: 'PageA',
    access: 'canReadPageA', // 权限定义返回值的某个 key
  },
];
```

#### access

- Type: `string`

对应的权限名称。

## API

### useAccess

我们提供了一个 Hooks 用于在组件中获取权限相关信息，如下所示：

```javascript
import React from 'react';
import { useAccess } from 'umi';

const PageA = (props) => {
  const { foo } = props;
  const access = useAccess();

  if (access.canReadFoo) {
    // 如果可以读取 Foo，则...
  }

  return <>TODO</>;
};

export default PageA;
```

配合 `Access` 组件可以很好简单的实现页面内的元素的权限控制。

### Access

可以在业务组件中使用插件提供的 React hook `useAccess` 以及组件 `<Access />` 对应用进行权限控制了。组件 `Access` 支持的属性如下：

#### accessible

- Type: `boolean`

是否有权限，通常通过 `useAccess`  获取后传入进来。

#### fallback

- Type: `React.ReactNode`

无权限时的显示，默认无权限不显示任何内容。

### children

- Type: `React.ReactNode`

有权限时的显示。

完整示例如下：

```javascript
import React from 'react';
import { useAccess, Access } from 'umi';

const PageA = (props) => {
  const { foo } = props;
  const access = useAccess(); // access 的成员: canReadFoo, canUpdateFoo, canDeleteFoo

  if (access.canReadFoo) {
    // 如果可以读取 Foo，则...
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

`useAccess()` 的返回值 `access` 就是第三步中定义的权限集合，可以利用它进行组件内代码执行流的控制。 `<Access>` 组件拥有 `accessible` 和 `fallback` 两个属性，当 `accessible` 为 `true` 时会渲染子组件，当 `accessible` 为 `false` 会渲染 `fallback` 属性对应的 `ReactNode`。
