---
order: 1
toc: content
translated_at: '2024-03-17T10:23:41.561Z'
---

# Development Environment

This article will guide you through setting up a local development environment for an Umi.js project from scratch.

## Nodejs

Umi.js development requires [Node.js](https://nodejs.org/en/), so please ensure that Node.js is installed on your computer and its version is above 18.

:::info{title=💡}
If you are a macOS user, it is recommended to use [nvm](https://github.com/nvm-sh/nvm) to manage the versions of Node.js; Windows users are recommended to use [nvm-windows](https://github.com/coreybutler/nvm-windows).
:::

This article will use [nvm](https://github.com/nvm-sh/nvm) to install [Node.js](https://nodejs.org/en/) on macOS or Linux environments:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm -v

0.39.1
```

After installing [nvm](https://github.com/nvm-sh/nvm), use the following commands to install [Node.js](https://nodejs.org/en/):

```bash
nvm install 18
nvm use 18
```

After the installation is complete, use the following commands to check if the installation was successful and the correct version was installed:

```bash
node -v

v18.14.0
```

## Dependency Management

After installing Node, the [npm](https://www.npmjs.com/) dependency management tool comes with it, but Umi.js recommends using [pnpm](https://pnpm.io/) for dependency management:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

After the installation is complete, you can use the following command to check if the installation was successful:

```bash
pnpm -v

7.3.0
```

## IDE

After installing [Node.js](https://nodejs.org/en/) and [pnpm](https://pnpm.io/) (or another dependency management tool), you need to choose an IDE or text editor you are comfortable with to write code. If you don't have a preferred IDE yet, you can choose one from the list below:

1. [Visual Studio Code](https://code.visualstudio.com/) (Recommended)
2. [WebStorm](https://www.jetbrains.com/webstorm/) (Recommended)
3. [IntelliJ IDEA](https://www.jetbrains.com/idea/)
4. [Sublime Text](https://www.sublimetext.com/)
5. [Atom](https://atom.io/)

## Next Steps

Congratulations! Your local environment is now ready to start developing Umi.js projects. Go to [boilerplate](boilerplate) to learn how to quickly start a project with the Umi.js scaffold! 🎉
