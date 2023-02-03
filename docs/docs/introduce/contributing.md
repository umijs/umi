import { Message } from 'umi';

# 参与贡献

❤️ Loving Umi and want to get involved? Thanks!

## 环境准备

### Node.js 和 pnpm

开发 Umi 需要 Node.js 16+ 和 `pnpm` v7。

推荐使用 [`nvm`](https://github.com/nvm-sh/nvm) 管理 Node.js，避免权限问题的同时，还能够随时切换当前使用的 Node.js 的版本。在 Windows 系统下的开发者可以使用 [`nvm-windows`](https://github.com/coreybutler/nvm-windows)。

在 `pnpm` 的[官网](https://pnpm.io/installation)选择一种方式安装即可。

### Clone 项目

```bash
$ git clone git@github.com:umijs/umi.git
$ cd umi
```

### 安装依赖并构建

```bash
$ pnpm i && pnpm build
```

## 开发 Umi

### 启动 dev 命令

本地开发 Umi 必开命令，用于编译 `src` 下的 TypeScript 文件到 `dist` 目录，同时监听文件变更，有变更时增量编译。

```bash
$ pnpm dev
```

如果觉得比较慢，也可以只跑特定 package 的 `pnpm dev` 命令，比如。

```bash
$ cd packages/umi
$ pnpm dev
```

### 跑 Example

`examples` 目录下保存了各种用于测试的例子，跑 example 是开发 Umi 时确认功能正常的常用方式。每个 example 都配了 dev 脚本，所以进入 example 然后执行 `pnpm dev` 即可。

```bash
$ cd examples/boilerplate
$ pnpm dev
```

如果要用 vite 模式跑，加 `--vite` 参数，

```bash
$ pnpm dev --vite
```

### 测试

目前跑测试很快，10s+ 就完成了。推荐本地跑一遍再提 PR，减少 Round Trip。

```bash
$ pnpm test
...
Test Suites: 1 skipped, 43 passed, 43 of 44 total
Tests:       6 skipped, 167 passed, 173 total
Snapshots:   0 total
Time:        13.658 s
Ran all test suites.
```

如果需要只跑部分文件的用例，用 `pnpm jest`，因为 `pnpm test` 只开了 turborepo 功能的。

比如，

```bash
$ pnpm jest packages/plugin-docs/src/compiler.test.ts
```

## 贡献 Umi 文档

Umi 的文档由 Umi@4 和 `@umijs/plugin-docs` 插件实现，本质上就是一个 Umi 项目。在根目录执行如下命令即可开始 Umi 文档的开发：

```bash
# 安装 Umi 文档依赖
$ pnpm doc:deps
# 启用 Umi 文档开发
# 首次启动时编译耗时较长，请耐心等待
$ pnpm doc:dev
```

打开指定的端口号，即可实时查看文档更新的内容，以及 `@umijs/plugin-docs` 插件开发的成果。

### 撰写 Umi 文档

Umi 文档的编写基于 MDX 格式。MDX 是 Markdown 格式的拓展，允许您在撰写 Umi 文档时插入 JSX 组件。

<Message type="success">
撰写 **文档（Document）** 时，可用的组件可以在 `packages/plugin-docs/client/theme-doc/components` 目录下找到。撰写 **博客（Blog）** 时，可用的组件可以在 `packages/plugin-docs/client/theme-blog/components` 目录下找到。
</Message>

Umi 文档的代码高亮基于 [`Rehype Pretty Code`](https://github.com/atomiks/rehype-pretty-code)，完整的能力和使用说明请移步它的[官方文档](https://rehype-pretty-code.netlify.app)。

在根目录执行如下命令可以格式化仓库中已有的 Umi 文档：

```bash
$ pnpm format:docs
```

格式化文档后，建议**仅提交您撰写或修改的 Umi 文档**。不同文档贡献者的写作风格有一定的差异，格式化以后不一定能保留原来期望的样式。

### 参与 Umi 文档插件开发

新建一个终端，执行如下命令：

```bash
$ cd packages/plugin-docs
$ pnpm dev:css
```

现在，当您修改了 `tailwind.css` 文件或在开发时修改了 TailwindCSS 样式类时，会自动编译并生成 `tailwind.out.css` 样式表文件。

Umi 会监听 `docs` 和 `packages/plugin-docs/client` 目录下文件的变化，而不会监听 `packages/plugin-docs/src` 目录。

<Message>
如果您需要编译 `packages/plugin-docs/src` 中的文件，请移动到 `packages/plugin-docs` 目录下执行 `pnpm build` 命令，然后重启开发。
</Message>

在根目录执行如下命令可以格式化 Umi 文档插件的代码：

```bash
$ pnpm format:plugin-docs
```

在根目录执行如下命令可以构建 Umi 文档：

```bash
$ pnpm doc:build
```

## 新增 package

新增 package 有封装脚本，无需手动复制 `package.json` 等文件：

```bash
# 创建 package 目录
$ mkdir packages/foo
# 初始化 package 开发
$ pnpm bootstrap
```

## 更新依赖

> 不推荐非 Core Maintainer 做大量依赖更新。因为涉及依赖预打包，有较多需注意的点。

执行 `pnpm dep:update` 可更新依赖。

```bash
$ pnpm dep:update
```

由于 Umi 有针对依赖做预打包处理，更新依赖后还需检查更新的依赖是否为 devDependencies 并且有对此做依赖预打包。如果有，需要在对应 package 下执行 `pnpm build:deps` 并指定依赖，用于更新预打包的依赖文件。

```bash
$ pnpm build:deps --dep webpack-manifest-plugin
```

## 发布

只有 Core Maintainer 才能执行发布。

```bash
$ pnpm release
```

## 加入 Contributor 群

提交过 Bugfix 或 Feature 类 PR 的同学，如果有兴趣一起参与维护 Umi，可先用钉钉扫下方二维码（注明 github id）加我钉钉，然后我会拉到群里。

<img src="https://img.alicdn.com/imgextra/i2/O1CN01DLiPrU1WsbDdnwRr9_!!6000000002844-2-tps-340-336.png" />

如果你不知道可以贡献什么，可以到源码里搜 TODO 或 FIXME 找找。
