---
translateHelp: true
---

# @umijs/plugin-webpack-5


一键切换为 webpack 5。

## 启用方式

默认开启。

## 介绍

目前 webpack 5 还未正式发布，使用此插件可能会踩坑。

包含功能：

1. 启用 webpack 5
1. 启用物理缓存，极速的二次启动
1. node 补丁，目前有 tty

问题：

1. 看不到进度条，因为 umi 内置的进度条插件不支持 webpack 5
2. dev 模式下 css 会被打到 js 里，而不是以单独的 css 文件出现，因为 mini-css-extract-plugin 和 webpack@5 的物理缓存有冲突

## 配置

此插件暂无配置。
