---
translateHelp: true
---

# @umijs/plugin-layout


## How to enable

The configuration is turned on.

## Introduction

In order to further reduce the cost of research and development, we tried to build the layout through the umi plug-in. You can have Ant Design's Layout through simple configuration, including navigation and sidebar. So that users do not need to care about the layout.

-The default is Ant Design's Layout [@ant-design/pro-layout](https://www.npmjs.com/package/@ant-design/pro-layout), which supports all its configuration items.
-The sidebar menu data is automatically generated according to the configuration in the route.
-By default, 403/404 processing and Error Boundary for routing are supported.
-Used together with @umijs/plugin-access plug-in, you can control routing permissions.
-Use with @umijs/plugin-initial-state and @umijs/plugin-model to display the default user login information.

## Configuration

### Build-time configuration

The theme of `layout` can be configured through the configuration file.

```ts
import { defineConfig } from 'umi';

export const config = defineConfig({
  layout:{
    name: 'Ant Design', 
    locale: true,
  }
});
```

#### name

* Type: `string`
* Default: `name` in package.json

Product name, the default value is the package name.

#### logo

* Type: `string`
* default: Ant Design Logo

产品 Logo

#### theme

* Type: `string`
* Default: `pro`

Specify Layout theme, optional `pro` and `tech` (`tech` only works in Ant's internal framework Bigfish).

#### locale

* Type: `boolean`
* Default: `false`

Whether to start international configuration. After opening, the menu name configured in the route will be used as the key for the internationalization of the menu name. The plug-in will search the locales file for the corresponding copy of `menu.[key]`, and the default value is to change the key. This function needs to be configured with `@umijs/plugin-locale`.

### Runtime configuration

The Layout plug-in allows functions such as logout and custom ErrorBoundary through runtime configuration.

```js
// src/app.js
export const layout = { 
  logout: () => {}, // do something 
  rightRender:(initInfo)=> { return 'hahah'; },// return string || ReactNode; 
};
```

In addition to the specific configurations supported by the plugins below, the runtime configuration supports all build-time configurations and transmits them to `@ant-design/pro-layout`.

#### logout

* Type: `() => void`
* Default: `null`

In the UI that is used to configure the default Layout at runtime, the processing logic of clicking to log out is not processed by default.

> Note: By default, the exit button will not be displayed on the right side of the top. You need to cooperate with the `getInitialState` of `@umijs/plugin-intial-state` in the running configuration to return an object before it can be displayed

#### rightRender

* Type: `(initialState) => React.ReactNode`
* Default: Display user name, avatar, logout related components

ʻInitialState` is obtained from the `@umijs/plugin-initial-state` plugin and needs to be used together.

#### onError

* Type: `(error: Error, info: any) => void;`

Callback after an error occurs (some error logs can be reported, management, etc.).

#### ErrorComponent

* Type: `(error: Error) => React.ReactElement<any>;`
* Default: Error page of Ant Design Pro.

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
    path:'/welcome',
    component:'IndexPage',
    menu: {
      name:'Welcome', // compatible with this writing
      icon: 'testicon',
    },
    layout:{
      hideNav: true,
    },
    access: 'canRead',
  }
]
```

#### name

* Type: `string`

The name displayed on the menu, otherwise it will not be displayed.

#### icon

* Type: `string`

The Icon displayed on the menu.

#### menu

* Type: `false` | `IRouteMenuConfig`
* Default: `false`

SideMenu related configuration. The default is false, which means that this item and its sub-items are hidden in the menu.

The configurable items of menu include:

1. name

* Type: `string`
The name of the current menu, no default value, must be selected, if you leave it blank, it will not be displayed

2. icon

* Type: `string`
The icon on the left side of the current menu, optional icon name and url of antd, optional.

> The icon name is the lower case of the component name and then remove the ʻoutlined` or `filled` or `twotone` to obtain the value. Example: The icon name of `<UserOutlined />` is: ʻuser`.

3. hideChildren

* Type: `boolean`
Hide his sub-items in the menu and only show yourself.

4. flatMenu

* Type: `boolean`
The default is false. Only this item is hidden in the menu, and the sub-items are lifted up and still displayed.


#### layout

* Type: false | IRouteLayoutConfig
* Default: false

Layout related configuration. The default is false, the selected layout theme is displayed by default.

The configurable items of layout include:

1. hideMenu

* Type: `boolean`
* Default: `false`

The current route hides the left menu and is not hidden by default.

2. hideNav

* Type: `boolean`
* Default: `false`

The current route hides the navigation header and is not hidden by default.

#### access

* Type: `string`

It takes effect when the Layout plugin is used in conjunction with the `@umijs/plugin-access` plugin.

The permission plugin will match the access string configured by the user here with all the permissions of the current user. If the same item is found and the value of the permission is false, the 403 page will be displayed by default when the user accesses the route.
