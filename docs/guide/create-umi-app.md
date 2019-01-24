# Create a Project With create-umi

## Introduce create-umi

Umi provides scaffolding through [create-umi](https://github.com/umijs/create-umi), including:

- **project**，general project boilerlate, support choose TypeScript and functions in [umi-plugin-react](../plugin/umi-plugin-react.html)
- **ant-design-pro**, boilerplate only with the layout of [ant-design-pro](https://github.com/ant-design/ant-design-pro), you could add pages with [umi block](./block.html) one by one later
- **block**, boilerlate for umi block
- **plugin**, boilerplate for umi plugin
- **library**, boilerplalte for library, based on [umi-plugin-library](https://github.com/umijs/umi-plugin-library)

## Create umi project

>  You can use create-umi via `yarn create umi` or `npm create umi`. Recommend to use `yarn create`, to make sure use the latest boilerplate everytime.

First, use `yarn create umi` in the new directory.

```bash
$ mkdir myapp && cd myapp
$ yarn create umi
```

>  FAQ: If encounter the problem of **create-umi command not found**, try to execute `yarn global bin`, and add the output to `PATH` environment variable.

Choose `project`.

```bash
? Select the boilerplate type (Use arrow keys)
  ant-design-pro  - Create project with an layout-only ant-design-pro boilerplate, use together with umi block.
❯ app             - Create project with a simple boilerplate, support typescript.
  block           - Create a umi block.
  library         - Create a library with umi.
  plugin          - Create a umi plugin.
```

Confirm if you want to use TypeScript.

```bash
? Do you want to use typescript? (y/N)
```

Then, select the function you need, checkout [plugin/umi-plugin-react](../plugin/umi-plugin-react.html) for the detailed description.

```bash
? What functionality do you want to enable? (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◯ antd
 ◯ dva
 ◯ code splitting
 ◯ dll
```

Once determined, the directories and files will be automatically created based on your selection.

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

Then install the dependencies manually,

```bash
$ yarn
```

Finally, start local development server with `yarn start`.

```bash
$ yarn start
```

If it goes well, open [http://localhost:8000](http://localhost:8000) in the browser and you will see the following ui.

<img src="https://gw.alipayobjects.com/zos/rmsportal/YIFycZRnWWeXBGnSoFoT.png" width="754" />
