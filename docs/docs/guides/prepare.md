import { Message } from 'umi';

# Dev Environment

This article will guide you through setting up a local development environment for a Umi.js project from scratch.

## Node.js

Umi.js requires [Node.js](https://nodejs.org/) for development, so please make sure you have Node.js installed on your computer with a version of 14 or above.

<Message emoji="💡">
If you are a macOS user, it's recommended to use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
For Windows users, it's recommended to use [nvm-windows](https://github.com/coreybutler/nvm-windows).
</Message>

This article assumes you're using macOS or Linux and will show you how to install [Node.js](https://nodejs.org/) using [nvm](https://github.com/nvm-sh/nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm -v

0.39.1
```

After installing [nvm](https://github.com/nvm-sh/nvm), use the following commands to install [Node.js](https://nodejs.org/):

```bash
nvm install 16
nvm use 16
```

After installation, use the following command to check if the installation was successful and if the correct version is installed:

```bash
node -v

v16.14.0
```

## Dependency Management

After installing Node, you'll have the [npm](https://www.npmjs.com/) dependency management tool. However, Umi.js recommends using [pnpm](https://pnpm.io/) to manage dependencies:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

After installation, you can use the following command to check if the installation was successful:

```bash
pnpm -v

7.3.0
```

## IDE

Once you've installed [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) (or other dependency management tools), you'll need an IDE or text editor to write your code. If you don't have a preferred IDE, you can choose one from the list below:

1. [Visual Studio Code](https://code.visualstudio.com/) (recommended)
2. [WebStorm](https://www.jetbrains.com/webstorm/) (recommended)
3. [IntelliJ IDEA](https://www.jetbrains.com/idea/)
4. [Sublime Text](https://www.sublimetext.com/)
5. [Atom](https://atom.io/)

## Next Steps

Congratulations! Your local environment is ready to start developing Umi.js projects. Head over to [Boilerplate](boilerplate) to learn how to quickly start a project using the Umi.js scaffold 🎉