---
order: 1
toc: content
---

# 开发环境

本文将带领你从零开始在本地搭建一个 Umi.js 项目的开发环境。

## Nodejs

Umi.js 需要使用 [Node.js](https://nodejs.org/zh-cn/) 来进行开发，因此请先确保电脑已经安装了 Node.js 且版本在 14 以上。

:::info{title=💡}
如果你是 macOS 用户，建议使用 [nvm](https://github.com/nvm-sh/nvm) 来管理 Node.js 的版本；
Windows 用户建议使用 [nvm-windows](https://github.com/coreybutler/nvm-windows) 。
:::

本文将在 macOS 或 Linux 环境下使用 [nvm](https://github.com/nvm-sh/nvm) 安装 [Node.js](https://nodejs.org/zh-cn/) ：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm -v

0.39.1
```

安装完成 [nvm](https://github.com/nvm-sh/nvm) 之后，使用以下命令来安装 [Node.js](https://nodejs.org/zh-cn/) ：

```bash
nvm install 16
nvm use 16
```

安装完成后，使用以下命令来检查是否安装成功并且安装了正确的版本：

```bash
node -v

v16.14.0
```

## 依赖管理

Node 安装完成后会自带 [npm](https://www.npmjs.com/) 依赖管理工具，但 Umi.js 推荐使用 [pnpm](https://pnpm.io/) 来管理依赖：

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

安装完成后，可以用以下命令检查是否安装成功：

```bash
pnpm -v

7.3.0
```

## IDE

安装完 [Node.js](https://nodejs.org/zh-cn/) 及 [pnpm](https://pnpm.io/) (或其他依赖管理工具) 后，你需要使用一个自己习惯的 IDE 或文本编辑器来编写代码。如果你还没有习惯的 IDE，可以从下方挑选一个：

1. [Visual Studio Code](https://code.visualstudio.com/) (推荐)
2. [WebStorm](https://www.jetbrains.com/webstorm/) (推荐)
3. [IntelliJ IDEA](https://www.jetbrains.com/idea/)
4. [Sublime Text](https://www.sublimetext.com/)
5. [Atom](https://atom.io/)

## 下一步

恭喜你！你的本地环境已经准备好开始开发 Umi.js 项目了，马上前往 [脚手架](boilerplate) 学习如何使用 Umi.js 脚手架快速启动一个项目吧！🎉
