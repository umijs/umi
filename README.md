English | [简体中文](./README_zh-CN.md)

# umi

[![NPM version](https://img.shields.io/npm/v/umi.svg?style=flat)](https://npmjs.org/package/umi)
[![Build Status](https://img.shields.io/travis/umijs/umi.svg?style=flat)](https://travis-ci.org/umijs/umi)
[![NPM downloads](http://img.shields.io/npm/dm/umi.svg?style=flat)](https://npmjs.org/package/umi)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

🌋 Pluggable enterprise-level react application framework.

> Please consider following this project's author, [sorrycc](https://github.com/sorrycc), and consider starring the project to show your ❤️ and support.

---

## Features

* 📦 **Out of box**, with built-in support for react, react-router, etc.
* 🏈 **Next.js like and [full featured](https://umijs.org/guide/router.html) routing conventions**, which also supports configured routing
* 🎉 **Complete plugin system**, covering every lifecycle from source code to production
* 🚀 **High performance**, with support for PWA, route-level code splitting, etc. via plugins
* 💈 **Support for static export**, adapt to various environments, such as console app, mobile app, [egg](https://github.com/eggjs/egg), Alipay wallet, etc
* 🚄 **Fast dev startup**, support enable [dll](https://umijs.org/plugin/umi-plugin-react.html#dll) and [hard-source-webpack-plugin](https://umijs.org/plugin/umi-plugin-react.html#hardSource) with config
* 🐠 **Compatible with IE9**, based on [umi-plugin-polyfills](https://umijs.org/plugin/umi-plugin-react.html#polyfills)
* 🍁 **Support TypeScript**, including d.ts definition and `umi test`
* 🌴 **Deep integration with [dva](https://dvajs.com/)**, support duck directory, automatic loading of model, code splitting, etc

## Getting Started

```bash
# Install deps
$ yarn global add umi # OR npm install -g umi

# Create application
$ mkdir myapp && cd myapp

# Create page
$ umi generate page index

# Start dev server
$ umi dev

# Build and deploy
$ umi build
```

[Getting started with a 10 minutes video](https://youtu.be/vkAUGUlYm24)

## Examples

* [Ant Design Pro](https://github.com/ant-design/ant-design-pro)
* [Antd Admin](https://github.com/zuiidea/antd-admin)

## Community

| Slack Group                                                  | Github Issue                                            | 钉钉群                                                       | 微信群                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| [sorrycc.slack.com](https://join.slack.com/t/sorrycc/shared_invite/enQtNTUzMTYxNDQ5MzE4LTg1NjEzYWUwNDQzMWU3YjViYjcyM2RkZDdjMzE0NzIxMTg3MzIwMDM2YjUwNTZkNDdhNTY5ZTlhYzc1Nzk2NzI) | [umijs/umi/issues](https://github.com/umijs/umi/issues) | <img src="https://gw.alipayobjects.com/zos/rmsportal/jPXcQOlGLnylGMfrKdBz.jpg" width="60" /> | <img src="https://img.alicdn.com/tfs/TB13U6aF6DpK1RjSZFrXXa78VXa-752-974.jpg" width="60" /> |

## License

[MIT](https://github.com/umijs/umi/blob/master/LICENSE)
