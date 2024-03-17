---
order: 2
toc: content
translated_at: '2024-03-17T09:01:40.363Z'
---

# Layout and Menu

## How to Enable

Configure to enable.

```ts
// config/config.ts
export default {
  layout: {
    title: 'your app title',
  },
};
```

## Introduction

To further reduce R&D costs, we have integrated the layout as a Umi plugin. With simple configurations, you can have the Ant Design Layout ([ProLayout](https://procomponents.ant.design/components/layout)), including the navigation and sidebar. Thus, users don't need to worry about the layout.

- The default is Ant Design's Layout [@ant-design/pro-layout](https://www.npmjs.com/package/@ant-design/pro-layout), supporting all of its configuration items.
- The top navigation/side menu is automatically generated based on the configuration in the route.
- Default support for 403/404 handling of routes and Error Boundary.
- Used in conjunction with the `access` [plugin](./access), it can control route permissions.
- Used in conjunction with the `initial-state` [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/initial-state.ts) and [data flow](./data-flow) plugins, it can display default user login information.

> Want dynamic menus? See here [Advanced Usage of Menu](https://beta-pro.ant.design/docs/advanced-menu-cn)

## Configuration

### Build-time Configuration

The plugin can be enabled through the `layout` property in the `config/config.ts` configuration file.

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  layout: {
    title: 'Ant Design',
    locale: false, // Default is enabled, can be disabled if menu internationalization is not needed
  },
});
```

#### title

- Type: `string`
- Default: `name` in package.json

The product name displayed in the upper left corner of the layout, the default value is the package name.

#### locale

- Type: `boolean`
- Default: `false`

Whether to start internationalization configuration. After enabling, the menu names configured in the route will be treated as the keys for menu name internationalization. The plugin will look for the corresponding text in the locales file for `menu.[key]`, with the default value as that key, and the value of the name field configured in the route is the corresponding key value. If the menu is a multi-level route, assuming a second-level route menu, then the plugin will look for the corresponding text in the locales file for `menu.[key].[key]`. This feature requires the configuration of [`i18n`](./i18n). Can be configured as `false` to disable if menu internationalization is not needed.

### Runtime Configuration

Runtime configuration is written in `src/app.tsx`, with the key as `layout`.

```tsx
import { RunTimeLayoutConfig } from '@umijs/max';

export const layout: RunTimeLayoutConfig = (initialState) => {
  return {
    // Commonly used properties
    title: 'Ant Design',
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',

    // Default layout adjustments
    rightContentRender: () => <RightContent />,
    footerRender: () => <Footer />,
    menuHeaderRender: undefined,

    // Other properties see: https://procomponents.ant.design/components/layout#prolayout
  };
};
```

In addition to the plugin's unique configuration supported below, the runtime configuration supports all the build-time configurations and is passed through to [`@ant-design/pro-layout`](https://procomponents.ant.design/components/layout#prolayout).

#### title

- Type: `string`
- Default: `name` in package.json

The product name displayed in the upper left corner of the layout, the default value is the package name.

#### logo

- Type: `string`
- default: Ant Design Logo

The product logo displayed before the product name in the upper left corner.

#### logout

- Type: `(initialState: any) => void`
- Default: `null`

Used for the default Layout's UI in runtime configuration, handling the logout click logic, by default no action is taken.

> Note: By default, the logout button is not displayed in the upper right corner. It needs to be displayed in conjunction with the runtime configuration `app.ts(x)`'s `getInitialState` returning an object.

#### rightRender

- Type: `(initialState: any) => React.ReactNode`
- Default: Displays the username, avatar, logout-related components

`initialState` is the object returned by `getInitialState` in the runtime configuration `app.ts(x)`.

#### ErrorBoundary

- Type: `ReactNode`
- Default: Ant Design Pro's error page.

The component displayed after an error occurs.

### Extended Route Configuration

The Layout plugin, based on Umi's routing, encapsulates more configuration items, supporting more configuration capabilities. Newly added:

- Sidebar menu configuration.
- Layout route level display/hide related configuration.
- Configuration-style implementation of permission routes by combining with the permissions plugin.

Example as follows:

```typescript
// config/route.ts
export const routes: IBestAFSRoute[] = [
  {
    path: '/welcome',
    component: 'IndexPage',
    name: 'Welcome', // This notation is compatible
    icon: 'testicon',
    // For more features see
    // https://beta-pro.ant.design/docs/advanced-menu
    // ---
    // Open in a new page
    target: '_blank',
    // Don't show the top bar
    headerRender: false,
    // Don't show the footer
    footerRender: false,
    // Don't show the menu
    menuRender: false,
    // Don't show the menu header
    menuHeaderRender: false,
    // Permission configuration, needs to be used with the plugin-access
    access: 'canRead',
    // Hide submenu
    hideChildrenInMenu: true,
    // Hide self and submenu
    hideInMenu: true,
    // Hide in breadcrumb
    hideInBreadcrumb: true,
    // Sub-items up, still displayed,
    flatMenu: true,
  },
];
```

#### name

- Type: `string`

The name displayed on the menu, if absent, that menu is not displayed.

#### icon

- Type: `string`

The antd icon displayed on the menu, to support on-demand loading, the layout plugin will automatically convert it into an Antd icon's dom. The supported types can be found in [antd icon](https://ant.design/components/icon-cn/). Examples:

```ts
// <HomeOutlined /> Line style
icon: 'home'; // Line style can be abbreviated
icon: 'HomeOutlined';

// <HomeFilled /> Solid style
icon: 'HomeFilled';

// <HomeTwoTone /> Two-tone style
icon: 'HomeTwoTone';
```

#### access

- Type: `string`

When used together with the `plugin-access` plugin.

The permissions plugin will match the access string configured by the user here with all of the user's permissions. If a matching item is found, and if the value of that permission is false, then when the user visits that route, a 403 page is displayed by default.

#### locale

- Type: `string`

The internationalization configuration for the menu, the internationalization key is `menu.${submenu-name}.${name}`.

#### flatMenu

- Type: `boolean`

Default is false. When true, this item is only hidden in the menu, and its sub-items are brought up and still displayed.

Flattening the menu, if you only want the sub-level menu to not display itself, it can be configured to true.

```tsx
const before = [{ name: '111' }, { name: '222', children: [{ name: '333' }] }];
// flatMenu = true
const after = [{ name: '111' }, { name: '222' }, { name: '333' }];
```

#### xxxRender

- Type: `boolean`

Setting xxxRender to false, some layout modules can be hidden

- `headerRender=false` Do not show the top bar
- `footerRender=false` Do not show the footer
- `menuRender=false` Do not show the menu
- `menuHeaderRender=false` Do not show the menu's title and logo

#### hideInXXX

- Type: `boolean`

hideInXXX can manage the rendering of the menu.

- `hideChildrenInMenu=true` Hide submenu
- `hideInMenu=true` Hide self and submenu
- `hideInBreadcrumb=true` Hide in breadcrumb
