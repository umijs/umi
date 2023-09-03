# FAQ

## General

### Does Umi 3 only support TypeScript?

No, it doesn't. You can replace `.ts` in the documentation with `.js`, as both are valid. This is done to avoid specifying `.(j|t)sx?` every time.

### Using React 17

To upgrade React to version 17 in your `package.json`, do the following:

```diff
  "dependencies": {
-   "react": "^16.0.0",
+   "react": "^17.0.0",
-   "react-dom": "^16.0.0",
+   "react-dom": "^17.0.0",
  },
  "devDependencies": {
+   "typescript": "^4.1.0"
  }
```

Remove the `import React from 'react'` module import from your code:

```diff
- import React from 'react';

function App() {
  return <h1>Hello World</h1>;
}
```

Also, modify the `jsx` configuration in your `tsconfig.json`:

```diff
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "importHelpers": true,
-   "jsx": "react",
+   "jsx": "react-jsx",
    "esModuleInterop": true,
    "sourceMap": true,
    "baseUrl": "./",
    "strict": true,
    "paths": {
      "@/*": ["src/*"],
      "@@/*": ["src/.umi/*"]
    },
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "mock/**/*",
    "src/**/*",
    "config/**/*",
    ".umirc.ts",
    "typings.d.ts"
  ]
}
```

### What should I do if `import from umi` is not defined?

For example:

```js
import { history } from 'umi';
```

It may result in an error like `xxx has no exported member 'history'`.

To fix this, make sure of two things:

1. Ensure that the `tsconfig.json` has configurations for `@@` paths, like `"@@/*": ["src/.umi/*"]`. Refer to the [tsconfig.json template](https://github.com/umijs/umi/blob/master/packages/create-umi-app/templates/AppGenerator/tsconfig.json).
2. Ensure that the `src/.umi/core/umiExports.ts` file has the relevant content. If it doesn't, you can generate it by running any of the following commands: `umi build`, `umi dev`, or `umi g tmp`.

### How can I dynamically modify the title?

You can dynamically modify the title using the [plugin-helmet](/plugins/plugin-helmet) plugin.

### How can I pass values from the layout route to child routes?

It's recommended to use context or data flow solutions to pass values from a layout route to child routes. If you want to use `cloneElement` to pass values, you might need to pass them two levels deep because the first level is the `Switch` component, and the second level is the `Route` component. Here's an example:

```js
React.Children.map(children, child => {
  return React.cloneElement(child, null, React.Children.map(child.props.children, child => {
    return React.cloneElement(child, { test: 'test' });
  }));
})
```

Reference:

* [umijs/umi#1282](https://github.com/umijs/umi/pull/1282#issue-224134432)

## Errors

### 'umi' is not recognized as an internal or external command

For example:

![umi is not recognized](https://gw.alipayobjects.com/zos/rmsportal/fatmbcGwSOwDntHjmrtG.png)

You need to configure the `NODE_PATH` environment variable. If you are using Yarn, you can obtain the bin path by running `yarn global bin`.

### 'dynamicImport.loading' is configured, but outer errors are not working. What should I do?

There are two types of errors in components:

1) 

```js
a(); // Throws an error
export default () => <>..</>;
```

2)

```js
export default () => {
  a(); // Throws an error
  return <>..</>;
}
```

The second type of error will always work, regardless of whether dynamicImport is enabled and configured with a loading component. However, in the first type, when dynamicImport is enabled and a loading component is configured, the error might not be displayed.

For example, if the loading component points to a file with the following content:

```js
export default () => <>loading...</>
```

In this case, when an error occurs, it will only display "loading..."

#### Solution

Handle error scenarios in the loading component. For example:

```js
export default class extends React.PureComponent {
  render() {
    if (process.env.NODE_ENV === 'development' && this.props.error) {
      console.error(this.props.error.stack);
      return <div>{this.props.error.stack}</div>;
    }
    return <div>loading...</div>;
  }
};
```

### Internet Explorer (IE) Errors and Compression Issues Resolution Approach

Most errors encountered in IE are typically caused by this issue.

#### Typical Errors

![Typical IE Error](https://user-images.githubusercontent.com/11746742/62197556-a37dec00-b3b2-11e9-8f72-999058e9b305.png)

#### Resolution Approach

##### Step 1: Determine Your Requirements

The primary consideration is whether you need to support older browsers that do not support ES6:

* If you need to support older browsers, proceed to step 2.
* If you do not need to support older browsers, configure `minimizer` to use `terserjs`.

##### Step 2

Check the `targets` configuration to determine if it includes older browser versions. For example:

```js
{
  targets: { ie: 10 },
}
```

Try building the project. If it succeeds, there's no need to proceed to the next step.

##### Step 3: Record the Error Details

For example, record the following error details:

* File: `vendors.async.js`
* Line Number: `193`
* Error Token: `>`

##### Step 4: Build Without Compression and Identify the Error Source

```bash
# If you're using Umi
$ COMPRESS=none umi build

# If you're using Bigfish
$ COMPRESS=none bigfish build
```

Locate the error in `vendors.async.js` at line 193 and determine which package is causing the error. Note the package name and version.

##### Step 5: Modify the `node_modules/es5-incompatible-versions/package.json` File

Edit the `node_modules/es5-incompatible-versions/package.json` file and add the package name and version that caused the error. For example:

```json
"antd-table-infinity": {
        "^1.1.2": {
          "version": "^1.1.2",
          "reason": "https://github.com/Leonard-Li777/antd-table-infinity/blob/master/src/components/Table/InfinityTable/index.jsx

#L7"
        }
      }
```

##### Step 6: Save the File and Rebuild to Confirm the Error Is Fixed

##### Step 7: Submit a Pull Request (PR) to [es5-imcompatible-versions](https://github.com/umijs/es5-imcompatible-versions)

If you are unable to submit a PR, you can follow these steps instead:

1. Go to the [edit](https://github.com/umijs/es5-imcompatible-versions/edit/master/package.json) page.
2. Make the same modification you made locally to the file here.
3. Once you've made the changes, scroll to the bottom of the page and create a new branch (you may be prompted to do this automatically).
4. Click the green button "Propose file change."
5. On the next page, click the green button "Create pull request."

##### Step 8: Share the Link to the PR and Wait for It to Be Merged

For example: `https://github.com/umijs/es5-imcompatible-versions/pull/36`

#### References

* [https://github.com/sorrycc/blog/issues/68](https://github.com/sorrycc/blog/issues/68)
* [https://github.com/umijs/es5-imcompatible-versions](https://github.com/umijs/es5-imcompatible-versions)

### The Dependency Was Not Found

![The Dependency Was Not Found](https://user-images.githubusercontent.com/11746742/87644864-49229a80-c77f-11ea-909d-8e3d2bb5d7c2.png)

This error typically occurs due to package installation issues caused by poor network connectivity. You can try the following steps to resolve it:

1. Delete the `*.lock` files and the `node_modules` directory in your project.
2. Run `yarn` to reinstall dependencies.
3. If the issue persists, you can execute `git clean -dfx` in your project directory to remove any untracked files and directories. Then, run `yarn` again to reinstall dependencies.
4. If you're still encountering issues, consider deleting specific cache directories, such as `src/.umi/cache`, and then retry the installation.

## Webpack

### How can I configure additional loaders?

For example, if you want to handle SVG files differently and not include them as base64-encoded data, you can configure it like this:

```js
export default {
  // Add url-loader excludes
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

### Why isn't my imported CSS file working?

Umi enables CSS modules by default, so you should write your styles using CSS modules conventions. Make sure you are following the CSS modules approach for your styles.

References:

* [css-modules/css-modules](https://github.com/css-modules/css-modules)
* [A Guide to CSS Modules](http://www.ruanyifeng.com/blog/2016/06/css_modules.html)

### How can I disable CSS modules?

To disable CSS modules, modify your `.umirc.js` file:

```json
{
 "disableCSSModules": true
}
```

However, it's not recommended to disable CSS modules unless you have a specific reason to do so.

### How can I use Sass?

First, install the necessary dependencies:

```bash
$ npm i node-sass sass-loader --save
```

Then, modify your `.umirc.js`:

```json
{
 "sass": {}
}
```

#### How can I bundle CSS into a single file when using dynamic imports?

Configure the `splitChunks` optimization in your `.umirc.js` to bundle CSS into a single file. For example:

```js
export default {
  dynamicImport: {
  },
  chainWebpack(config) {
    config.optimization.splitChunks({
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.(css|less)$/,
          chunks: 'async',
          minChunks: 1,
          minSize: 0,
        }
      },
    });
  },
}
```

After building, you'll see a single CSS file, such as `styles.chunk.css`, containing all your CSS styles.

References:

* [Mini CSS Extract Plugin - Extracting All CSS in a Single File](https://github.com/webpack-contrib/mini-css-extract-plugin#extracting-all-css-in-a-single-file)
* [Example: `.umirc.js` Configuration](https://github.com/umijs/umi/blob/master/packages/umi-plugin-react/test/chunks/.umirc.js#L1)

### How can I prevent the "loading..." state from displaying when refreshing a route?

To prevent the "loading..." state from displaying when refreshing a route, import an empty component, such as `Loading.tsx`, and use it as the loading component. Here's an example:

```typescript
// components/Loading.tsx

import React from 'react';

export default () => <></>;
```

Then, in your `.umirc.js` configuration, specify the loading component:

```json
export default {
  dynamicImport: {
    loading: '@/components/Loading',
  },
};
```

## Testing

### How can I debug with breakpoints?

Ensure that you have Node.js version 8.10 or higher installed. Then, execute the following command:

```bash
$ node --inspect-brk ./node_modules/.bin/umi test
```

After that, open `chrome://inspect/#devices` in your browser to inspect and set breakpoints.

## Requests

### Why is my proxy not working, and it's not proxying to the actual address?

The proxy serves as a request proxy and doesn't change the request address. So, even if you see the request address as `http://localhost:8000/xxx` in your browser, it means the request is first sent to your local server, and then your local server forwards the request to the actual server. Therefore, it's essential to check if the server received the request successfully.

### Why do images go missing after building?

If images are missing after building, it could be due to incorrect image references. Ensure that you are correctly importing and using images in your code. For example:

```js
import React from 'react';
import logo from './logo.png'; // Inform Webpack that this JS file uses this image

console.log(logo); // logo.84287d09.png

function Header() {
  // Import the image
  return <img src={logo} alt="Logo" />;
}

export default Header;
```

When using CSS, be cautious not to use absolute paths. Instead, use relative paths:

```css
.Logo {
  background-image: url(./logo.png);
}
```

Note: Images smaller than 10 KB are base64-encoded and embedded in the bundle by default.

### Why is my page blank when deploying with a static file server, such as Cordova, and showing file not found errors?

You can try configuring `publicPath: './'` to resolve this issue.

### Cannot assign to read-only property 'exports' of object '#&lt;Object&gt;'

If you encounter this error, it's likely due to mixing

 `import` and `module.exports` in the same file. It's recommended to use consistent ES Module imports and exports throughout your project. For example:

```diff
import { A } from './a';

- module.exports = A;
+ export default A;
```

If you need to change many files, you can install `@babel/plugin-transform-modules-commonjs` using `npm i @babel/plugin-transform-modules-commonjs -D`. Then, add it to your Umi configuration as `extraBabelPlugins: ['@babel/plugin-transform-modules-commonjs']`.
