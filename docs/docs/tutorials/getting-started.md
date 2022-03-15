# 快速上手

## 环境准备

首先得有 node，并确保 node 版本是 14 或以上。（推荐用 [nvm](https://github.com/nvm-sh/nvm) 来管理 node 版本，windows 下推荐用 [nvm-windows](https://github.com/coreybutler/nvm-windows)）

mac 或 linux 下安装 nvm。

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
$ nvm -v
0.39.1
```

安装 node。

```
$ nvm install 16
$ nvm use 16
$ node -v
v16.10.0
```

然后需要包管理工具。node 默认包含 npm，但也可以选择其他方案，

* [pnpm](https://pnpm.io/installation), umi 团队推荐
* [Yarn](https://yarnpkg.com/getting-started/install)

安装 pnpm。

```bash
$ curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
$ pnpm -v
6.27.1
```

## 创建项目

先找个地方建个空目录。

```bash
$ mkdir myapp && cd myapp
```

通过官方工具创建项目，

```bash
$ pnpx create-umi@next
✔ Install the following package: create-umi@next? (Y/n) · true
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

国内建议选 **pnpm + taobao 源**，速度提升明显。这一步会自动安装依赖，同时安装成功后会自动执行 `umi setup` 做一些文件预处理等工作。

## 启动项目

执行 `pnpm dev` 命令，

```bash
$ pnpm dev
ready - App listening at http://127.0.0.1:8000
event - compiled successfully in 1121 ms (388 modules)
event - MFSU compiled successfully in 1308 ms (875 modules)
```

在浏览器里打开 http://localhost:8000/，能看到以下界面，

![](https://img.alicdn.com/imgextra/i2/O1CN01ufcj8M1Lpt1yXd8sy_!!6000000001349-2-tps-1372-1298.png)

## 启用 Prettier（可选）

如果需要用 prettier 做项目代码的自动格式化，执行 `pnpm umi g`，

```bash
$ pnpm umi g
✔ Pick generator type › Enable Prettier -- Enable Prettier
info  - Write package.json
info  - Write .prettierrc
info  - Write .prettierignore
info  - Install dependencies with pnpm
```

## 部署发布

执行 `pnpm build` 命令，

```bash
> umi build
event - compiled successfully in 1179 ms (567 modules)
event - build index.html
```

产物默认会生成到 `./dist` 目录下，

```
./dist
├── index.html
├── umi.css
└── umi.js
```

完成构建后，就可以把 dist 目录部署到服务器上了。
