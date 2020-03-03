---
translateHelp: true
---

# Directory structure

A basic Umi project looks like this

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

## Root directory

### package.json

Includes plug-ins and plug-ins set to `@umijs/preset-`、`@umijs/plugin-`、`umi-preset-` and `umi-plugin-` prefix will be automatically registered as a plug-in or plug-ins.

### .umirc.ts

A configuration file containing the configuration of umi's built-in functions and plugins.

### .env

Environment variable such as:

	PORT=8888
	COMPRESS=none

### dist directory

Execute `umi build` and the built app (distribution) will be stored in `dist` by default.

### mock directory

Stores mock files. All `js` and `ts` files in this directory will be parsed as mock files.

### public directory

All files in this directory will be copied to the output path.

## `/src` folder

### .umi directory

Temporary file directories, such as entry files and routes, will be temporarily generated here. Don't commit the .umi directory to the git repository, they will be deleted and rebuilt during umi dev and umi build.

### layouts/index.tsx

Global routing file for conventional routing.

### pages directory

All routing components are stored here.

### app.ts

Runtime configuration files, where you can extend runtime capabilities, such as modifying routes and modifying render methods.
