import { Tabbed } from 'umi';

# Getting Started

## Environment Setup

First, you need to have Node.js installed, and make sure the Node.js version is 14 or above. (It's recommended to use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions. For Windows, you can use [nvm-windows](https://github.com/coreybutler/nvm-windows))

Install nvm on macOS or Linux:

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
$ nvm -v
0.39.1
```

Install Node.js:

```bash
$ nvm install 16
$ nvm use 16
$ node -v
v16.10.0
```

Next, you need a package management tool. Node.js comes with npm by default, but you can also choose other options:

* [pnpm](https://pnpm.io/installation) (recommended by the Umi team)
* [Yarn](https://yarnpkg.com/getting-started/install)

Install pnpm:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
$ pnpm -v
7.3.0
```

## Create a Project

Start by creating an empty directory:

```bash
$ mkdir myapp && cd myapp
```
Create a project using the official tool:

<Tabbed>

PNPM
```bash
$ pnpm dlx create-umi@latest
✔ Install the following package: create-umi? (Y/n) · true
✔ Pick Npm Client › pnpm
✔ Pick Npm Registry › taobao
Write: .gitignore
Write: .npmrc
Write: .umirc.ts
Copy:  layouts/index.tsx
Write: package.json
Copy:  pages/index.tsx
Copy:  pages/users.tsx
Copy:  pages/users/foo.tsx
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
Copy:  src/assets/yay.jpg
Copy:  src/layouts/index.less
Write: src/layouts/index.tsx
Copy:  src/pages/docs.tsx
Copy:  src/pages/index.tsx
Write: tsconfig.json
Copy:  typings.d.ts
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
Copy:  src/assets/yay.jpg
Copy:  src/layouts/index.less
Write: src/layouts/index.tsx
Copy:  src/pages/docs.tsx
Copy:  src/pages/index.tsx
Write: tsconfig.json
Copy:  typings.d.ts

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
Copy:  src/assets/yay.jpg
Copy:  src/layouts/index.less
Write: src/layouts/index.tsx
Copy:  src/pages/docs.tsx
Copy:  src/pages/index.tsx
Write: tsconfig.json
Copy:  typings.d.ts
yarn install v1.22.18
success Saved lockfile.
$ umi setup
info  - generate files
```
</Tabbed>

Note: Using Bun to initialize the project will be faster, and you need bun version >= `0.4.0`.

For users in China, it's recommended to choose **pnpm + taobao registry** for faster speed. This step will automatically install dependencies and execute `umi setup` after successful installation for some file preprocessing and other tasks.

### Create project from a template

```bash
  # Create an Electron template from @umijs/electron-template
  pnpm create umi --template electron
```

### Parameter Options

When creating a project using `create-umi`, you can use the following options:

option|description
:-:|:-
`--no-git`|Create the project, but don't initialize Git
`--no-install`|Create the project, but don't automatically install dependencies

## Start the Project

Execute the `pnpm dev` command:

```bash
$ pnpm dev
        ╔═════════════════════════════════════════════════════╗
        ║ App listening at:                                   ║
        ║  >   Local: https://127.0.0.1:8000                  ║
ready - ║  > Network: https://192.168.1.1:8000                ║
        ║                                                     ║
        ║ Now you can open browser with the above addresses👆 ║
        ╚═════════════════════════════════════════════════════╝
event - compiled successfully in 1121 ms (388 modules)
event - MFSU compiled successfully in 1308 ms (875 modules)
```

Open your browser and navigate to [http://localhost:8000/](http://localhost:8000/). You should see the following page:

![](https://img.alicdn.com/imgextra/i2/O1CN01ufcj8M1Lpt1yXd8sy_!!6000000001349-2-tps-1372-1298.png)

## Enable Prettier (Optional)

If you want to use Prettier for automatic code formatting, execute `pnpm umi g`:

```bash
$ pnpm umi g
✔ Pick generator type › Enable Prettier -- Enable Prettier
info  - Write package.json
info  - Write .prettierrc
info  - Write .prettierignore
info  - Install dependencies with pnpm
```

## Deploy and Publish

Execute the `pnpm build` command:

```bash
> umi build
event - compiled successfully in 1179 ms (567 modules)
event - build index.html
```

The build output will be generated in the `./dist` directory:

```
./dist
├── index.html
├── umi.css
└── umi.js
```

After completing the build, you can deploy the `dist` directory to your server.