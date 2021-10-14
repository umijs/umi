
# Plug-in development

In Umi, a plug-in is actually a JS module. You need to define a plug-in initialization method and export it by default. See the following example: 

```js
export default (api) => {
  // your plugin code here
};
```

It should be noted that if your plugin needs to be published as an npm package, then you need to compile it before publishing to ensure that the published code contains ES5 code.

The initialization method will receive the `api` parameter, through which the interface provided by Umi to the plug-in is exposed.

## Plugin example

Below we complete a simple requirement to further understand Umi's plug-in development

### Requirement

The performance in Umi's conventional routing is the main route, which corresponds to the `index` route, that is, accessing `http://localhost:8000`. The actually visited page during the development process is `src/pages/index`. You will encounter situations in which you want to modify the main route. For example, you want the route `/` to visit `src/pages/home`.

### Initialize the plugin

You can directly create a scaffolding of Umi plugin via [create-umi](https://github.com/umijs/create-umi):

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

> You can also use npm install. Because we have written tests, you have installed puppeteer. If it fail to install, you may need to go search online or use Taobao source.

### Umi@3 plug-in naming features

In Umi@3, when the plugin starts with `@umijs` or `umi-plugin`, it will be used by default as long as it is installed, so if your plugin name is named according to the above rules, you do not need to explicitly specify it in the config file to use it, if your plug-in naming does not meet the above rules, then you only need to specify the use in the config.

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  plugins: ['you-plugin-name'],
});
```

> In this example, our plugin name is umi-plugin-main-path.

### Hands-on

First, let's take a look at the code in the initial scaffolding. If you use this plugin, it will print the log `use plugin`, and then use the `modifyHTML` api to add the content of `h1` to the `body`. For more plug-in api, please refer to [Plugins Api](/plugins/api).

```ts
export default function (api: IApi) {
  api.logger.info('use plugin');

  api.modifyHTML(($) => {
    $('body').prepend(`<h1>hello umi plugin</h1>`);
    return $;
  });

}
```

To add a configuration to our plugin, use [describe](/plugins/api#describe-id-string-key-string-config--default-schema-onchange--) to register the configuration.

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

> It should be noted here that we use api.userConfig, and that api.config is used in the api callback. You can understand that api.userConfig is the value in the configuration, and api.config is the modified plug-in. The value of here can be any plug-in modification.

Using our plugin demo:

Add configuration in `example/.umirc.ts` 

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  plugins: [require.resolve('../lib')],
  mainPath:'/home'
});
```

Create a new page in `example/pages/home.tsx`

```tsx
import React from 'react';
import styles from './index.css';

export default () => (
  <div className={styles.normal}>
    <h2>Home Page!</h2>
  </div>
);
```

See the result

```shell
yarn start
Starting the development server...

✔ Webpack
  Compiled successfully in 20.73s

  App running at:
  - Local:   http://localhost:8000 (copied to clipboard)
  - Network: http://192.168.50.236:8000
```

In the browser visits `http://localhost:8000` and see `home`. To visit the previous `index` page, you must pass `http://localhost:8000/index`.

### Write tests for plugins

In Umi plug-in testing, we use the result test scheme and only look at the final running effect. Here we use [`test-umi-plugin`](https://github.com/umijs/test-umi-plugin), it also has certain conventions, after specifying folder `fixtures`, it will automatically execute the tests files under the folder.

Add configuration in `test/fixtures/normal/.umirc.ts`

```ts
export default {
  plugins: [require.resolve('../../../lib')],
  mainPath: '/home'
}
```

Create a new page, in `test/fixtures/normal/pages/home.tsx`

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

The complete code of this example is in [umi-plugin-main-path](https://github.com/alitajs/umi-plugin-main-path).
