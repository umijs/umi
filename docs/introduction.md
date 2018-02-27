---
id: introduction
title: 简介
---

<br />
Hello！

我是 umi，大家可以叫我五米，请不要叫我优米。

<img src="/img/rice.svg" width="120" height="120" style="margin-left:0;" />

<br />

**一、**

[umi](https://github.com/umijs/umi)（中文名：五米）是我目前的工作重点，正在全力开发中，从写下第一行代码开始算起已有数月。但从闲聊和邮件中发现不少人还不能准确地理解 umi 是啥、能做啥，于是趁着代码写累了，聊聊 umi 的一些情况。

umi 是工具吗？是。但不仅仅是。**我给 umi 的定位是开发框架，目前包含工具 + 路由，不包含数据和视图。** 所以 umi[工具 + 路由] + dva[数据] + antd(-mobile)[视图]，很配哦。另外，umi 目前基于 React，不支持 Vue 和其他框架或者无框架的开发方式。

前面说的目前，其实是精力有限。

&nbsp;

**二、**

大家可能会觉得，umi 有啥特别的，工具用 webpack + webpack-dev-server + babel + postcss + ... ，路由用 react-router 不就完了吗？

这是上一代的使用方式，工具是工具，库是库，泾渭分明。**而近来，我们发现工具和库其实可以糅合在一起，工具也是框架的一部分。** 通过约定、自动生成和解析代码等方式来辅助开发，减少开发者要写的代码量。next.js 如此，umi 也如此，[Compilers are the New Frameworks](https://tomdale.net/2017/09/compilers-are-the-new-frameworks/) 。

&nbsp;

**三、**

那么，为啥要把路由层做进去？

路由即页面，而页面是构成应用的单位。接管了路由层，意味着更多的可能性，可以管控每个页面的生成、切换、销毁等。框架能做的事情多了，才更有存在的意义。

比如：

* 一键切换单页多页
* 运行时按需加载
* 开发时按需编译
* 静态 HTML 的生成
* ...

&nbsp;

**四、**

所以，umi 有啥？我为什么要用？

简单来说，有以下 4 点：

* 🗃 开箱即用
* 🚀 极快
* ⚔️ 多端
* 😊 开发友好

（没了？🏃🏃🏃 先别走，听我细细道来。。）

&nbsp;

**五、**

开箱即用？那么箱子里有啥？

我们来对比下，以 roadhog 初始化一个项目为例。

roadhog：

1. 安装构建工具依赖 roadhog
1. 安装类库依赖，有 antd/antd-mobile、react + react-dom (或者 preact + preact-compat) 依赖
1. 如果是 preact 项目，需要配 alias
1. 如果需要路由，还需要安装 react-router
1. 安装 babel 插件 babel-plugin-import，并按文档配置，但可能配出错（此块咨询非常多）
1. 配置 webpack entry，打包多页

umi:

1. 安装依赖 umi

**只需一步，剩下的都不用做，因为在 umi 这个箱子里了。** 不过很多东西虽然已经在了，但仍保留让用户选择的权利，比如选择 preact 还是 react，比如 antd(-mobile) 的版本，eslint 规则可覆盖可 merge 等等。

&nbsp;

**六、**

umi 在性能上做了很多努力，这些对于开发者是无感知的。**“你只管写业务代码，我会负责性能”，并且随着 umi 的迭代，我保证你的应用会越来越快。**

主要有：

* PWA Support
* Tree Shake
* antd(-mobile) 启用 ES Module
* Scope Hoist
* 公共文件的智能提取
* 页面级的按需加载
* Inline Critical CSS
* 提供 `umi/dynamic` 和 `import()` 语法，分别用于懒加载组件和模块
* 优化的 [babel-preset-umi](https://github.com/umijs/umi/tree/master/packages/babel-preset-umi)
* 静态化的 SSR 处理
* link rel=preload
* hash 构建及服务端支持（云凤蝶）
* 通过 react-constant-elements 和 react-inline-elements 提升 rerender 性能
* 一键切换到 preact
* Progressive image loading
* 按需打包 umi 内置的路由代码
* ...

优化点很多，有些关乎尺寸，有些关乎执行效率，有些关乎首屏时间，有些关乎用户体验，细聊的话，能说上几个小时。大家根据关键字应该能猜个大概，这里就不展开了。

&nbsp;

**七、**

umi 就是为多端而生的，这里的多端指的是 web + 各种容器，比如说我们需要同时把代码部署到支付宝钱包的离线包和在线服务器。

因为 umi 的产物是单页应用，同时单独访问每个页面又都有效，所以可以在容器模式里通过 ap 进行跳转，在线模式下又通过路由跳转。模式的自动切换，我们是借助 [bridgex](http://gitlab.alibaba-inc.com/xteam/bridgex) 进行实现。

&nbsp;

**八、**

umi 在开发体验上也算得上是呕心沥血了。

首先，借助 create-react-app 的开源库，他的体验是我们的底线。像是 redbox 显示出错信息、HMR、出错点击后跳转到 IDE、ESLint 出错提示等等。

此外，umi 还做了更多：

* 按需编译（就算你有 100 个页面，启动也只需 5 秒）
* 所有的配置都能自动生效（热更新或自重启）
* 动态改 antd(-mobile) 主题
* dev server 断线重连
* 配置项校验和提醒（同时出现在浏览器和控制台里）
* 配置文件语法错误提示到行
* TypeScript 支持（语法提示、TSLint，连测试用例也支持用 ts 写）
* ...

&nbsp;

**九、**

什么样的项目适合用 umi ？

umi 是通用方案，我能说什么类型的都适用吗？😆 好吧，我说说什么项目不适用吧。

* 非 React 项目
* 路由及其复杂，不能通过目录路由约定实现的（后续会考虑配置类型的路由）
* 不在乎产出物性能的
* 不关注开发体验的
* ...

&nbsp;

**十、**

有点心动了，我该如何开始 Getting Started 呢？

请移步[快速上手](getting-started.html)。

