# 通过脚手架创建项目

## 介绍 create-umi

umi 通过 [create-umi](https://github.com/umijs/create-umi) 提供脚手架能力，包含：

* **project**，通用项目脚手架，支持选择是否启用 TypeScript，以及 [umi-plugin-react](../plugin/umi-plugin-react.html) 包含的功能
* **ant-design-pro**，仅包含 [ant-design-pro](https://github.com/ant-design/ant-design-pro) 布局的脚手架，具体页面可通过 [umi block](./block.html) 添加
* **block**，区块脚手架
* **plugin**，插件脚手架
* **library**，依赖（组件）库脚手架，基于 [umi-plugin-library](https://github.com/umijs/umi-plugin-library)

## 创建 umi 项目

> 你可以通过 `yarn create umi` 或 `npm create umi` 使用 create-umi。推荐使用 `yarn create` 命令，能确保每次使用最新的脚手架。

首先，在新目录下使用 `yarn create umi`，

```bash
$ mkdir myapp && cd myapp
$ yarn create umi
```

> FAQ：如果提示 **create-umi 命令不存在**，你需要执行 `yarn global bin`，然后把 global bin 的路径添加到环境变量 `PATH` 中。

选择 project，

```bash
? Select the boilerplate type (Use arrow keys)
  ant-design-pro  - Create project with an layout-only ant-design-pro boilerplate, use together with umi block.
❯ app             - Create project with a simple boilerplate, support typescript.
  block           - Create a umi block.
  library         - Create a library with umi.
  plugin          - Create a umi plugin.
```

选择是否使用 TypeScript，

```bash
? Do you want to use typescript? (y/N)
```

然后，选择你需要的功能，功能介绍详见 [plugin/umi-plugin-react](../plugin/umi-plugin-react.html)，

```bash
? What functionality do you want to enable? (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◯ antd
 ◯ dva
 ◯ code splitting
 ◯ dll
```

确定后，会根据你的选择自动创建好目录和文件，

```bash
   create package.json
   create .gitignore
   create .editorconfig
   create .env
   create .eslintrc
   create .prettierignore
   create .prettierrc
   create .umirc.js
   create mock/.gitkeep
   create src/app.js
   create src/assets/yay.jpg
   create src/global.css
   create src/layouts/index.css
   create src/layouts/index.js
   create src/models/.gitkeep
   create src/pages/index.css
   create src/pages/index.js
   create webpack.config.js
✨  File Generate Done
✨  Done in 161.20s.
```

然后安装依赖，

```bash
$ yarn
```

最后通过 `yarn start` 启动本地开发，

```bash
$ yarn start
```

如果顺利，在浏览器打开 [http://localhost:8000](http://localhost:8000) 可看到以下界面，

<img src="https://gw.alipayobjects.com/zos/rmsportal/YIFycZRnWWeXBGnSoFoT.png" width="754" />
