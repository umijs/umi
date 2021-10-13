
# Migrate create-react-app to umi

> This document is only used as a basic guide on how to migrate create-react-app to umi. For the migration of real projects, you may also need to read our documentation to learn more about [plugins](/zh-CN/plugins/preset-react) and [configuration](/zh-CN/config).

In fact, it is relatively easy to migrate a create-react-app project to umi. Mainly need to pay attention to the differences of several default behaviors. Next, we use the following steps to migrate the initial project of create-react-app to umi. 

## Dependency processing

Modify the dependencies and modify the project startup command in `package.json`. For more information on umi cli, you can check [our documentation](/zh-CN/docs/cl). 

```diff
{
  "scripts": {
-    "start": "react-scripts start",
+    "start": "umi dev",
-    "build": "react-scripts build",
+    "build": "umi build",
-    "test": "react-scripts test",
+    "test": "umi-test"
-    "eject": "react-scripts eject"
  },
  "dependencies": {
-    "react-scripts": "3.4.2"
+    "umi": "^3.2.14"
  },
+ "devDependencies": {
+    "@umijs/test": "^3.2.14"
+ }
}
```

## Modify the root component

The entrance of create-react-app is `src/index`, there is no real main entrance of the exposed program in umi, but we can find it in [layouts](/zh-CN/docs/convention-routing#global-layout) Perform the same operation in.

Transfer the logic in `src/index` to `src/layouts/index`, and your code should look like:

```js
import React from 'react';
import './index.css';

export default ({ children }) => (
    <React.StrictMode>
        {children}
    </React.StrictMode>
);
```

## Transfer page file 

Move the page components to the [`src/pages`](/zh-CN/docs/convention-routing) directory.

> Here we expect to access the App file through the route `/`, so we modify the file name as follows and modify the internal reference.

![image](https://user-images.githubusercontent.com/11746742/89971217-3d969680-dc8d-11ea-8d4e-c60b1e9431ba.png)

## [HTML template](/zh-CN/docs/html-template)

Transfer the content in `public/index.html` to `src/pages/document.ejs`.

In create-react-app, the deployment path is obtained through `%PUBLIC_URL%`, while in umi, the value needs to be obtained through [`context`](/zh-CN/docs/html-template#配置模板). 

```diff
- <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
+ <link rel="icon" href="<%= context.config.publicPath +'favicon.ico'%>" />
```

## Modify eslint configuration

Transfer the eslint configuration in package.json to `.eslintrc.js`. In the umi project, we recommend you to use `@umijs/fabric`. Of course, you can use any configuration you are familiar with. 

```diff
{
  "devDependencies": {
+    "@umijs/fabric": "^2.2.2",
  }
-  "eslintConfig": {
-    "extends": "react-app"
-  }
}
```

```js
module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
};
```

## Test related

### Add test configuration reference

Create a new configuration file `jest.config.js` and write the following configuration:

```js
module.exports = {
    "setupFilesAfterEnv": [
        "<rootDir>/src/setupTests.js"
    ]
}
```

### Use `umi-test` instead of `react-scripts test`

For related modifications, you can check the **dependency handling** mentioned above. If you didn't pay attention just now, you can go back and check.

Execute `umi-test`:

```bash
$ umi-test
 PASS  src/pages/index.test.js (11.765s)
  ✓ renders learn react link (31ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        12.594s
Ran all test suites.
✨  Done in 13.83s.
```

## Startup project

Execute `umi dev`, the project will be launched on `http://localhost:8000/`, if you are used to using port `3000`, you can pass [environment variables](/zh-CN/docs/env-variables ) To set. The project should now look the same as before the migration.

> For the complete migration operation, you can view this [submit](https://github.com/xiaohuoni/cra-2-umi/commit/66c87974f36cdb7d40629c056b1b1cdc4ebc8950).
