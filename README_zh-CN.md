[English](./README.md) | 简体中文

# umi

[![NPM version](https://img.shields.io/npm/v/umi.svg?style=flat)](https://npmjs.org/package/umi)
[![Build Status](https://img.shields.io/travis/umijs/umi.svg?style=flat)](https://travis-ci.org/umijs/umi)
[![NPM downloads](http://img.shields.io/npm/dm/umi.svg?style=flat)](https://npmjs.org/package/umi)

🌋 可插拔的企业级 react 应用框架。

> Please consider following this project's author, [sorrycc](https://github.com/sorrycc), and consider starring the project to show your ❤️ and support.

---

## 特性

* 📦 **开箱即用**，内置 react、react-router 等
* 🏈 **类 next.js 且[功能完备](https://umijs.org/guide/router.html)的路由约定**，同时支持配置的路由方式
* 🎉 **完善的插件体系**，覆盖从源码到构建产物的每个生命周期
* 🚀 **高性能**，通过插件支持 PWA、以路由为单元的 code splitting 等
* 💈 **支持静态页面导出**，适配各种环境，比如中台业务、无线业务、[egg](https://github.com/eggjs/egg)、支付宝钱包、云凤蝶等
* 🚄 **开发启动快**，支持一键开启 [dll](https://umijs.org/plugin/umi-plugin-react.html#dll) 和 [hard-source-webpack-plugin](https://umijs.org/plugin/umi-plugin-react.html#hardSource) 等
* 🐠 **一键兼容到 IE9**，基于 [umi-plugin-polyfills](https://umijs.org/plugin/umi-plugin-react.html#polyfills)
* 🍁 **完善的 TypeScript 支持**，包括 d.ts 定义和 umi test
* 🌴 **与 dva 数据流的深入融合**，支持 duck directory、model 的自动加载、code splitting 等等

## 快速上手

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

[10 分钟入门 umi 视频版](https://youtu.be/vkAUGUlYm24)

## 例子

* [Ant Design Pro](https://github.com/ant-design/ant-design-pro)
* [Antd Admin](https://github.com/zuiidea/antd-admin)

## 社区

| Slack Group                                                  | Github Issue                                            | 钉钉群                                                       | 微信群                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| [sorrycc.slack.com](https://join.slack.com/t/sorrycc/shared_invite/enQtNTUzMTYxNDQ5MzE4LTg1NjEzYWUwNDQzMWU3YjViYjcyM2RkZDdjMzE0NzIxMTg3MzIwMDM2YjUwNTZkNDdhNTY5ZTlhYzc1Nzk2NzI) | [umijs/umi/issues](https://github.com/umijs/umi/issues) | <img src="https://gw.alipayobjects.com/zos/rmsportal/jPXcQOlGLnylGMfrKdBz.jpg" width="60" /> | <img src="https://img.alicdn.com/tfs/TB13U6aF6DpK1RjSZFrXXa78VXa-752-974.jpg" width="60" /> |

### Telegram

[https://t.me/joinchat/G0DdHw-44FO7Izt4K1lLFQ](https://t.me/joinchat/G0DdHw-44FO7Izt4K1lLFQ)

## License

[MIT](https://github.com/umijs/umi/blob/master/LICENSE)
