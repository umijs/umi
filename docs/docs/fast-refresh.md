# Fast Refresh

> Fast Refresh is an official React module hot-reloading (HMR) solution developed by React for React Native. Due to its platform-independent core implementation, it is also suitable for the web.

The most significant feature of Fast Refresh is that in a development environment, it can **preserve component state** and provide **instant feedback** when editing.

## How to Use?

Simply add `fastRefresh: {}` to your [configuration file](/docs/config) to enable it.

The GIF animation below demonstrates the development experience using the Fast Refresh feature. You can see that after modifying the component code, the username and password **retain their state**, which enhances the local development experience.

![](https://gw.alipayobjects.com/zos/antfincdn/B2biHHW6s%24/fast-refresh.gif)

In terms of development workflow, there is no difference from usual. You can edit, save, and preview as usual. The only distinction is the improved feedback experience.

## Limitations

In some cases, maintaining state may not be the expected behavior. Therefore, to ensure reliability, Fast Refresh does not preserve state (remount) in the following situations:

- All Class components are remounted, and their state is reset, including Class components returned by higher-order components.
- Modules that are not pure components, meaning the edited module exports things other than React components.
- In special cases, you can also force a remount (maximum availability guarantee) by adding the `// @refresh reset` comment line anywhere in the source code file.

## Tips

It is recommended to give function components a name, for example:

✅ Good:

```javascript
const Foo = () => {};

export default Foo;
```

❌ Bad:

```javascript
export default () => {};
```

## Frequently Asked Questions

### TypeError: Cannot read property 'forEach' of undefined

Please check the version of the browser extension React DevTools. If it is below version v4, please upgrade to v4. This should resolve the issue. [issue#6432](https://github.com/umijs/umi/issues/6432)
