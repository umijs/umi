# umi

[![NPM version](https://img.shields.io/npm/v/umi.svg?style=flat)](https://npmjs.org/package/umi)
[![Build Status](https://img.shields.io/travis/umijs/umi.svg?style=flat)](https://travis-ci.org/umijs/umi)
[![NPM downloads](http://img.shields.io/npm/dm/umi.svg?style=flat)](https://npmjs.org/package/umi)

🚀 Pluggable enterprise-level react application framework.

> Please consider following this project's author, [sorrycc](https://github.com/sorrycc), and consider starring the project to show your ❤️ and support.

---

## Features

* **开箱即用**，内置 react、react-router 等
* **类 next.js 且[功能完备](/guide/router.html)的路由约定**，同时支持配置的路由方式
* **完善的插件体系**，覆盖从源码到构建产物的每个生命周期
* **高性能**，内置 PWA、以路由为单元的 Code Splitting 等
* **支持静态页面导出**，适配各种环境，比如中台业务、无线业务、[egg](https://github.com/eggjs/egg)、支付宝钱包、云凤蝶等
* **开发启动快**，支持一键开启按需编译、[dll](https://github.com/umijs/umi/tree/master/packages/umi-plugin-dll)、hard-source-webpack-plugin 等
* **一键兼容到 IE9**，基于 [umi-plugin-polyfill](https://github.com/umijs/umi/tree/master/packages/umi-plugin-polyfill)
* **完善的 TypeScript 支持**，包括 d.ts 定义和 umi test
* **与 dva 数据流的深入融合**，支持 duck directory、model 的自动加载、code splitting 等等

### Getting Started

```bash
# 安装
$ yarn global add umi # 或者 npm install -g umi

# 新建应用
$ mkdir myapp && cd myapp

# 新建页面
$ umi generate page index

# 本地开发
$ umi dev

# 构建上线
$ umi build
```

## 社区

### 钉钉群

<img src="https://gw.alipayobjects.com/zos/rmsportal/wsBGpRlCOkmxHzMHuyAT.jpg" width="60" />

### 微信群

<img src="https://gw.alipayobjects.com/zos/rmsportal/KyFxYsHITgIAaVgQxfeE.jpg" width="60" />

群满 100 人后，请加 `sorryccpro` 好友备注 `umi` 邀请加入。

### Telegram

[https://t.me/joinchat/G0DdHw-44FO7Izt4K1lLFQ](https://t.me/joinchat/G0DdHw-44FO7Izt4K1lLFQ)

## License

[MIT](https://github.com/umijs/umi/blob/master/LICENSE)
