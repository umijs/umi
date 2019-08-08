# 服务端渲染

<Badge text="Support in 2.8.0+"/>

[[toc]]

## 介绍

### 什么是服务端渲染

将页面在服务器端渲染为 HTML 片段，发送到浏览器，然后为其绑定状态与事件，成为完全可交互页面的过程。

@startuml
actor "用户/爬虫" as user
participant "服务器" as server

user -> server : 访问 / 链接
server -> server: 服务端渲染
server -> user: <div id="root">\n...content...\n</div>

@enduml

### 为什么使用服务端渲染

## 使用

## 配置及插件

## FAQ

### 与客户端渲染的区别

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

### 与预渲染的区别

## 参考
