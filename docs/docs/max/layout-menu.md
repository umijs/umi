# Layout and Menu

## Activation

Configure the activation in the following way.

```ts
// config/config.ts
export default {
  layout: {
    title: 'your app title',
  },
};
```

## Introduction

To further reduce development costs, we've integrated the layout through Umi plugins, allowing you to easily possess Ant Design's Layout ([ProLayout](https://procomponents.ant.design/components/layout)) with simple configuration. This includes navigation and sidebars. As a result, users do not need to concern themselves with the layout.

- Defaults to Ant Design's Layout [@ant-design/pro-layout](https://www.npmjs.com/package/@ant-design/pro-layout), supporting all of its configuration options.
- Top navigation/sidebar menus are automatically generated based on route configurations.
- Default support for 403/404 handling and Error Boundary for routes.
- When used together with the `access` [plugin](./access), it can complete route permission control.
- When used together with the `initial-state` [plugin](https://github.com/umijs/umi/blob/master/packages/plugins/src/initial-state.ts) and [data flow](./data-flow) plugin, it can display default user login information.

> Need dynamic menus? Check out the [advanced menu usage](https://beta-pro.ant.design/docs/advanced-menu-cn) here.

## Configuration

### Build-time Configuration

You can enable the plugin by configuring the `layout` property in the `config/config.ts` file.

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  layout: {
    title: 'Ant Design',
    locale: false, // Enable by default, can be turned off if menu internationalization is not needed
  },
});
```

#### title

- Type: `string`
- Default: `name` in package.json

The product name displayed in the upper left corner of the layout, with the default value being the package name.

#### locale

- Type: `boolean`
- Default: `false`

Whether to enable internationalization configuration. When enabled, the menu name configured in the route will be treated as the key for menu internationalization. The plugin will look up the corresponding text of `menu.[key]` in the locales file. The default value is the same as the key. The value of the `name` field in the route configuration is the corresponding key value. If the menu is a multi-level route, assuming it is a second-level route menu, the plugin will look up the corresponding text of `menu.[key].[key]` in the locales file. This feature requires configuration with [`i18n`](./i18n). If menu internationalization is not needed, it can be configured as `false`.

### Runtime Configuration

Runtime configuration is written in `src/app.tsx`, with the key being `layout`.

```tsx
import { RunTimeLayoutConfig } from '@umijs/max';

export const layout: RunTimeLayoutConfig = (initialState) => {
  return {
    // Common properties
    title: 'Ant Design',
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',

    // Default layout adjustments
    rightContentRender: () => <RightContent />,
    footerRender: () => <Footer />,
    menuHeaderRender: undefined,

    // Other properties, see: https://procomponents.ant.design/components/layout#prolayout
  };
};
```

In addition to the specific configurations supported by the plugins below, runtime configurations support all build-time configurations and pass them to [`@ant-design/pro-layout`](https://procomponents.ant.design/components/layout#prolayout).

#### title

- Type: `string`
- Default: `name` in package.json

The product name displayed in the upper left corner of the layout, with the default value being the package name.

#### logo

- Type: `string`
- Default: Ant Design Logo

The product logo displayed in front of the product name in the upper left corner of the layout.

#### logout

- Type: `(initialState: any) => void`
- Default: `null`

The logic for handling logout when the default UI of the Layout plugin is clicked. Default behavior is to do nothing.

> Note: By default, the logout button will not be displayed on the upper right side. It needs to be returned as an object in the `getInitialState` function in the runtime configuration in order to be displayed.

#### rightRender

- Type: `(initialState: any) => React.ReactNode`
- Default: Displays components related to usernames, avatars, and logout

`initialState` is the object returned by the `getInitialState` function in the runtime configuration `app.ts(x)`.

#### onError

- Type: `(error: Error, info: any) => void;`

Callback that is triggered after an error occurs (can be used for error logging, tracking, etc.).

#### ErrorComponent

- Type: `(error: Error) => React.ReactElement<any>;`
- Default: Ant Design Pro's error page.

The component displayed after an error occurs.

### Extended Route Configuration

The Layout plugin encapsulates more configuration options based on Umi's routes, supporting more configurative capabilities. New additions include:

- Sidebar menu configuration.
- Layout-level display/hide configurations for routes.
- Combining with the permission plugin to achieve functionality for permission routes.

An example is as follows:

```typescript
// config/route.ts
export const routes: IBestAFSRoute[] = [
  {
    path: '/welcome',
    component: 'IndexPage',
    name: 'Welcome', // Also compatible with this writing style
    icon: 'testicon',
    // More functionality can be found at
    // https://beta-pro.ant.design/docs/advanced-menu
    // ---
    // Open in a new page
    target: '_blank',
    // Do not display the top bar
    headerRender: false,
    // Do not display the footer
    footerRender: false,
    // Do not display the menu
    menuRender: false,
    // Do not display the menu title and logo
    menuHeaderRender: false,
    // Permission configuration, needs to be used in conjunction with the plugin-access plugin
    access: 'canRead',
    // Hide child menu
    hideChildrenInMenu: true,
    // Hide itself and child menu
    hideInMenu: true,
    // Hide in breadcrumbs
    hideInBreadcrumb: true,
    // Lift children up and display themselves,
    flatMenu: true,
  },
];
```

#### name

- Type: `string`

The name displayed on the menu. If not provided, the menu will not be displayed.

#### icon

- Type: `string`

The Antd icon displayed on the menu. To enable on-demand loading, the layout plugin will automatically convert it to the Antd icon's DOM element. Supported types can be found in [antd icon](https://ant.design/components/icon-cn/). Examples:

```ts
// <HomeOutlined /> Outline style
icon: 'home'; // Outlined style can be abbreviated
icon: 'HomeOutlined';

// <HomeFilled /> Solid style
icon: 'HomeFilled';

// <HomeTwoTone /> Two-tone style
icon: 'HomeTwoTone';
```

#### access

- Type: `string`

Effective when the Layout plugin is used in conjunction with the `plugin-access` plugin.

The permission plugin will match the access string configured by the user here with all the permissions of the current user. If a matching item is found and the value of this permission is false, the 403 page will be displayed by default when the user accesses this route.

#### locale

- Type: `string`

Internationalization configuration for the menu, with the key for internationalization being `menu.${submenu-name}.${name}`.

#### flatMenu

- Type: `boolean`

Defaults to false. When true, the menu is hidden, and the child item is lifted up to continue being displayed.

Flattening the menu allows the menu's child level to not display itself and only display its sub-items.

```tsx
const before = [{ name: '111' }, { name: '222', children: [{ name: '333' }] }];
// flatMenu = true
const after = [{ name: '111' }, { name: '222' }, { name: '333' }];
```

#### xxxRender

- Type: `boolean`

The xxxRender setting to false does not display parts of the layout module.

- `headerRender=false` Do not display the top bar
- `footerRender=false` Do not display the footer
- `menuRender=false` Do not display the menu
- `menuHeaderRender=false` Do not display the menu title and logo

#### hideInXXX

- Type: `boolean`

hideInXXX can manage the rendering of the menu.

- `hideChildrenInMenu=true` Hide the child menu
- `hideInMenu=true` Hide itself and the child menu
- `hideInBreadcrumb=true` Hide in breadcrumbs
