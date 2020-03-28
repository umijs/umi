# @umijs/plugin-layout


## How to enable

Configuration is on.

## Introduction

In order to further reduce the cost of research and development, we try to build the layout through the umi plug-in. You can have Ant Design's Layout, including navigation and sidebar, through simple configuration. So that the user does not need to care about the layout.

- The default is Ant Design's Layout [@ant-design/pro-layout](https://www.npmjs.com/package/@ant-design/pro-layout), which supports all its configuration items.
- The sidebar menu data is automatically generated based on the configuration in the route.
- 403/404 processing and Error Boundary for routing are supported by default.
- Used in conjunction with the @umijs/plugin-access plugin, you can control routing permissions.
- Used with @umijs/plugin-initial-state plugin and @umijs/plugin-model plugin, you can have a display of the default user login information.

## Configuration

### Build-time configuration

You can configure the theme of `layout` through the configuration file.

```ts
import { defineConfig } from 'umi';

export const config = defineConfig({
  layout:{
    name: 'Ant Design'; 
    locale: true;
  }
});
```

#### name

* Type: `string`
* Default: `name` in package.json

Product name, default is package name.

#### logo

* Type: `string`
* default: Ant Design Logo

Product Logo

#### theme

* Type: `string`
* Default: `pro`

Specify Layout theme, optional `pro` and `tech` (`tech` only works in Ant internal framework Bigfish).

#### locale

* Type: `boolean`
* Default: `false`

Whether to start international configuration. After opening, the menu name configured in the route will be used as the key for the menu name internationalization. The plugin will search the locales file for the text corresponding to `menu.[key]`. The default value is to change the key. This function needs to configure `@umijs/plugin-locale` to use.

### Runtime configuration

The Layout plug-in allows functions such as logout and custom `ErrorBoundary` through runtime configuration.

```js
// src/app.js
export const layout = { 
  logout: () => {}, // do something 
  rightRender:(initInfo)=> { return 'hahah'; },// return string || ReactNode; 
};
```

Except for the specific configurations supported by the following plugins, runtime configuration supports all build-time configurations and is transparently passed to `@ant-design/pro-layout`.

#### logout

* Type: `() => void`
* Default: `null`

In the UI used to configure the default layout at runtime, click to log out of the processing logic. No processing is performed by default.

#### rightRender

* Type: `(initialState) => React.ReactNode`
* Default: Display username, avatar, logout related components

`initialState` is obtained from the `@umijs/plugin-initial-state` plugin and needs to be used together.

#### onError

* Type: `(error: Error, info: any) => void;`

Callback after an error occurs (you can do some error log reporting, RBI, etc.).

#### ErrorComponent

* Type: `(error: Error) => React.ReactElement<any>;`
* Default: Ant Design Pro 的错误页。

The component to display after an error occurs.

### Extended routing configuration

The Layout plug-in will encapsulate more configuration items based on umi's routing and support more configuration capabilities. Added:

• Sidebar menu configuration.
• Layout routing level shows/hides related configurations.
• Combined with the permission plug-in, the profile implements the function of permission routing.

Added the following configuration items:

• menu
• layout
• access

Examples are:

```typescript
//config/route.ts
export const routes: IBestAFSRoute[] =  [
  {
    path: '/welcome',
    component: 'IndexPage',
    menu: {
      name: 'welcome', // Compatible with this writing
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

Icon displayed on the menu.

#### menu

* Type: `false` | `IRouteMenuConfig`
* Default: `false`

SideMenu related configuration. The default is false, which means that this item is hidden from the menu including sub-items.

The configurable items of menu include:

1. name

* Type:  `string`
The name of the current menu. There is no default value. It is required.

2. icon

* Type: `string`
The icon on the left of the current menu, optional icon name and url of antd, optional.

3. hideChildren

* Type: `boolean`
Hide his children in the menu and show only himself.

4. flatMenu

* Type: `boolean`
The default is false. Only the item is hidden in the menu, and the sub-items are raised up and still displayed.


#### layout

* Type: false | IRouteLayoutConfig
* Default: false

Layout related configuration. The default is false, which displays the selected layout theme by default.

The configurable items of layout include:

1. hideMenu

* Type: `boolean`
* Default: `false`

The current route hides the menu on the left. It is not hidden by default.

2. hideNav

* Type: `boolean`
* Default: `false`

The current route hides the navigation header. It is not hidden by default.

#### access

* Type: `string`

Takes effect when the Layout plugin is used with the `@umijs/plugin-access` plugin.

The permissions plugin will match the access string configured by the user with all the permissions of the current user. If the same entry is found and the value of the permission is false, when the user accesses the route, the 403 page is displayed by default.
