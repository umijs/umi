# 目录及约定

在文件和目录的组织上，umi 尽量选择了约定的方式。

一个复杂应用的目录结构如下：

```
.
├── dist/                          // 默认的 build 输出目录
├── mock/                          // mock 文件所在目录，基于 express
├── config/
    ├── config.js                  // umi 配置，同 .umirc.js，二选一
└── src/                           // 源码目录，可选
    ├── layouts/index.js           // 全局布局
    ├── pages/                     // 页面目录，里面的文件即路由
        ├── .umi/                  // dev 临时目录，需添加到 .gitignore
        ├── .umi-production/       // build 临时目录，会自动删除
        ├── document.ejs           // HTML 模板
        ├── 404.js                 // 404 页面
        ├── page1.js               // 页面 1，任意命名，导出 react 组件
        ├── page1.test.js          // 用例文件，umi test 会匹配所有 .test.js 和 .e2e.js 结尾的文件
        └── page2.js               // 页面 2，任意命名
    ├── global.css                 // 约定的全局样式文件，自动引入，也可以用 global.less
    ├── global.js                  // 可以在这里加入 polyfill
├── .umirc.js                      // umi 配置，同 config/config.js，二选一
├── .env                           // 环境变量
└── package.json
```

## ES6 语法

配置文件、mock 文件等都有通过 `@babel/register` 注册实时编译，所以可以和 src 里的文件一样，使用 ES6 的语法和 es modules 。

## dist

默认输出路径，可通过配置 outputPath 修改。

## mock

约定 mock 目录里所有的 `.js` 文件会被解析为 mock 文件。

比如，新建 `mock/users.js`，内容如下：

```js
export default {
  '/api/users': ['a', 'b'],
}
```

然后在浏览器里访问 [http://localhost:8000/api/users](http://localhost:8000/api/users) 就可以看到 `['a', 'b']` 了。

## src

约定 `src` 为源码目录，但是可选，简单项目可以不加 `src` 这层目录。

比如：下面两种目录结构的效果是一致的。

```
+ src
  + pages
    - index.js
  + layouts
    - index.js
- .umirc.js
```

```
+ pages
  - index.js
+ layouts
  - index.js
- .umirc.js
```

## src/layouts/index.js

全局布局，实际上是在路由外面套了一层。

比如，你的路由是：

```
[
  { path: '/', component: './pages/index' },
  { path: '/users', component: './pages/users' },
]
```

如果有 `layouts/index.js`，那么路由则变为：

```
[
  { path: '/', component: './layouts/index', routes: [
    { path: '/', component: './pages/index' },
    { path: '/users', component: './pages/users' },
  ] }
]
```

## src/pages

约定 pages 下所有的 `(j|t)sx?` 文件即路由。关于更多关于约定式路由的介绍，请前往路由章节。

## src/pages/404.js

404 页面。注意开发模式下有内置 umi 提供的 404 提示页面，所以只有显式访问 `/404` 才能访问到这个页面。

## src/pages/document.ejs

有这个文件时，会覆盖默认的 HTML 模板。需至少包含以下代码，

```html
<div id="root"></div>
```

## src/pages/.umi

这是 umi dev 时生产的临时目录，默认包含 `umi.js` 和 `router.js`，有些插件也会在这里生成一些其他临时文件。可以在这里做一些验证，**但请不要直接在这里修改代码，umi 重启或者 pages 下的文件修改都会重新生成这个文件夹下的文件。**

## src/pages/.umi-production

同 `src/pagers/.umi`，但是是在 `umi build` 时生成的，会在 `umi build` 执行完自动删除。

## .test.js 和 .e2e.js

测试文件，`umi test` 会查找所有的 .(test|e2e).(j|t)s 文件跑测试。

## src/global.(j|t)sx?

在入口文件最前面被自动引入，可以考虑在此加入 polyfill。

## src/global.(css|less|sass|scss)

这个文件不走 css modules，自动被引入，可以写一些全局样式，或者做一些样式覆盖。

## .umirc.js 和 config/config.js

umi 的配置文件，二选一。

## .env

环境变量，比如：

```
CLEAR_CONSOLE=none
BROWSER=none
```
