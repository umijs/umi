---
order: -1
toc: content
translated_at: '2024-03-17T10:30:12.385Z'
---

# Getting Started

## Environment Setup

First, you need to have node installed and make sure your node version is 18 or above. (It's recommended to use [nvm](https://github.com/nvm-sh/nvm) to manage node versions on Mac or Linux, and [nvm-windows](https://github.com/coreybutler/nvm-windows) for Windows users.)

Install nvm on Mac or Linux.

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
$ nvm -v
0.39.1
```

Install node.

```
$ nvm install 18
$ nvm use 18
$ node -v
v18.10.0
```

Then you need a package management tool. While npm comes with node by default, you can also choose other options,

- [pnpm](https://pnpm.io/installation), recommended by the umi team
- [Yarn](https://yarnpkg.com/getting-started/install)

Install pnpm.

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
$ pnpm -v
7.3.0
```

## Create a Project

Create a project using the official tool,

PNPM

```bash
$ pnpm dlx create-umi@latest
✔ Install the following package: create-umi? (Y/n) · true
✔ Pick Npm Client › pnpm
✔ Pick Npm Registry › taobao
Write: .gitignore
Write: .npmrc
Write: .umirc.ts
Copy: layouts/index.tsx
Write: package.json
Copy: pages/index.tsx
Copy: pages/users.tsx
Copy: pages/users/foo.tsx
> @ postinstall /private/tmp/sorrycc-vylwuW
> umi setup
info  - generate files
```

BUN

```bash
$ bunx create-umi
✔ Pick Umi App Template › Simple App
✔ Pick Npm Client › pnpm
✔ Pick Npm Registry › npm
Write: .gitignore
Write: .npmrc
Write: .umirc.ts
Write: package.json
Copy: src/assets/yay.jpg
Copy: src/layouts/index.less
Write: src/layouts/index.tsx
Copy: src/pages/docs.tsx
Copy: src/pages/index.tsx
Write: tsconfig.json
Copy: typings.d.ts
ready - Git initialized successfully
```

NPM

```bash
$ npx create-umi@latest
Need to install the following packages:
  create-umi@latest
Ok to proceed? (y) y
✔ Pick Umi App Template › Simple App
✔ Pick Npm Client › npm
✔ Pick Npm Registry › taobao
Write: .gitignore
Write: .npmrc
Write: .umirc.ts
Write: package.json
Copy: src/assets/yay.jpg
Copy: src/layouts/index.less
Write: src/layouts/index.tsx
Copy: src/pages/docs.tsx
Copy: src/pages/index.tsx
Write: tsconfig.json
Copy: typings.d.ts

> postinstall
> umi setup
```

YARN

```bash
$ yarn create umi
success Installed "create-umi@4.0.6" with binaries:
      - create-umi
✔ Pick Umi App Template › Simple App
✔ Pick Npm Client › yarn
✔ Pick Npm Registry › taobao
Write: .gitignore
Write: .npmrc
Write: .umirc.ts
Write: package.json
Copy: src/assets/yay.jpg
Copy: src/layouts/index.less
Write: src/layouts/index.tsx
Copy: src/pages/docs.tsx
Copy: src/pages/index.tsx
Write: tsconfig.json
Copy: typings.d.ts
yarn install v1.22.18
success Saved lockfile.
$ umi setup
info  - generate files
```

Note: Initializing a project with bun is faster, requires bun >= `0.4.0` version.

For users in China, it's advised to choose **pnpm + taobao source** for a significant speed increase. This step will automatically install dependencies, and after installation, `umi setup` will execute to perform some file preprocessing, etc.

### Creating a Project From a Template

```bash
  # Create an electron template project from @umijs/electron-template
  pnpm create umi --template electron
```

### Command Options

The following options are available when creating a project with `create-umi`:

|     option     | description                |
| :------------: | :------------------------- |
|   `--no-git`   | Create a project without initializing Git   |
| `--no-install` | Create a project without automatically installing dependencies |

## Start the Project

Run the `pnpm dev` command,

```bash
$ pnpm dev
        ╔═════════════════════════════════════════════════════╗
        ║ App listening at:                                   ║
        ║  > Local: https://127.0.0.1:8000                  ║
ready - ║  > Network: https://192.168.1.1:8000                ║
        ║                                                     ║
        ║ Now you can open a browser with the above addresses👆 ║
        ╚═════════════════════════════════════════════════════╝
event - compiled successfully in 1121 ms (388 modules)
event - MFSU compiled successfully in 1308 ms (875 modules)
```

Open [http://localhost:8000/](http://localhost:8000/) in your browser, and you will see the following interface,

![](https://img.alicdn.com/imgextra/i2/O1CN01ufcj8M1Lpt1yXd8sy_!!6000000001349-2-tps-1372-1298.png)

## Enable Prettier (Optional)

If you want to use prettier to automatically format your project's code, execute `pnpm umi g`,

```bash
$ pnpm umi g
✔ Pick generator type › Enable Prettier -- Enable Prettier
info  - Write package.json
info  - Write .prettierrc
info  - Write .prettierignore
info  - Install dependencies with pnpm
```

## Deploy and Publish

Run the `pnpm build` command,

```bash
> umi build
event - compiled successfully in 1179 ms (567 modules)
event - build index.html
```

The build artifacts will by default be generated in the `./dist` directory,

```
./dist
├── index.html
├── umi.css
└── umi.js
```

After building, you can deploy the dist directory to your server.
