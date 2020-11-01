# Plug-in development

In Umi, a plug-in is actually a JS module, you need to define a plug-in initialization method and export it by default. The following example:

```js
export default (api) => {
  // your plugin code here
};
```

It should be noted that if your plugin needs to be published as an npm package, then you need to compile it before publishing to ensure that the published code contains ES5 code.

The initialization method will receive the ʻapi` parameter, through which the interface provided by Umi to the plug-in is exposed.

## Plugin example

Below we complete a simple requirement to further understand Umi's plug-in development

### Demand

The performance in Umi's conventional routing is the main route, which corresponds to the ʻindex` route, that is, access to `http://localhost:8000`. The actual page visited is `src/pages/index`, sometimes we are in the development process You will encounter situations in which you want to modify the main route. For example, you want the route `/` to access `src/pages/home`.

### Initialize the plugin

You can directly create a scaffolding for Umi plugins via [create-umi](https://github.com/umijs/create-umi):

```shell
yarn create umi --plugin
? Select the boilerplate type plugin
? What's the plugin name? umi-plugin-main-path
? What's your plugin used for? config umi main path
? What's your email? 448627663@qq.com
? What's your name? xiaohuoni
? Which organization is your plugin stored under github? alitajs
? Select the development language TypeScript
? Does your plugin have ui interaction(umi ui)? No
   create package.json
   create .editorconfig
   create .fatherrc.ts
   create .gitignore
   create .prettierignore
   create .prettierrc
   create CONTRIBUTING.md
   create example/.gitignore
   create example/.umirc.ts
   create example/app.jsx
   create example/app.tsx
   create example/package.json
   create example/pages/index.css
   create example/pages/index.jsx
   create example/pages/index.tsx
   create example/tsconfig.json
   create example/typing.d.ts
   create README.md
   create src/index.ts
   create test/fixtures/normal/pages/index.css
   create tsconfig.json
✨ File Generate Done
```

### Install node module

```shell
$ yarn
```

> You can also use npm install. Because you have written tests, you have installed puppetee. If you fail to install it, you may need to go online scientifically or use Taobao source.

### Umi@3 plug-in naming features

In Umi@3, when the plugin starts with `@umijs` or ʻumi-plugin`, it will be used by default as long as it is installed, so if your plugin name is named according to the above rules, you don’t need to explicitly specify it in the config file Use your plug-in, if your plug-in naming does not meet the above rules, you only need to display it in config.

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  plugins: ['you-plugin-name'],
});
```

> In this example, our plugin name is umi-plugin-main-path.

### Practical drill

First, let's take a look at the code in the initial scaffolding. If you use this plugin, it will print the log ʻuse plugin`, and then use the `modifyHTML` api to add the content of `h1` to the `body`. For more plug-in api, please refer to [Plugins Api](/plugins/api).

```ts
export default function (api: IApi) {
  api.logger.info('use plugin');

  api.modifyHTML(($) => {
    $('body').prepend(`<h1>hello umi plugin</h1>`);
    return $;
  });

}
```

To add a configuration to our plug-in, use [describe](/plugins/api#describe-id-string-key-string-config--default-schema-onchange--) to register the configuration.

```ts
  api.describe({
    key: 'mainPath',
    config: {
      schema(joi) {
        return joi.string();
      },
    },
  });
```

Increase the main logic of our plugin

```ts
  if (api.userConfig.mainPath) {
    api.modifyRoutes((routes: any[]) => {
      return resetMainPath(routes, api.config.mainPath);
    });
  }
```

> It should be noted here that we take api.userConfig when we judge, and api.config is used in the api callback. You can understand that api.userConfig is the value in the configuration, and api.config is the plug-in modification The value after, here can be any plug-in modification.

Use our plugin in the demo:

Add configuration in ʻexample/.umirc.ts`

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  plugins: [require.resolve('../lib')],
  mainPath:'/home'
});
```

New page page, new `example/pages/home.tsx`

```tsx
import React from 'react';
import styles from './index.css';

export default () => (
  <div className={styles.normal}>
    <h2>Home Page!</h2>
  </div>
);
```

View effect

```shell
yarn start
Starting the development server...

✔ Webpack
  Compiled successfully in 20.73s

  App running at:
  - Local:   http://localhost:8000 (copied to clipboard)
  - Network: http://192.168.50.236:8000
```

The browser can visit `http://localhost:8000` to visit `home`, and to visit the previous ʻindex` page, pass `http://localhost:8000/index`.

### Writing tests for plugins

In general Umi plug-in testing, we use the result test scheme, only looking at the final running effect. Here we use [`test-umi-plugin`](https://github.com/umijs/test-umi-plugin), it also has certain conventions, after specifying `fixtures`, it will automatically execute the folder The test file under.

Add configuration in `test/fixtures/normal/.umirc.ts`

```ts
export default {
  plugins: [require.resolve('../../../lib')],
  mainPath: '/home'
}
```

New page page, new `test/fixtures/normal/pages/home.tsx`

```tsx
import React from 'react';
import styles from './index.css';

export default () => (
  <div className={styles.normal}>
    <h2>Home Page!</h2>
  </div>
);
```

Modify test case `test/fixtures/normal/test.ts`

```diff
export default async function ({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });
  const text = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(text).toEqual('Home Page');
};
```

Execute test

```
$ yarn test
$ umi-test
  console.log
    [normal] Running at http://localhost:12401

 PASS  test/index.e2e.ts (10.219s)
  ✓ normal (1762ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        11.057s
Ran all test suites.
✨  Done in 14.01s.
```

The complete code of this example is in [umi-plugin-main-path](https://github.com/alitajs/umi-plugin-main-path)。
