---
sidebarDepth: 3
---

# FAQ

## General

### Can it be used in a production environment?

Umi is the underlying front-end framework of Ant Financial, which has directly or indirectly served 600+ applications, including java, node, H5 wireless, Hybrid applications, pure front-end assets applications, CMS applications, and more.

### How do I view the version numbers such as react, react-dom, and react-router?

```bash
$ umi -v --verbose

umi@2.0.0
darwin x64
node@v10.6.0
umi-build-dev@1.0.0
af-webpack@1.0.0
babel-preset-umi@1.0.0
umi-test@1.0.0
react@16.4.2 (/Users/chencheng/code/github.com/ant-design/ant-design-pro/node_modules/react)
react-dom@16.4.2 (/Users/chencheng/code/github.com/ant-design/ant-design-pro/node_modules/react-dom)
react-router@4.3.1 (/Users/chencheng/code/github.com/umijs/umi/packages/umi-build-dev/node_modules/react-router)
react-router-dom@4.3.1 (/Users/chencheng/code/github.com/ant-design/ant-design-pro/node_modules/react-router-dom)
dva@2.4.0 (/Users/chencheng/code/github.com/ant-design/ant-design-pro/node_modules/dva)
dva-loading@2.0.5
dva-immer@0.2.3
path-to-regexp@1.7.0
```

### How to introduce @babel/polyfill?

Install dependencies first,

```bash
$ yarn add @babel/polyfill
```

Then create a new `src/global.js` with the following contents:

```js
import '@babel/polyfill';
```

### How to dynamically modify the title?

The title can be dynamically modified via [react-helmet](https://github.com/nfl/react-helmet).
> Note: In a hybrid application, if you use react-helmet in the ios web container, you can try [react-document-title](https://github.com/gaearon/react-document-title).

## Reporting Error

### `Object.values` is not a function

E.g.

<img src="https://gw.alipayobjects.com/zos/rmsportal/mTaaEfxKkkGAQicDOSeb.png" />

Upgrade the node version and make sure the version is 8.10 or greater.

### `exports is not defined`

E.g.

<img src="https://gw.alipayobjects.com/zos/rmsportal/fLNyyPNyquAGoYQxxIDI.png" />

Check the babel configuration to remove unnecessary presets and plugins.

### `Plugin umi-plugin-react:pwa initialize failed`

E.g.

<img src="https://gw.alipayobjects.com/zos/rmsportal/lSuOXlbtrZPLoMaLBODj.png" />

Make sure you have package.json and have configured the `name` attribute.

### `Conflicting order between [mini-css-extract-plugin]`

E.g.

<img src="https://gw.alipayobjects.com/zos/rmsportal/mjzdexbrmZulkjCAqzPC.png" />

This is [a problem with the webpack plugin](https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250), which does not affect the normal production of CSS files and can be ignored for now.

### `umi` is not an internal or external command

E.g.

<img src="https://gw.alipayobjects.com/zos/rmsportal/fatmbcGwSOwDntHjmrtG.png" />

You need to configure the NODE_PATH environment variable. If you use yarn, you can get the bin path by executing `yarn global bin`.

## webpack

### How to configure additional loader?

For example, I hope .svg not to produce base64, but to generate svg files, which can be configured like this:

```js
export default {
  // Add exclude for url-loader
  urlLoaderExcludes: [/.svg$/],
  // Add loader
  chainWebpack(config) {
    config.module.rule('svg-with-file')
      .test(/.svg$/)
      .use('svg-with-file-loader')
      .loader('file-loader')
  },
}
```

## CSS

### Why don't my imported CSS files take effect?

umi use css modules by default, please write your css as css modules.

Ref:

* [css-modules/css-modules](https://github.com/css-modules/css-modules)
* [CSS Modules usage tutorial](http://www.ruanyifeng.com/blog/2016/06/css_modules.html)

### How to disable CSS modules?

Modify `.umirc.js`:

```json
{
 "disableCSSModules": true
}
```

However, it is not recommended to turn off css modules for no particular reason.

### How to use sass?

Install additional dependencies first,

```bash
$ npm i node-sass sass-loader --save
```

Then modify `.umirc.js`:

```json
{
 "sass": {}
}
```

## Test

### How to do breakpoint debugging?

Make sure node version is above 8.10 and then execute:

```bash
$ node --inspect-brk ./node_modules/.bin/umi test
```

Then open chrome://inspect/#devices in the browser for inspect and breakpoints.

## Deployment

### After the build access route is refreshed 404?

Several options are available:

* Use `hashHistory` instead of `history: 'hash' in `.umirc.js`
* Static, with `exportStatic: true` in `.umirc.js`
* The server configures the route fallback to index.html

### After the build, the picture is lost?

It may be that the picture is not correctly quoted. You can refer to the code and import the picture correctly.

```js
import React from 'react';
import logo from './logo.png'; // Tell Webpack this JS file to use this image

console.log(logo); // logo.84287d09.png

function header() {
  // import image
  return <img src={logo} alt="Logo" />;
}

export default Header;

```
Use in css, be careful not to use absolute paths
```css
.Logo {
  background-image: url(./logo.png);
}
```

> Note: base64 will be taken when the image size is less than 10 k. That is, it will not be copied to the public folder, but will be stored as a base64 resource.
