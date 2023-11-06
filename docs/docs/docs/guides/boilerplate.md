---
order: 11
toc: content
---
# 脚手架

Umi 官方提供了一个脚手架 ，可以轻松快速创建一个项目：

```bash
# 在当前文件夹下创建项目
pnpm create umi
# 在当前目录的 my-umi-app 文件夹下创建项目
pnpm create umi my-umi-app
```

这个命令会安装 `create-umi` 脚手架并自动运行，运行后提供了两个可选项：

1. Pick Npm Client - 选择 Npm 客户端

你可以从以下几个选项中选择习惯的 Node 依赖管理工具：

- [npm](https://www.npmjs.com/)
- [cnpm](https://github.com/cnpm/cnpm)
- [tnpm](https://web.npm.alibaba-inc.com/)
- [yarn](https://yarnpkg.com/)
- [pnpm](https://pnpm.io/) (Umi 官方推荐)

2. Pick Npm Registry - 选择 Npm 源

- [npm](https://www.npmjs.com/)
- [taobao](https://npmmirror.com/)

选择后会自动生成一个最基本的 Umi 项目，并根据选中的客户端和镜像源安装依赖：

```text
.
├── package.json
├── pnpm-lock.yaml
├── src
│   ├── assets
│   │   └── yay.jpg
│   ├── layouts
│   │   ├── index.less
│   │   └── index.tsx
│   └── pages
│       ├── docs.tsx
│       └── index.tsx
├── tsconfig.json
└── typings.d.ts
```

这样就一键完成 Umi 项目的初始化了。
