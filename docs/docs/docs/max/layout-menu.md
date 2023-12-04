---
order: 2
toc: content
---
# 布局与菜单

## 启用方式

配置开启。

```ts
// config/config.ts
export default {
  layout: {
    title: 'your app title',
  },
};
```

## 介绍

为了进一步降低研发成本，我们将布局通过 Umi 插件的方式内置，只需通过简单的配置即可拥有 Ant Design 的 Layout（[ProLayout](https://procomponents.ant.design/components/layout)），包括导航以及侧边栏。从而做到用户无需关心布局。

- 默认为 Ant Design 的 Layout [@ant-design/pro-layout](https://www.npmjs.com/package/@ant-design/pro-layout)，支持它全部配置项。
- 顶部导航/侧边栏菜单根据路由中的配置自动生成。
- 默认支持对路由的 403/404 处理和 Error Boundary。
- 搭配 `access` [插件](./access)一起使用，可以完成对路由权限的控制。
- 搭配 `initial-state` [插件](https://github.com/umijs/umi/blob/master/packages/plugins/src/initial-state.ts) 和 [数据流](./data-flow) 插件一起使用，可以拥有默认用户登陆信息的展示。

> 想要动态菜单？查看这里 [菜单的高级用法](https://beta-pro.ant.design/docs/advanced-menu-cn)

## 配置

### 构建时配置

可以通过配置文件 `config/config.ts` 中的 `layout` 属性开启插件。

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  layout: {
    title: 'Ant Design',
    locale: false, // 默认开启，如无需菜单国际化可关闭
  },
});
```

#### title

- Type: `string`
- Default: `name` in package.json

显示在布局左上角的产品名，默认值为包名。

#### locale

- Type: `boolean`
- Default: `false`

是否开始国际化配置。开启后路由里配置的菜单名会被当作菜单名国际化的 key，插件会去 locales 文件中查找 `menu.[key]`对应的文案，默认值为该 key，路由配置的 name 字段的值就是对应的 key 值。如果菜单是多级路由假设是二级路由菜单，那么插件就会去 locales 文件中查找 `menu.[key].[key]`对应的文案，该功能需要配置 [`i18n`](./i18n) 使用。如无需菜单国际化可配置 `false` 关闭。

### 运行时配置

运行时配置写在 `src/app.tsx` 中，key 为 `layout`。

```tsx
import { RunTimeLayoutConfig } from '@umijs/max';

export const layout: RunTimeLayoutConfig = (initialState) => {
  return {
    // 常用属性
    title: 'Ant Design',
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',

    // 默认布局调整
    rightContentRender: () => <RightContent />,
    footerRender: () => <Footer />,
    menuHeaderRender: undefined,

    // 其他属性见：https://procomponents.ant.design/components/layout#prolayout
  };
};
```

除了下面的插件支持的特有配置外，运行时配置支持所有的构建时配置并透传给 [`@ant-design/pro-layout`](https://procomponents.ant.design/components/layout#prolayout)。

#### title

- Type: `string`
- Default: `name` in package.json

显示在布局左上角的产品名，默认值为包名。

#### logo

- Type: `string`
- default: Ant Design Logo

显示在布局左上角产品名前的产品 Logo。

#### logout

- Type: `(initialState: any) => void`
- Default: `null`

用于运行时配置默认 Layout 的 UI 中，点击退出登录的处理逻辑，默认不做处理。

> 注：默认在顶部右侧并不会显示退出按钮，需要在运行配置中配合运行时配置 `app.ts(x)` 中的 `getInitialState` 返回一个对象，才可以显示

#### rightRender

- Type: `(initialState: any) => React.ReactNode`
- Default: 展示用户名、头像、退出登录相关组件

`initialState` 是运行时配置 `app.ts(x)` 中的 `getInitialState` 返回的对象。

#### ErrorBoundary

- Type: `ReactNode`
- Default: Ant Design Pro 的错误页。

发生错误后展示的组件。

### 扩展的路由配置

Layout 插件会基于 Umi 的路由，封装了更多的配置项，支持更多配置式的能力。新增：

- 侧边栏菜单配置。
- 布局路由级别展示/隐藏相关配置。
- 与权限插件结合，配置式实现权限路由的功能。

示例如下：

```typescript
// config/route.ts
export const routes: IBestAFSRoute[] = [
  {
    path: '/welcome',
    component: 'IndexPage',
    name: '欢迎', // 兼容此写法
    icon: 'testicon',
    // 更多功能查看
    // https://beta-pro.ant.design/docs/advanced-menu
    // ---
    // 新页面打开
    target: '_blank',
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
    // 隐藏子菜单
    hideChildrenInMenu: true,
    // 隐藏自己和子菜单
    hideInMenu: true,
    // 在面包屑中隐藏
    hideInBreadcrumb: true,
    // 子项往上提，仍旧展示,
    flatMenu: true,
  },
];
```

#### name

- Type: `string`

菜单上显示的名称，没有则不展示该菜单。

#### icon

- Type: `string`

菜单上显示的 antd 的 icon，为了按需加载 layout 插件会帮你自动转化为 Antd icon 的 dom。支持类型可以在 [antd icon](https://ant.design/components/icon-cn/) 中找到。示例：

```ts
// <HomeOutlined /> 线框风格
icon: 'home'; // outlined 线框风格可简写
icon: 'HomeOutlined';

// <HomeFilled /> 实底风格
icon: 'HomeFilled';

// <HomeTwoTone /> 双色风格
icon: 'HomeTwoTone';
```

#### access

- Type: `string`

当 Layout 插件配合 `plugin-access` 插件使用时生效。

权限插件会将用户在这里配置的 access 字符串与当前用户所有权限做匹配，如果找到相同的项，并当该权限的值为 false，则当用户访问该路由时，默认展示 403 页面。

#### locale

- Type: `string`

菜单的国际化配置，国际化的 key 是 `menu.${submenu-name}.${name}`。

#### flatMenu

- Type: `boolean`

默认为 false，为 true 时在菜单中只隐藏此项，子项往上提，仍旧展示。

打平菜单，如果只想要子级的 menu 不展示自己的，可以配置为 true。

```tsx
const before = [{ name: '111' }, { name: '222', children: [{ name: '333' }] }];
// flatMenu = true
const after = [{ name: '111' }, { name: '222' }, { name: '333' }];
```

#### xxxRender

- Type: `boolean`

xxxRender 设置为 false，即可不展示部分 layout 模块

- `headerRender=false` 不显示顶栏
- `footerRender=false` 不显示页脚
- `menuRender=false` 不显示菜单
- `menuHeaderRender=false` 不显示菜单的 title 和 logo

#### hideInXXX

- Type: `boolean`

hideInXXX 可以管理 menu 的渲染。

- `hideChildrenInMenu=true` 隐藏子菜单
- `hideInMenu=true` 隐藏自己和子菜单
- `hideInBreadcrumb=true` 在面包屑中隐藏
