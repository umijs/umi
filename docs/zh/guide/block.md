# 区块

<Badge text="2.3.0+ 中支持"/>

在 umi 中，区块是指页面级别的可复用的代码。umi 定义了一个区块的规范，你可以通过 umi 能够快速简单的在你的项目中添加区块，用于快速的开始一个页面的开发。

## 使用区块

在项目根目录使用如下命令可以添加一个区块到到你的项目中：

```sh
umi block [block url]
```

其中 `[block url]` 可以是一个 Github 或者 Gitlab 地址，也可以是一个 Git 仓库地址，也可以是一个本地相对或者绝对路径。只要对应的路径下是一个区块的代码，满足 umi 区块的规范，那么 umi 就可以通过该命令将区块的代码下载到你的项目中。

比如，你可以运行：

```sh
umi block https://github.com/umijs/umi-blocks/tree/master/demo
```

来将官方的区块仓库中的 demo 区块下载到你的项目本地。对于[官方区块仓库](https://github.com/umijs/umi-blocks)下的区块你可以使用更加简洁的命令，比如 `umi block demo` 来下载区块。

如果你的项目正在本地调试，那么区块下载到项目中后你就可以访问相应的路径来查看效果了。区块代码会被默认下载到 pages/[name] 下面，其中 name 是默认取区块中的 `package.json` 中的 name字段（会去掉`/`前的无效片段）。对于配置式路由，我们也会默认添加路由配置到你的配置中，所以也一样可以直接访问。

你可以通过 `umi help block` 来查看支持的更多配置。

需要注意的是，区块只是用于开发时新建页面时的提效工具，一般来说区块要实际应用都需要针对项目需求去修改最后的代码，之后的维护都将和普通页面一样由开发者来维护，不存在区块更新的说法。

## 区块开发

### 初始化区块

你可以通过 [craete-umi](https://github.com/umijs/create-umi) 快速创建一个区块的模板：

```sh
yarn create umi --block
```

区块的目录结构如下：

```
- root
  - src              // 区块的代码
    - index.js       // 区块入口，需要默认导出一个 React 组件
    - _mock.js       // 约定的 mock 文件
  - @                // 区块依赖的一些需要放到项目 src 下的内容（通常不推荐采用）
  - package.json     // 区块依赖等信息
  - .umirc.js        // 基于 umi 开发区块时的配置
  - thumb.[png|jpg]  // 物料的缩略图
```

其中 package.json 文件相关内容如下：

```js
{
  name: '@umi-blocks/demo',
  description: '区块描述',
  // ... 更多其他 npm 包的相关定义
  dependencies: {
    // dependencies 里面是区块运行时阶段的依赖，比如 antd g2 这些包的依赖
    antd: '^3.0.0',
  },
  devDependencies: {
    // 用户调试区块时候的依赖，和区块没有直接关系，可以提供基于 umi 的开发方案
  },
  scripts: {
    // 开发区块调试时的命令，和区块没有直接关系
  }
}
```

当执行 `umi block [block url]` 的时候实际上是执行的如下步骤：

- 将区块 src 下的代码复制到对应的页面目录
- 将 @ 下的代码负责到对应的 src 目录下
- 检测 package.json 中的区块依赖并自动安装到项目中

另外，如果再项目中配置了 [singular](/zh/config/#singular) 为 true，那么这个处理过程也会将对应的复数目录改为单数。

### 区块调试

区块调试基于 [umi-plugin-block-dev](https://github.com/umijs/umi-plugin-block-dev) 这个插件，基于该插件你就可以把区块当做一个普通的 umi 项目来调试了。如下所示，在区块的根目录下添加 `.umirc.js` 文件（通过 `create-umi` 创建的区块脚手架会自带该文件）。

```js
export default {
  plugins: [
    ['umi-plugin-block-dev', {}],
  ],
}
```

该插件会将区块的 src 目录作为 umi 的 pages 目录，这样你就可以在区块根目录下通过 `umi dev` 来开发调试区块了。

如果你觉得的区块质量较好，你可以通过提交 PR 来把它添加到 [官方区块仓库](https://github.com/umijs/umi-blocks) 中。
