# Fast Refresh

> Fast Refresh is the official Hot Module Replacement (HMR) solution developed by React for React Native, and is also available for the Web as its core implementation is platform independent.

Fast Refresh the biggest feature: the ability to **maintain component state** in the development environment while the editor provides **immediate feedback**.

## How to use

Add `fastRefresh: {}` to the [configuration file](/docs/config)

This image shows the development experience of the Fast Refresh. As you can see, the username and password state is **maintained** after the code is modified, which will enhance the development experience.

![](https://gw.alipayobjects.com/zos/antfincdn/B2biHHW6s%24/fast-refresh.gif)

There is no difference in the develop as usual, modify, save and preview normally, just a better experience in feedback.

## Restrictions

In some cases, maintaining state is not expected, and for reliability, Fast Refresh does not retain state when it encounters:

- Class components are always remounted and the state is reset, including Class components returned by HOC
- The module edited by not-pure-component modules also exports other modules except for React components
- Especially, for the sake of availability you can also force a remount with the `// @refresh reset` directive (comment this line anywhere in the source code file).

## Tips

It is recommended to use function components, e.g.

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
