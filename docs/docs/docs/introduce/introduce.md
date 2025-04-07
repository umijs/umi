---
order: 1
toc: content
---
# Umi 介绍

<br />
<img src="https://img.alicdn.com/imgextra/i3/O1CN01eBiy611b67KLFOxi3_!!6000000003415-2-tps-200-200.png" width="120" />

##  Umi 是什么？

Umi，中文发音为「乌米」，是可扩展的企业级前端应用框架。Umi 以路由为基础，同时支持配置式路由和约定式路由，保证路由的功能完备，并以此进行功能扩展。然后配以生命周期完善的插件体系，覆盖从源码到构建产物的每个生命周期，支持各种功能扩展和业务需求。

Umi 是蚂蚁集团的底层前端框架，已直接或间接地服务了 10000+ 应用，包括 Java、Node、H5 无线、离线（Hybrid）应用、纯前端 assets 应用、CMS 应用、Electron 应用、Serverless 应用等。他已经很好地服务了我们的内部用户，同时也服务了不少外部用户，包括淘系、飞猪、阿里云、字节、腾讯、口碑、美团等。在 2021 年字节的[调研报告](https://zhuanlan.zhihu.com/p/403206195)中，Umi 是其中 25.33% 开发者的选择。

Umi 有很多非常有意思的特性，比如。

1、**企业级**，在安全性、稳定性、最佳实践、约束能力方面会考虑更多<br />
2、**插件化**，啥都能改，Umi 本身也是由插件构成<br />
3、**MFSU**，比 Vite 还快的 Webpack 打包方案<br />
4、基于 React Router 6 的完备路由<br />
5、默认最快的请求<br />
6、SSR & SSG<br />
7、稳定白盒性能好的 ESLint 和 Jest<br />
8、React 18 的框架级接入<br />
9、Monorepo 最佳实践<br />
...


## 什么时候不用 Umi？

如果你的项目，

1、需要支持 IE 8 或更低版本的浏览器<br />
2、需要支持 React 16.8.0 以下的 React<br />
3、需要跑在 Node 14 以下的环境中<br />
4、有很强的 webpack 自定义需求和主观意愿<br />
5、需要选择不同的路由方案<br />
...

Umi 可能不适合你。


## 为什么不是？

### create-react-app

create-react-app 是脚手架，和 Umi、next.js、remix、ice、modern.js 等元框架不是同一类型。脚手架可以让我们快速启动项目，对于单一的项目够用，但对于团队而言却不够。因为使用脚手架像泼出去的水，一旦启动，无法迭代。同时脚手架所能做的封装和抽象都非常有限。

### next.js

如果要做 SSR，next.js 是非常好的选择（当然，Umi 也支持 SSR）；而如果只做 CSR，Umi 会是更好的选择。相比之下，Umi 的扩展性会更好；并且 Umi 做了很多更贴地气的功能，比如配置式路由、补丁方案、antd 的接入、微前端、国际化、权限等；同时 Umi 会更稳定，因为他锁了能锁的全部依赖，定期主动更新。某一个子版本的 Umi，不会因为重装依赖之后而跑不起来。

### remix

Remix 是我非常喜欢的框架，Umi 4 从中<strike>抄</strike>（学）了不少东西。但 Remix 是 Server 框架，其内置的 loader 和 action 都是跑在 server 端的，所以会对部署环境会有一定要求。Umi 将 loader、action 以及 remix 的请求机制同时运用到 client 和 server 侧，不仅 server 请求快，纯 CSR 的项目请求也可达到理论的最快值。同时 Remix 基于 esbuild 做打包，可能不适用于对兼容性有要求或者依赖尺寸特别大的项目。
