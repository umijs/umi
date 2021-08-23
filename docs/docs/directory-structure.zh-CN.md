# 目录结构

一个基础的 Umi 项目大致是这样的，

	.
	├── package.json
	├── .umirc.ts
	├── .env
	├── dist
	├── mock
	├── public
	└── src
	    ├── .umi
	    ├── layouts/index.tsx
	    ├── pages
	        ├── index.less
	        └── index.tsx
	    └── app.ts

## 根目录

### package.json

包含插件和插件集，以 `@umijs/preset-`、`@umijs/plugin-`、`umi-preset-` 和 `umi-plugin-` 开头的依赖会被自动注册为插件或插件集。

### .umirc.ts

配置文件，包含 umi 内置功能和插件的配置。

### .env

环境变量。

比如：

	PORT=8888
	COMPRESS=none

### dist 目录

执行 `umi build` 后，产物默认会存放在这里。

### mock 目录

存储 mock 文件，此目录下所有 js 和 ts 文件会被解析为 mock 文件。

### public 目录

此目录下所有文件会被 copy 到输出路径。

## `/src` 目录

### .umi 目录

临时文件目录，比如入口文件、路由等，都会被临时生成到这里。**不要提交 .umi 目录到 git 仓库，他们会在 umi dev 和 umi build 时被删除并重新生成。**

### layouts/index.tsx

约定式路由时的全局布局文件。

### pages 目录

所有路由组件存放在这里。

### app.ts

运行时配置文件，可以在这里扩展运行时的能力，比如修改路由、修改 render 方法等。
