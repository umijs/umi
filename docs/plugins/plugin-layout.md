# @umijs/plugin-layout

## How to enable

The configuration is turned on.

## Introduction

In order to further reduce the cost of research and development, we tried to build the layout through the umi plug-in. You can have Ant Design's Layout through simple configuration, including navigation and sidebar. So that users do not need to care about the layout.

- The default is Ant Design's Layout [@ant-design/pro-layout](https://www.npmjs.com/package/@ant-design/pro-layout), which supports all its configuration items.
- The sidebar menu data is automatically generated according to the configuration in the route.
- By default, it supports 403/404 processing and Error Boundary for routing.
- Used together with @umijs/plugin-access plug-in, you can control routing permissions.
- Use with @umijs/plugin-initial-state and @umijs/plugin-model to display the default user login information.

> Want a dynamic menu? Check here [Advanced usage of menu](https://beta-pro.ant.design/docs/advanced-menu-cn)

## Configuration

### Build-time configuration

The theme and other configurations of `layout` can be configured through the configuration file.

```tsx
import { defineConfig } from 'umi';

export const config = defineConfig({
  layout: {
    name: 'Ant Design',
    locale: true,
  },
});
```

#### name

- Type: `string`
- Default: `name` in package.json

Product name, the default value is the package name.

#### logo

- Type: `string`
- default: Ant Design Logo

Product Logo

#### theme

- Type: `string`
- Default: `pro`

Specify Layout theme, optional `pro` and `tech` (`tech` only takes effect in Ant's internal framework Bigfish).

#### locale

- Type: `boolean`
- Default: `false`

Whether to start international configuration. After opening, the menu name configured in the route will be used as the key for the internationalization of the menu name. The plug-in will search the locales file for the corresponding copy of `menu.[key]`, and the default value is to change the key. This function needs to be configured with `@umijs/plugin-locale`.

### Runtime configuration

The Layout plug-in allows to log out and customize ErrorBoundary and other functions through runtime configuration.

```tsx | pure
// src/app.js
export const layout = {
  // do something
  logout: () => {},
  // https://procomponents.ant.design/components/layout
  rightRender: (initInfo) => {
    return <Icon />;
  }, // return string || ReactNode;
};
```

In addition to the specific configurations supported by the plugins below, the runtime configuration supports all build-time configurations and transmits them to `@ant-design/pro-layout`.

#### logout

- Type: `() => void`
- Default: `null`

In the UI that is used to configure the default Layout at runtime, the processing logic of clicking to log out will not be processed by default.

> Note: By default, the exit button will not be displayed on the top right side. You need to cooperate with the `getInitialState` of `@umijs/plugin-intial-state` in the running configuration to return an object before it can be displayed

#### rightRender

- Type: `(initialState) => React.ReactNode`
- Default: Display user name, avatar, logout related components

`InitialState`is obtained from the`@umijs/plugin-initial-state` plugin and needs to be used together.

#### onError

- Type: `(error: Error, info: any) => void;`

Callback after an error occurs (some error logs can be reported, management, etc.).

#### ErrorComponent

- Type: `(error: Error) => React.ReactElement<any>;`
- Default: Error page of Ant Design Pro.

The component displayed after the error occurred.

### Extended routing configuration

The Layout plugin will encapsulate more configuration items based on umi's routing, and support more configuration capabilities. Added:

- Sidebar menu configuration.
- Layout routing level display/hide related configuration.
- Combined with the permission plug-in, the configuration type realizes the function of permission routing.

Add the following configuration items:

- menu
- layout
- access

Examples are as follows:

```typescript
//config/route.ts
export const routes: IBestAFSRoute[] = [
  {
    path: '/welcome',
    component: 'IndexPage',
    menu: {
      name: 'Welcome', // compatible with this writing
      icon: 'testicon',
    },
    // more features view
    // https://beta-pro.ant.design/docs/advanced-menu
    // Do not show top bar
    headerRender: false,
    // Do not show footer
    footerRender: false,
    // Do not show the menu
    menuRender: false,
    // Do not show the menu top bar
    menuHeaderRender: false,
    // Permission configuration, need to be used in conjunction with plugin-access
    access: 'canRead',
    // hide child nodes
    hideChildrenInMenu: true,
    // hide yourself and child nodes
    hideInMenu: true,
    // The child item is raised up and still displayed,
    flatMenu: true,
  },
];
```

#### name

- Type: `string`

The name displayed on the menu, otherwise it will not be displayed.

#### icon

- Type: `string`

The Icon displayed on the menu.

> The icon name is the lower case of the component name and then remove the `outlined`or`filled`or`twotone`to obtain the value. Example: The icon name of`<UserOutlined />`is: `user`.

#### flatMenu

- Type: `boolean` The default is false. Only this item is hidden in the menu, and the sub-items are raised up and still displayed.
- Default: `false`

#### access

- Type: `string`

It takes effect when the Layout plugin is used in conjunction with the `@umijs/plugin-access` plugin.

The permission plugin will match the access string configured by the user here with all the permissions of the current user. If the same item is found and the value of the permission is false, the 403 page will be displayed by default when the user accesses the route.
