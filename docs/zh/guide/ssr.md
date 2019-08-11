---
sidebarDepth: 3
---

# 服务端渲染（SSR）

<Badge text="Support in 2.8.0+"/>

<!-- [[toc]] -->

## 介绍

### 什么是服务端渲染

服务端渲染（Server-Side Render），是指将单页应用（SPA）在**服务器端**渲染为 HTML 片段，发送到浏览器，然后为其绑定状态与事件，成为完全可交互页面的过程。

@startuml
actor "用户/爬虫" as user
participant "服务器" as server

user -> server : 访问 / 链接
server -> server: 服务端渲染
server -> user: <div id="root">\n...content...\n</div>

@enduml

### 与客户端渲染的区别

> 后续简称服务端渲染为 SSR，客户端渲染为 CSR

如下图所示：

@startuml
'skinparam handwritten true
'default
top to bottom direction
actor "用户/爬虫" as user
' centered
cloud "服务器渲染（SSR）" as ssr
' centered
cloud "客户端渲染（CSR）" as csr
user <--> (ssr)
user <--> (csr)

note left of (user)
  <div id="root">
    ...<div>content</div>...
  </div>
end note

note right of (user)
  <div id="root"></div>
end note

@enduml

SSR：

- **更友好的 SEO**：爬虫可以直接抓取渲染之后的页面，CSR 首次返回的 HTML 文档中，是空节点（root），不包含内容。而 SSR 返回渲染之后的 HTML 片段，内容完整，所以能更好地被爬虫分析与索引。
- **更快的首屏加载速度**：无需等待 JavaScript 完成下载且执行才显示内容，更快速地看到完整渲染的页面。有更好的用户体验。
- 需要服务端支持：Umijs 主要关注是应用 **UI 层渲染**，完成 SSR 需要服务端（例如：Node.js）支持。

### Umi SSR 特性

- [x] 支持 CSS Modules
- [x] 支持 TypeScript
- [x] 支持本地开发 HMR
- [x] 支持 dva
- [ ] 支持 Serverless

## 使用

### umi 配置

在[配置文件](/zh/guide/app-structure.html#src-app-js-ts)中加上 `ssr`，同时 `ssr` 提供[配置](/zh/config/#ssr)来满足不同项目需求：

```js
export default {
  ssr: true,
};
```

执行 `umi build`，除了生成客户端资源（`umi.js`）外，会额外生成 `umi.server.js`、`ssr-client-mainifest.json`。

### 服务端配置

上文提到 Umijs 关注是应用 **UI 层渲染**，对于服务端技术选型不做强制约定。

为降低服务端接入门槛，umi 提供 [umi-server](https://npmjs.com/package/umi-server) ，并以常见的 Node.js 服务端框架（[Koajs](https://koajs.com)、[Express](https://expressjs.com/)、[Egg.js](https://eggjs.org/)）为例，给出具体接入方式。å

#### Koajs

#### Express

#### Egg.js

## 配置及插件

## FAQ

### 与预渲染的区别
预渲染（Pre Render）在构建时执行渲染，将渲染后的 HTML 片段生成静态 html 文件。

无需使用 web 服务器实时动态编译 HTML，**适用于静态站点**。

你可以参考 umi 的官方示例 [umi-example-ssr](https://github.com/umijs/umi-example-ssr) 了解更多。

## 参考
