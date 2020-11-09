# @umijs/plugin-layout

## 启用方式

配置开启。

## 介绍

为了进一步降低研发成本，我们尝试将布局通过 umi 插件的方式内置，只需通过简单的配置即可拥有 Ant Design 的 Layout，包括导航以及侧边栏。从而做到用户无需关心布局。

- 默认为 Ant Design 的 Layout [@ant-design/pro-layout](https://www.npmjs.com/package/@ant-design/pro-layout)，支持它全部配置项。
- 侧边栏菜单数据根据路由中的配置自动生成。
- 默认支持对路由的 403/404 处理和 Error Boundary。
- 搭配 @umijs/plugin-access 插件一起使用，可以完成对路由权限的控制。
- 搭配 @umijs/plugin-initial-state 插件和 @umijs/plugin-model 插件一起使用，可以拥有默认用户登陆信息的展示。

> 想要动态菜单？查看这里 [菜单的高级用法](https://beta-pro.ant.design/docs/advanced-menu-cn)

## 配置

### 构建时配置

可以通过配置文件配置 `layout` 的主题等配置。

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

产品名，默认值为包名。

#### logo

- Type: `string`
- default: Ant Design Logo

产品 Logo

#### theme

- Type: `string`
- Default: `pro`

指定 Layout 主题，可选 `pro` 和 `tech`（`tech` 仅在蚂蚁内部框架 Bigfish 中生效）。

#### locale

- Type: `boolean`
- Default: `false`

是否开始国际化配置。开启后路由里配置的菜单名会被当作菜单名国际化的 key，插件会去 locales 文件中查找 `menu.[key]`对应的文案，默认值为改 key。该功能需要配置 `@umijs/plugin-locale` 使用。

### 运行时配置

Layout 插件允许通过运行时的配置退出登陆、自定义 ErrorBoundary 等功能。

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

除了下面的插件支持的特有配置外，运行时配置支持所有的构建时配置并透传给 `@ant-design/pro-layout`。

#### logout

- Type: `() => void`
- Default: `null`

用于运行时配置默认 Layout 的 UI 中，点击退出登录的处理逻辑，默认不做处理。

> 注：默认在顶部右侧并不会显示退出按钮，需要在运行配置中配合`@umijs/plugin-intial-state`的`getInitialState`返回一个对象，才可以显示

#### rightRender

- Type: `(initialState) => React.ReactNode`
- Default: 展示用户名、头像、退出登录相关组件

`initialState` 从 `@umijs/plugin-initial-state` 插件中获取，需要搭配一起使用。

#### onError

- Type: `(error: Error, info: any) => void;`

发生错误后的回调（可做一些错误日志上报，打点等）。

#### ErrorComponent

- Type: `(error: Error) => React.ReactElement<any>;`
- Default: Ant Design Pro 的错误页。

发生错误后展示的组件。

### 扩展的路由配置

Layout 插件会基于 umi 的路由，封装了更多的配置项，支持更多配置式的能力。新增：

- 侧边栏菜单配置。
- 布局路由级别展示/隐藏相关配置。
- 与权限插件结合，配置式实现权限路由的功能。

新增如下配置项：

- menu
- layout
- access

示例如下：

```typescript
//config/route.ts
export const routes: IBestAFSRoute[] = [
  {
    path: '/welcome',
    component: 'IndexPage',
    menu: {
      name: '欢迎', // 兼容此写法
      icon: 'testicon',
    },
    // 更多功能查看
    // https://beta-pro.ant.design/docs/advanced-menu
    // 不展示顶栏
    headerRender: false,
    // 不展示页脚
    footerRender: false,
    // 不展示菜单
    menuRender: false,
    // 不展示菜单顶栏
    menuHeaderRender: false,
    // 权限配置，需要与 plugin-access 插件配合使用
    access: 'canRead',
    // 隐藏子节点
    hideChildrenInMenu: true,
    // 隐藏自己和子节点
    hideInMenu: true,
    // 子项往上提，仍旧展示,
    flatMenu: true,
  },
];
```

#### name

- Type: `string`

菜单上显示的名称，没有则不显示。

#### icon

- Type: `string`

菜单上显示的 Icon。

> icon name 为 组件名小写后去掉 `outlined` 或者 `filled` 或者 `twotone`，所得值。举例：`<UserOutlined />` 的 icon name 即： `user`。

#### flatMenu

- Type: `boolean` 默认为 false 在菜单中只隐藏此项，子项往上提，仍旧展示。
- Default: `false`

#### access

- Type: `string`

当 Layout 插件配合 `@umijs/plugin-access` 插件使用时生效。

权限插件会将用户在这里配置的 access 字符串与当前用户所有权限做匹配，如果找到相同的项，并当该权限的值为 false，则当用户访问该路由时，默认展示 403 页面。
