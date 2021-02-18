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

### Configuration during construction

You can configure the theme of `layout` through the configuration file, in [`config/config.ts`](https://github.com/ant-design/ant-design-pro/blob/4a2cb720bfcdab34f2b41a3b629683329c783690/config/config.ts#L15) write like this:

```tsx
Import {defineConfig} from'umi';

Export const config = defineConfig({
  layout:{
    //Support anything that does not require dom
    // https://procomponents.ant.design/components/layout#prolayout
    Name: "Ant Design",
    Region: correct,
    Layout: "side",
  },
});
```

#### Name

- Type: `string`
- Default value: `name` in package.json

Product name, default package name.

#### Trademark

- Type: `string`
- Default value: Ant Design logo

Product mark

#### theme

- Type: `string`
- Default: `pro`

The specified layout theme, choose between `pro` and `tech` (`tech` is only reflected in Ant's internal framework Bigfish).

#### Locales

- Type: Boolean
- Default value: "false"

With this switch, the plugin will search for `menu in the locales file. [key]`The corresponding copywriting, replace and change the key. This function needs to be configured to use `@umijs/plugin-locale`.

config supports all non-dom configurations and transmits them transparently to [`@ant-design/pro-layout`](https://procomponents.ant.design/components/layout#prolayout).

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

It is not possible to use dom during construction, so some configurations may need to be configured at runtime. We can do the following configuration in [`src/app.tsx`](export const layout = ({):

```tsx
import React from 'react';
import {
  BasicLayoutProps,
  Settings as LayoutSettings,
} from '@ant-design/pro-layout';

export const layout = ({
  initialState,
}: {
  initialState: { settings?: LayoutSettings; currentUser?: API.CurrentUser };
}): BasicLayoutProps => {
  return {
    rightContentRender: () => <RightContent />,
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { currentUser } = initialState;
      const { location } = history;
      // If you are not logged in, redirect to login
      if (!currentUser && location.pathname !== '/user/login') {
        history.push('/user/login');
      }
    },
    menuHeaderRender: undefined,
    ...initialState?.settings,
  };
};
```

The runtime configuration is very flexible, but the corresponding performance may be relatively poor. In addition to the unique configuration supported by the following plugins, the runtime configuration supports all build-time configurations and transparently transmits them to [`@ant-design/pro-layout`](https://procomponents.ant.design/components/layout#prolayout).

#### logout

- Type: `() => void`
- Default: `null`

In the UI that is used to configure the default Layout at runtime, the processing logic of clicking to log out will not be processed by default.

> Note: By default, the exit button will not be displayed on the top right side. You need to cooperate with the `getInitialState` of `@umijs/plugin-intial-state` in the running configuration to return an object before it can be displayed

#### rightRender

- Type: `(initialState) => React.ReactNode`
- Default: Display user name, avatar, logout related components

`InitialState`is obtained from the `@umijs/plugin-initial-state` plugin and needs to be used together.

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
    name: 'Welcome', // compatible with this writing
    icon: 'testicon',
    // more features view
    // https://beta-pro.ant.design/docs/advanced-menu
    // ---
    // open path in new tab
    target: '_blank',
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
    // hide in breadcrumbs
    hideInBreadcrumb: true,
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

> The icon name is the lower case of the component name and then remove the `outlined` or `filled` or `twotone` to obtain the value. Example: The icon name of`<UserOutlined />`is: `user`.

#### flatMenu

- Type: `boolean` The default is false. Only this item is hidden in the menu, and the sub-items are raised up and still displayed.
- Default: `false`

#### access

- Type: `string`

It takes effect when the Layout plugin is used in conjunction with the `@umijs/plugin-access` plugin.

The permission plugin will match the access string configured by the user here with all the permissions of the current user. If the same item is found and the value of the permission is false, the 403 page will be displayed by default when the user accesses the route.

#### locale

-Type: `string`

The internationalization configuration of the menu, the internationalization key is `menu.${submenu-name}.${name}`.

#### icon

-Type: `string`

The antd icon, in order to load the layout plug-in on demand, will automatically convert it to the dom of the Antd icon. Support types can be found in antd (https://ant.design/components/icon-cn/).

#### flatMenu

-Type: `boolean`

Flatten the menu. If you only want the child menu to not show yourself, you can configure it to true

```tsx
const before = [{ name: '111' }, { name: '222', children: [{ name: '333' }] }];
// flatMenu = true
const after = [{ name: '111' }, { name: '222' }, { name: '333' }];
```

#### xxxRender

-Type: `boolean`

If xxxRender is set to false, some layout modules will not be displayed

- `headerRender=false` does not show the top bar
- `footerRender=false` does not show footer
- `menuRender=false` does not show the menu
- `menuHeaderRender=false` does not display the title and logo of the menu

### hideInXXX

-Type: `boolean`

hideInXXX can manage the rendering of the menu.

- `hideChildrenInMenu=true` to hide the child menu
- `hideInMenu=true` hide yourself and submenus
- `hideInBreadcrumb=true` hide in breadcrumbs
