# 插件开发

在 Umi 中，插件实际上就是一个 JS 模块，你需要定义一个插件的初始化方法并默认导出。如下示例：

```js
export default (api) => {
  // your plugin code here
};
```

需要注意的是，如果你的插件需要发布为 npm 包，那么你需要发布之前做编译，确保发布的代码里面是 ES5 的代码。

该初始化方法会收到 `api` 参数，Umi 提供给插件的接口都是通过它暴露出来的。

## 插件示例

以下我们通过完成一个简单的需求，来进一步了解 Umi 的插件开发

### 需求

Umi 约定式路由中的表现是主路由，对应到 `index` 路由，即访问 `http://localhost:8000` 实际上访问到的页面是 `src/pages/index`，有时候我们在开发过程中会遇到，希望修改主路由的情况，比如希望路由 `/` 访问的是 `src/pages/home`。

### 初始化插件

你可以通过 [create-umi](https://github.com/umijs/create-umi) 直接创建一个 Umi 插件的脚手架：

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

### 安装 node 模块

```shell
$ yarn
```

> 你也可以使用 npm install ，因为有编写测试，所以安装了 puppetee，如果你安装失败，可能需要科学上网，或者使用淘宝源。

### Umi@3 插件命名特性

在 Umi@3 中，当插件使用 `@umijs` 或者 `umi-plugin` 开头，只要安装就会被默认使用，所以如果你的插件名以上述规则命名，你就不需要在 config 文件中显式使用你的插件，如果你的插件命名不满足上述规则，那你只需要在 config 中显示使用即可。

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  plugins: ['you-plugin-name'],
});
```

> 此次示例中我们的插件名是 umi-plugin-main-path 。

### 实战演练

首先我们先看一下，初始化脚手架中的代码，如果使用这个插件，那么就会打印日志 `use plugin`，然后使用 `modifyHTML` api 在 `body` 上添加了 `h1` 的内容。更多插件 api ，请查阅[Plugins Api](/plugins/api)。

```ts
export default function (api: IApi) {
  api.logger.info('use plugin');

  api.modifyHTML(($) => {
    $('body').prepend(`<h1>hello umi plugin</h1>`);
    return $;
  });

}
```

为我们的插件增加一个配，使用 [describe](/plugins/api#describe-id-string-key-string-config--default-schema-onchange--) 注册配置。

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

增加我们插件的主逻辑

```ts
  if (api.userConfig.mainPath) {
    api.modifyRoutes((routes: any[]) => {
      return resetMainPath(routes, api.config.mainPath);
    });
  }
```

> 这里需要注意的是，我们在判断是取的是 api.userConfig，而在 api 的回调中使用的是 api.config，你可以理解为 api.userConfig 是配置中的值， api.config 是插件修改后的值，这里可以是任意插件修改。

在演示中使用我们的插件：

在 `example/.umirc.ts` 中增加配置

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  plugins: [require.resolve('../lib')],
  mainPath:'/home'
});
```

新建 page 页面，新建 `example/pages/home.tsx`

```tsx
import React from 'react';
import styles from './index.css';

export default () => (
  <div className={styles.normal}>
    <h2>Home Page!</h2>
  </div>
);
```

查看效果

```shell
yarn start
Starting the development server...

✔ Webpack
  Compiled successfully in 20.73s

  App running at:
  - Local:   http://localhost:8000 (copied to clipboard)
  - Network: http://192.168.50.236:8000
```

浏览器访问 `http://localhost:8000` 就可以访问到 `home` ，要访问之前的 `index` 页面，要通过 `http://localhost:8000/index`。

### 为插件编写测试

一般 Umi 插件的测试，我们都是采用结果测试的方案，只看最终运行效果。这里我们使用的是 [`test-umi-plugin`](https://github.com/umijs/test-umi-plugin)，它也有一定的约定，指定 `fixtures` 之后，他会自动执行文件夹下的 test 文件。

在 `test/fixtures/normal/.umirc.ts` 中增加配置

```ts
export default {
  plugins: [require.resolve('../../../lib')],
  mainPath: '/home'
}
```

新建 page 页面，新建 `test/fixtures/normal/pages/home.tsx`

```tsx
import React from 'react';
import styles from './index.css';

export default () => (
  <div className={styles.normal}>
    <h2>Home Page!</h2>
  </div>
);
```

修改测试用例 `test/fixtures/normal/test.ts`

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

执行测试

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

本次示例的完整代码在 [umi-plugin-main-path](https://github.com/alitajs/umi-plugin-main-path)。
