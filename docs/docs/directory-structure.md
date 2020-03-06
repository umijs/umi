# Directory structure


A fundamental structure as below:

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

## Root

### package.json

All dependencies start with `@umijs/preset-`、`@umijs/plugin-`、`umi-preset-`、`umi-plugin-` wwill be registered as plugin/plugin-preset.

### .umirc.ts

Configuration file, consist of configurations for builtin/plugin provided functions.

### .env

Environments

For example：

	PORT=8888
	COMPRESS=none

### dist

Default location of outpput of `umi build`

### mock

All `.js`、`.ts` files will be registered as `mock`.

### public

All files in this directory will be copied to `dist`.

## `/src`

### .umi

Auto-generated directory, such as entry point, routes..., will be generated here. **Do not commit `.umi` to your `git` repo, since they will be re-generated as `umi dev` or `umi build` running.**

### layouts/index.tsx

Layout module for convention routing pattern.

### pages

All router entries here.

### app.ts

Runtime configuration module, provide expansibility at runtime. Such as router, render update.

