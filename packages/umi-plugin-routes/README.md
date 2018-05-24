# umi-plugin-routes

umi的路由插件

.umirc.js
```js
export default {
  plugins: [
    [
      'umi-plugin-routes',
      {
        include:[

        ],
        exclude: [
          /pages\/site/,
        ],
        update(routes) {
          return [
            ...(require('./pages/site/_routes')),
            ...routes
          ];
        },
      },
    ],
  ],
};
```
./pages/site/_routes.json
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