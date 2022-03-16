# 参与贡献

❤️ Loving Umi and want to get involved? Thanks!

## 环境准备

### node 和 pnpm

开发 Umi 需要 node 16+ 和 pnpm。node 推荐用 nvm 安装，避免权限问题的同时还随时切换 node 版本；pnpm 去[他的官网](https://pnpm.io/installation)选择一种方式安装即可。

### Clone 项目

```bash
$ git clone git@github.com:umijs/umi-next.git
$ cd umi-next
```

### 安装依赖

```bash
$ pnpm i
```

## 常用任务

### 启动 dev 命令

本地开发 Umi 必开命令，用于编译 src 下的 TypeScript 文件到 dist 目录，同时监听文件变更，有变更时增量编译。

```bash
$ pnpm dev
```

如果觉得比较慢，也可以只跑特定 pacakge 的 dev 命令，比如。

```bash
$ cd packages/umi
$ pnpm dev
```

### 跑 example

examples 目录下保存了各种用于测试的例子，跑 example 是开发 Umi 时确认功能正常的常用方式。每个 example 都配了 dev script，所以进入 example 然后执行 `pnpm dev` 即可。

```bash
$ cd examples/boilerplates
$ pnpm dev
```

如果要用 vite 模式跑，加 `--vite` 参数，

```bash
$ pnpm dev -- --vite
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

### 文档

文档是 Umi@4 + plugin-docs 实现的，所以本质上也是 Umi 项目。

```bash
$ pnpm doc:dev
```

然后打开提示的端口号即可。

### 新增 package

新增 package 有封装脚本，无需手动复制 package.json 等文件。分两步，1）创建目录 2）执行 `pnpm bootstrap`。

```bash
$ mkdir packages/foo
$ pnpm bootstrap
```

### 更新依赖

> 不推荐非 Core Maintainer 做大量依赖更新。因为涉及依赖预打包，有较多需注意的点。

执行 `pnpm dep:update` 可更新依赖。

```bash
$ pnpm dep:update
```

由于 Umi 有针对依赖做预打包处理，更新依赖后还需检查更新的依赖是否为 devDependencies 并且有对此做依赖预打包。如果有，需要在对应 package 下执行 `pnpm build:deps` 并指定依赖，用于更新预打包的依赖文件。

```bash
$ pnpm build:deps --dep webpack-manifest-plugin
```

### 发布

只有 Core Maintainer 才能执行发布。

```bash
$ pnpm release
```
