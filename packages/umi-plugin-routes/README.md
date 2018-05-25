# umi-plugin-routes

umi 的路由插件

新增属性

```js
authorize: [
  {
    guard: "./routes/PrivateRoute.js"
    exclude: "scroll-to-top/a"
  },
  {
    guard: "./routes/PrivateRoute.js",
    include: /\/list/
  },
  {
    include: "scroll-to-top",
    exclude: "scroll-to-top/a"
  },
  {
    guard: "./routes/PrivateRoute.js",
    include: "scroll-to-top",
    exclude: "scroll-to-top/a"
  }
];
```
authorize必须是一个数组

include和exclude的值为正则表达式或者字符串

include表示：包含这个字符串或者满足这个正则会被**添加**

exclude表示：包含这个字符串或者满足这个正则会被**忽略**

include不存在，则当前设置无效，如上述第一条

exclude不存在，则当前不忽略，如上诉第二条

guard不存在，则当前设置无效，如上述第三条




.umirc.js

```js
export default {
  plugins: [
    [
      "umi-plugin-routes",
      {
        include: [],
        exclude: [/pages\/site/],
        update(routes) {
          return [...require("./pages/site/_routes"), ...routes];
        }
      }
    ]
  ]
};
```

./pages/site/\_routes.json

```json
[
  {
    "path": "/site/b",
    "exact": true,
    "component": "./pages/site/a"
  }
]
```

opts.exclude 排除约定中生成路由的目录
opts.include 导入不在约定中的目录
opts.update 导入配置
