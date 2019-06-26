[English](./README.md) | 简体中文

# umi

[![NPM version](https://img.shields.io/npm/v/umi.svg?style=flat)](https://npmjs.org/package/umi) [![Build Status](https://img.shields.io/travis/umijs/umi.svg?style=flat)](https://travis-ci.org/umijs/umi) [![NPM downloads](http://img.shields.io/npm/dm/umi.svg?style=flat)](https://npmjs.org/package/umi)

🌋 可插拔的企业级 react 应用框架。

> Please consider following this project's author, [sorrycc](https://github.com/sorrycc), and consider starring the project to show your ❤️ and support.

---

## 特性

- 📦 **开箱即用**，内置 react、react-router、jest、webpack、rollup 等
- 🏈 **类 next.js 且[功能完备](https://umijs.org/zh/guide/router.html)的路由约定**，同时支持配置的路由方式
- 🎉 **插件体系**，覆盖从源码到构建产物的所有生命周期
- 🚀 **高性能**，比如可通过插件支持 PWA、以路由为单元的 code splitting 等
- 💈 **支持静态页面导出**，用于适配无服务端的环境
- 🚄 **开发启动快**，包含支持一键开启 [dll](https://umijs.org/zh/plugin/umi-plugin-react.html#dll) 等
- 🐠 **一键补丁方案**，通过 [targets](https://umijs.org/zh/config/#targets) 配置实现 JS 和 CSS 的自动补丁，最低可到 IE9
- 🍁 **支持 TypeScript**，包含 umi API 的 d.ts 定义，测试方案，组件打包方案等
- 🌴 **深入集成 [dva](https://github.com/dvajs/dva) 数据流方案但不耦合**，支持 duck directory、约定式的 model 挂载、model 的 动态加载等
- ⛄️ **支持多页应用**，基于 [umi-plugin-mpa](https://github.com/umijs/umi-plugin-mpa)

[以及更多。](https://www.npmjs.com/search?q=umi-plugin)

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

- [Ant Design Pro](https://github.com/ant-design/ant-design-pro)
- [Antd Admin](https://github.com/zuiidea/antd-admin)

## Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)]. <a href="https://github.com/umijs/umi/graphs/contributors"><img src="https://opencollective.com/umi/contributors.svg?width=890&button=false" /></a>

## 社区

| Slack Group                                                                                                                                                                     | Github Issue                                            | 钉钉群                                                                                                                         | 微信群                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [sorrycc.slack.com](https://join.slack.com/t/sorrycc/shared_invite/enQtNTUzMTYxNDQ5MzE4LTg1NjEzYWUwNDQzMWU3YjViYjcyM2RkZDdjMzE0NzIxMTg3MzIwMDM2YjUwNTZkNDdhNTY5ZTlhYzc1Nzk2NzI) | [umijs/umi/issues](https://github.com/umijs/umi/issues) | <img src="https://cdn.nlark.com/yuque/0/2019/jpeg/86025/1561529290421-cb5b5807-d0b9-466f-bf83-fc10909b9af8.jpeg" width="60" /> | <img src="https://img.alicdn.com/tfs/TB13U6aF6DpK1RjSZFrXXa78VXa-752-974.jpg" width="60" /> |

## License

[MIT](https://github.com/umijs/umi/blob/master/LICENSE)
