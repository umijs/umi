---
order: 2
toc: content
---
# 设计思路

Umi 从 1 做到 4，试错了很多东西，也试对了不少。这些试对的点我们逐渐沉淀下来，就成为指引我们如何做好企业级框架的思路。

设计思路包括，

1、技术收敛<br />
2、插件和插件集<br />
3、最佳实践<br />
4、企业级<br />
5、import all from umi<br />
6、编译时框架<br />
7、依赖预打包<br />
8、默认快<br />
9、约束与开放<br />

下面仅介绍 1-5 的 5 点，剩下 6-9 的 4 点在 2022.1.8 的 SEE Conf 中有过详细分享，详见[《SEE Conf: Umi 4 设计思路文字稿》](https://mp.weixin.qq.com/s?__biz=MjM5NDgyODI4MQ%3D%3D&mid=2247484533&idx=1&sn=9b15a67b88ebc95476fce1798eb49146)。

## 技术收敛

<br />
<img src="https://img.alicdn.com/tfs/TB1hE8ywrr1gK0jSZFDXXb9yVXa-1227-620.png" width="600" />
<br />

技术收敛对团队而言尤其重要，他包含两层含义，1）技术栈收敛 2）依赖收敛。技术栈收敛指社区那么多技术栈，每个技术方向都有非常多选择，比如数据流应该就不下 100 种，开发者应该如何选择；收敛了技术栈之后还需要收敛依赖，团队中，开发者的项目不应该有很多细碎的依赖，每一个依赖都附带着升级成本。

我们希望开发者依赖 Umi 之后就无需关心 babel、webpack、postcss、react、react-router 等依赖，而依赖 @umijs/max 之后无需再关心开发中台项目的依赖和技术栈。

## 插件和插件集

<br />
<img src="https://img.alicdn.com/tfs/TB1mrhuwqL7gK0jSZFBXXXZZpXa-956-728.png" width="400" />
<br />

Umi 通过提供插件和插件集的机制来满足不同场景和业务的需求。插件是为了扩展一个功能，而插件集是为了扩展一类业务。比如要支持 vue，我们可以有 `@umijs/preset-vue`，包含 vue 相关的构建和运行时；比如要支持 h5 的应用类型，可以有 `@umijs/preset-h5`，把 h5 相关的功能集合到一起。

如果要类比，插件集和 babel 的 preset，以及 eslint 的 config 都类似。

## 最佳实践

最佳实践是我们认为做某件事当下最好的方式，主语是我们，所以会相对比较主观。比如路由、补丁方案、数据流、请求、权限、国际化、微前端、icons 使用、编辑器使用、图表、表单等方面，Umi 都会给出我们的最佳实践。这些最佳实践大部分来自蚂蚁集团内部的实践和讨论，也有部分来自社区。他们是主观和时间敏感的，所以可能会有相对比较频繁的迭代。

之所以需要最佳实践，1）是社区太多方案选择，2）是很多人没有选择的精力和经验甚至意愿。尤其是针对非专业的前端，有选择比没选择好，不管这个选择如何。

## 企业级

npm 社区「世风日下」，涉政包、恶意包、广告求职包频出，所以如何确保不会「睡一觉醒来项目挂了」是面对企业生成提供服务的框架绕不开的一个点。

Umi 通过写死版本、依赖预打包、通过 eslint hack 锁定 eslint 依赖，通过配置锁定 babel 补丁依赖等方式，让 Umi 不会在你重装 node_modules 之后就挂掉，并以此来实现「十年后依旧可用」。

## import all from umi

很多人可能都第一次听到。import all from umi 意思是所有 import 都来自 `umi`。比如 dva 不是 `import { connect } from 'dva'`，而是 `import { connect } from 'umi'`，从 Umi 中导出。导出的方法不仅来自 Umi 自身，还来自 Umi 插件。

这是两年前 Umi 3 加的功能，最近发现 Remix、prisma、vitekit 等框架和工具都有类似实现。

```ts
// 大量插件为 umi 提供额外导出内容
import { connect, useModel, useIntl, useRequest, MicroApp, ... } from 'umi';
```

这带来的好处是。通过 Umi 将大量依赖管理起来，用户无需手动安装；同时开发者在代码中也会少很多 import 语句。
