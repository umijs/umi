[English](./README.md) | 简体中文

# umi

[![codecov](https://codecov.io/gh/umijs/umi/branch/master/graph/badge.svg)](https://codecov.io/gh/umijs/umi) [![NPM version](https://img.shields.io/npm/v/umi.svg?style=flat)](https://npmjs.org/package/umi) [![CircleCI](https://circleci.com/gh/umijs/umi/tree/master.svg?style=svg)](https://circleci.com/gh/umijs/umi/tree/master) [![Build Status](https://dev.azure.com/umijs/umi/_apis/build/status/umijs.umi?branchName=master)](https://dev.azure.com/umijs/umi/_build/latest?definitionId=1&branchName=master) [![GitHub Actions status](https://github.com/umijs/umi/workflows/Node%20CI/badge.svg)](https://github.com/umijs/umi) [![NPM downloads](http://img.shields.io/npm/dm/umi.svg?style=flat)](https://npmjs.org/package/umi) [![Install size](https://badgen.net/packagephobia/install/umi)](https://packagephobia.now.sh/result?p=umi)

🍙 插件化的企业级前端应用框架。

> Please consider following this project's author, [sorrycc](https://github.com/sorrycc), and consider starring the project to show your ❤️ and support.

---

## 特性

* 🎉 **可扩展**，Umi 实现了完整的生命周期，并使其插件化，Umi 内部功能也全由插件完成。此外还支持插件和插件集，以满足功能和垂直域的分层需求。
* 📦 **开箱即用**，Umi 内置了路由、构建、部署、测试等，仅需一个依赖即可上手开发。并且还提供针对 React 的集成插件集，内涵丰富的功能，可满足日常 80% 的开发需求。
* 🐠 **企业级**，经蚂蚁内部 3000+ 项目以及阿里、优酷、网易、飞猪、口碑等公司项目的验证，值得信赖。
* 🚀 **大量自研**，包含微前端、组件打包、文档工具、请求库、hooks 库、数据流等，满足日常项目的周边需求。
* 🌴 **完备路由**，同时支持配置式路由和约定式路由，同时保持功能的完备性，比如动态路由、嵌套路由、权限路由等等。
* 🚄 **面向未来**，在满足需求的同时，我们也不会停止对新技术的探索。比如 dll 提速、modern mode、webpack@5、自动化化 external、bundler less 等等。

## 快速上手

手动创建文件，

```bash
# 创建目录
$ mkdir myapp && cd myapp

# 安装依赖
$ yarn add umi@next

# 创建页面
$ npx umi g page index --typescript --less

# 启动开发
$ npx umi dev
```

或者[通过脚手架快速上手](/docs/getting-started.zh-CN)。

## 贡献

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)]. <a href="https://github.com/umijs/umi/graphs/contributors"><img src="https://opencollective.com/umi/contributors.svg?width=890&button=false" /></a>

## 反馈

| Github Issue | 钉钉群 | 微信群 |
| --- | --- | --- |
| [umijs/umi/issues](https://github.com/umijs/umi/issues) | <img src="https://img.alicdn.com/tfs/TB1KxCae9f2gK0jSZFPXXXsopXa-1125-1485.jpg" width="60" /> | <img src="https://img.alicdn.com/tfs/TB1pd1ce8r0gK0jSZFnXXbRRXXa-430-430.jpg" width="60" /> |

## LICENSE

[MIT](https://github.com/umijs/umi/blob/master/LICENSE)
