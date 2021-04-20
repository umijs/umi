---
translateHelp: true
---

# 快速刷新（Fast Refresh）

> 快速刷新（Fast Refresh）是 React 官方为 React Native 开发的模块热替换（HMR）方案，由于其核心实现与平台无关，同时也适用于 Web。

Fast Refresh 功能最大的特性是：开发环境下，可以**保持组件状态**，同时编辑提供**即时反馈**。

## 怎样使用？

在[配置文件](/docs/config)加上 `fastRefresh: {}` 即可开启

这张 gif 动图展示的是使用 Fast Refresh 特性的开发体验，可以看出，修改组件代码后，用户名和密码**状态保持**，这将提升应用本地研发体验。

![](https://gw.alipayobjects.com/zos/antfincdn/B2biHHW6s%24/fast-refresh.gif)

开发方式上与平时没有区别，正常地修改、保存、预览，只是在效果反馈上，体验更加好。

## 限制

有些情况下，维持状态并不是预期，所以为了可靠起见，Fast Refresh 遇到以下情况一概不保留状态（remount）：

- Class 类组件一律重刷（remount），状态会被重置，包括高阶组件返回的 Class 组件
- 不纯组件模块，所编辑的模块除导出 React 组件外，还导出了其它模块
- 特殊的，还可以通过 `// @refresh reset` 指令（在源码文件中任意位置加上这行注释）强制重刷（remount），最大限度地保证可用性

## 技巧

推荐写函数命名组件，例如：

✅ Good:

```javascript
const Foo = () => {};

export default Foo;
```

❌ Bad:

```javascript
export default () => {};
```

## FAQ

### TypeError: Cannot read property 'forEach' of undefined

Please check the version of the browser extension React DevTools, whether it is less than v4, and please upgrade to v4 version can be solved.[issue#6432](https://github.com/umijs/umi/issues/6432)
