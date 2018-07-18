# normal

## Checklist

### dev

* [ ] 访问 '/' 输出 `index`（global.js），白色（css modules），绿底（global.css）
* [ ] 访问 '/' 输出红色外框（全局 layout）
* [ ] 访问 '/' 输出 4 张图片（10 K 以下会走 base 64）
* [ ] 访问 '/api/users' 返回 `{ "name": "cc" }`（mock）
* [ ] 访问 '/404' 输出 `404 page`
* [ ] 访问 '/not-exists' 输出 `umi development 404 page`
* [ ] 访问 '/'，点 go to /list 按钮，跳转到 '/list'，再点 go back 按钮，回到 '/'（路由跳转）

### build

结构如下：

```
dist
├── index.html
├── static
│   ├── dva.384c87c0.jpg
│   └── roadhog.8ccc4796.jpg
├── umi.css
└── umi.js
```

只有两张图片是因为另外两张被转为 base64 了。

* [ ] css、js、html 是压缩过的
