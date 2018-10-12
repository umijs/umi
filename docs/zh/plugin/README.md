---
sidebarDepth: 2
---

# 插件

umi 区别于其他前端开发框架和工具的核心就是它的插件机制，基于 umi 的插件机制，你可以获得扩展项目的编译时和运行时的能力。通过插件支持的功能也会变得更强大，我们针对功能的需要可以去使用修改代码打包配置，修改启动代码，约定目录结构，修改 HTML 等更丰富接口。

## 插件使用

插件可以是一个 npm 包，也可以是路径直接引向一个 JS 的模块。用户通过配置 `plugins` 来使用插件。如下所示：

```js
// .umirc.js
export default {
  plugins: [
    ['umi-plugin-dva', {
      immer: true,
    }],
    ['./src/plugins/customPlugin.js', {
      // plugin config
    }]
  ],
};
```

## 插件列表

### 官方插件

- [umi-plugin-react](/zh/plugin/umi-plugin-react.html)（插件集）
- umi-plugin-dva
- umi-plugin-locale
- umi-plugin-dll
- umi-plugin-routes
- umi-plugin-polyfills

### 社区插件

- [umi-plugin-*](https://www.npmjs.com/search?q=umi-plugin-)
